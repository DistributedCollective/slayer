import IORedis, { RedisOptions } from 'ioredis';

export function createRedisConnection(
  REDIS_URL: string,
  CLUSTER_MODE = false,
  opts: RedisOptions = {},
) {
  const u = new URL(REDIS_URL);

  // Common options (apply to every node connection)
  const redisOptions: RedisOptions = {
    // ACL (Redis 6+). If you don't use ACLs, omit username.
    username: u.username || undefined,
    password: u.password || undefined,
    // TLS for rediss://
    tls: u.protocol === 'rediss:' ? {} : undefined,
    // Often desirable in server apps (avoid request-level timeouts)
    maxRetriesPerRequest: null,
    ...opts,
  };

  if (CLUSTER_MODE) {
    const seed = [{ host: u.hostname, port: Number(u.port || 6379) }];

    return new IORedis.Cluster(seed, {
      dnsLookup: (addr, cb) => cb(null, addr),
      redisOptions,
    });
  }

  // For single-instance (cluster mode disabled), this would be:
  return new IORedis(REDIS_URL, redisOptions);
}
