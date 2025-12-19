import type {
  FastifyInstance,
  FastifyPluginAsync,
  FastifyReply,
  FastifyRequest,
} from 'fastify';
import fp from 'fastify-plugin';
import { ENV } from '../../env';
import { encode } from '../../libs/encode';
import { logger } from '../../libs/logger';
import { createRedisConnection } from '../../libs/utils/redis';

// Custom JSON serialization to handle BigInt values
function serializeWithBigInt(value: unknown): string {
  return JSON.stringify(value, (key, val) => {
    if (typeof val === 'bigint') {
      return { __type: 'bigint', value: val.toString() };
    }
    return val;
  });
}

function deserializeWithBigInt<T>(json: string): T {
  return JSON.parse(json, (key, val) => {
    if (val && typeof val === 'object' && val.__type === 'bigint') {
      return BigInt(val.value);
    }
    return val;
  });
}

const cacheRedisConnection = createRedisConnection(
  ENV.REDIS_URL,
  ENV.REDIS_CLUSTER_MODE,
  {
    keyPrefix: 'indexer-cache:',
  },
);

type RedisClient = ReturnType<typeof createRedisConnection>;

export type RouteCacheOptions = {
  /** Enable/disable cache for this route (default: true if cache is set) */
  enabled?: boolean;
  /** TTL for this route in seconds (default: plugin defaultTtlSeconds or 60) */
  ttlSeconds?: number;
  /**
   * Serve stale responses for this many extra seconds while
   * a background refresh runs (stale-while-revalidate window).
   */
  staleTtlSeconds?: number;
  /**
   * Enable/disable background revalidation (default: true if staleTtlSeconds set).
   */
  backgroundRevalidate?: boolean;
  /** Build a custom cache key based on request */
  key?: (req: FastifyRequest<any, any, any, any>) => string;
};

export type RedisCachePluginOptions = {
  /** Existing Redis client instance (if you already manage it elsewhere) */
  redisClient?: RedisClient;
  /** Or pass Redis URL, e.g. redis://localhost:6379 */
  redisUrl?: string;
  /** Default TTL in seconds for all cached routes */
  defaultTtlSeconds?: number;
  /** Default stale TTL in seconds for all cached routes */
  defaultStaleTtlSeconds?: number;
  /** Prefix for all cache keys */
  keyPrefix?: string;
};

type CacheEntry = {
  payload: unknown;
  headers?: Record<string, unknown>;
  statusCode: number;
  storedAt: number; // ms since epoch
  ttlSeconds: number;
};

declare module 'fastify' {
  interface FastifyInstance {
    cacheRedis: RedisClient;
  }

  interface FastifyRequest {
    __cacheKey?: string;
    __cacheHit?: boolean;
  }

  //   interface RouteShorthandOptions {
  //     /**
  //      * If present, enables response caching for this route (default false).
  //      * - `true` -> use defaults
  //      * - `false` -> no cache
  //      * - object -> fine-grained control
  //      */
  //     cache?: RouteCacheOptions | boolean;
  //   }

  interface FastifyContextConfig {
    /**
     * If present, enables response caching for this route (default false).
     * - `true` -> use defaults
     * - `false` -> no cache
     * - object -> fine-grained control
     */
    cache?: RouteCacheOptions | boolean;
  }
}

const redisCachePlugin: FastifyPluginAsync<RedisCachePluginOptions> = async (
  fastify: FastifyInstance,
  opts: RedisCachePluginOptions,
) => {
  const redis = opts.redisClient ?? cacheRedisConnection;

  const defaultTtl = opts.defaultTtlSeconds ?? 10; // 10 seconds
  const defaultStaleTtl = opts.defaultStaleTtlSeconds ?? 60; // 1 minute
  const keyPrefix = opts.keyPrefix ?? 'route-cache';

  // @ts-expect-error declare decorator
  fastify.decorate('cacheRedis', redis);

  const getRouteCacheConfig = (
    req: FastifyRequest,
  ): RouteCacheOptions | null => {
    const rawCfg = req.routeOptions.config.cache;
    if (!rawCfg || ENV.NO_CACHE) return null;

    if (typeof rawCfg === 'boolean') {
      if (!rawCfg) return null;
      return { enabled: true };
    }

    if (rawCfg.enabled === false) return null;

    return { enabled: true, ...rawCfg };
  };

  // 1) Try to serve from cache
  fastify.addHook(
    'preHandler',
    async (req: FastifyRequest, reply: FastifyReply) => {
      const cfg = getRouteCacheConfig(req);

      if (!cfg) return;

      // Internal revalidation request: do not serve from cache
      if (req.headers['x-cache-revalidate'] === '1') {
        return;
      }

      const ttl = cfg.ttlSeconds ?? defaultTtl;
      const staleTtl = cfg.staleTtlSeconds ?? defaultStaleTtl;
      const routeUrl =
        req.routeOptions.url ?? req.raw.url?.split('?')[0] ?? 'unknown';

      const key =
        keyPrefix +
        ':' +
        (cfg.key?.(req) ??
          encode.sha256(
            `${routeUrl}:${req.raw.method}:` +
              `${JSON.stringify(req.params ?? {})}:${JSON.stringify(req.query ?? {})}:${JSON.stringify(req.body ?? {})}`,
          ));

      req.__cacheKey = key;

      const cached = await redis.get(key);
      if (!cached) return;

      const entry: CacheEntry = deserializeWithBigInt(cached);
      const ageSec = (Date.now() - entry.storedAt) / 1000;

      const isFresh = ageSec <= entry.ttlSeconds;
      const isWithinStale =
        !isFresh && staleTtl > 0 && ageSec <= entry.ttlSeconds + staleTtl;

      if (!isFresh && !isWithinStale) {
        // Hard expired: ignore cache
        return;
      }

      req.__cacheHit = true;

      if (entry.headers) {
        for (const [hKey, hVal] of Object.entries(entry.headers)) {
          // do not override critical hop-by-hop headers if you don't want to
          if (hKey.toLowerCase() === 'content-length') continue;
          if (hKey.toLowerCase() === 'x-cache') continue;
          reply.header(hKey, hVal);
        }
      }

      reply.header('x-cache', isFresh ? 'HIT' : 'HIT-STALE');
      reply.code(entry.statusCode);
      reply.send(entry.payload);

      // Background revalidation for stale entries
      if (isWithinStale && (cfg.backgroundRevalidate ?? true)) {
        const lockKey = `${key}:revalidate-lock`;
        const lockTtl = Math.max(5, Math.floor(ttl / 2)); // seconds

        // Try to acquire revalidation lock
        try {
          const lockResult = await redis.setnx(lockKey, '1');
          if (lockResult === 1) {
            await redis.expire(lockKey, lockTtl);
            // Fire-and-forget background refresh
            (async () => {
              try {
                await fastify.inject({
                  // @ts-expect-error bad type
                  method: req.raw.method,
                  url: req.raw.url ?? routeUrl,
                  // @ts-expect-error bad type
                  payload: req.body,
                  // @ts-expect-error bad type
                  query: req.query,
                  headers: {
                    ...req.headers,
                    'x-cache-revalidate': '1',
                  },
                });
              } finally {
                // Let the lock expire naturally; optional explicit delete:
                // await redis.del(lockKey);
              }
            })().catch((err) => {
              fastify.log.error({ err }, 'cache revalidation failed');
            });
          }
        } catch (err) {
          fastify.log.error({ err }, 'failed to acquire revalidate lock');
        }
      }
    },
  );

  // 2) Store response into cache
  fastify.addHook(
    'onSend',
    async (req: FastifyRequest, reply: FastifyReply, payload) => {
      const rawCfg = req.routeOptions.config.cache;
      if (!rawCfg) return payload;

      const cfg: RouteCacheOptions =
        typeof rawCfg === 'boolean' ? { enabled: rawCfg } : rawCfg;

      if (cfg.enabled === false || ENV.NO_CACHE) return payload;

      if (req.__cacheHit) {
        return payload;
      }

      const key = req.__cacheKey;

      if (!key) return payload;

      // By default, don't cache server error responses (5xx)
      if (reply.statusCode >= 500) return payload;

      const ttl = cfg.ttlSeconds ?? defaultTtl;

      const headers = reply.getHeaders() as Record<string, unknown>;
      for (const h of Object.keys(headers)) {
        if (h.toLowerCase() === 'x-cache') {
          delete headers[h];
        }
      }

      const entry: CacheEntry = {
        payload,
        headers,
        statusCode: reply.statusCode,
        storedAt: Date.now(),
        ttlSeconds: ttl,
      };

      const expireSeconds = ttl + (cfg.staleTtlSeconds ?? defaultStaleTtl);

      await redis.setex(key, expireSeconds, serializeWithBigInt(entry));

      // For "real" client requests (not internal revalidation), set MISS header
      if (req.headers['x-cache-revalidate'] !== '1') {
        reply.header('x-cache', 'MISS');
      }

      return payload;
    },
  );
};

export const maybeCache = async <T = unknown>(
  key: string,
  fn: () => Promise<T>,
  opts: Pick<RouteCacheOptions, 'ttlSeconds' | 'enabled'> = {},
): Promise<T> => {
  const enabled = opts.enabled ?? true;

  if (!enabled || ENV.NO_CACHE) {
    return fn();
  }

  const redis = cacheRedisConnection;

  const ttl = opts.ttlSeconds ?? 10; // 10 seconds

  const cacheKey = 'maybe-cache:fn:' + encode.sha256(key);

  const cached = await redis.get(cacheKey);

  if (cached) {
    const entry: CacheEntry = deserializeWithBigInt(cached);
    const ageSec = (Date.now() - entry.storedAt) / 1000;

    const isFresh = ageSec <= entry.ttlSeconds;

    logger.info({ key, ageSec, ttl: entry.ttlSeconds }, 'Cache hit');

    if (isFresh) {
      return entry.payload as T;
    }
  }

  logger.info({ key }, 'Cache miss, invoking function');

  const entry = {
    payload: await fn(),
    headers: {},
    statusCode: 200,
    storedAt: Date.now(),
    ttlSeconds: ttl,
  };

  await redis.setex(cacheKey, ttl, serializeWithBigInt(entry));

  return entry.payload as T;
};

export default fp(redisCachePlugin, {
  name: 'cache-plugin',
});
