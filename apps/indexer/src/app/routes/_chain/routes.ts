import { and, asc, eq, gte } from 'drizzle-orm';
import { FastifyInstance, FastifyRequest } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';
import { client } from '../../../database/client';
import { tTokens } from '../../../database/schema';
import { tTokensSelectors } from '../../../database/selectors';
import {
  fetchPoolList,
  fetchPoolReserves,
} from '../../../libs/loaders/money-market';
import { paginationResponse, paginationSchema } from '../../../libs/pagination';

export default async function (fastify: FastifyInstance) {
  fastify.get('/', async (req) => {
    return { data: req.chain };
  });

  fastify.withTypeProvider<ZodTypeProvider>().get(
    '/tokens',
    {
      schema: {
        querystring: paginationSchema,
      },
      config: {
        cache: {
          key: (req) => `chain:${req.chain.chainId}:tokens`,
          ttlSeconds: 30,
          enabled: true,
        },
      },
    },
    async (req) => {
      const items = await client.query.tTokens.findMany({
        columns: tTokensSelectors.columns,
        orderBy: asc(tTokens.address),
        where: and(
          eq(tTokens.chainId, req.chain.chainId),
          req.query.cursor ? gte(tTokens.address, req.query.cursor) : undefined,
        ),
        limit: req.query.limit,
      });

      return paginationResponse(items, req.query.limit, 'address');
    },
  );

  fastify.withTypeProvider<ZodTypeProvider>().get(
    '/money-market',
    {
      config: {
        cache: true,
      },
    },
    async (req, reply) => {
      try {
        const data = await fetchPoolList(req.chain.chainId);
        return { data };
      } catch (err) {
        fastify.log.error(
          { err, chainId: req.chain.chainId },
          `error: fetchMoneyMarketByChain`,
        );
        return reply.notFound(
          'Money Market data is not available for this chain',
        );
      }
    },
  );

  fastify.withTypeProvider<ZodTypeProvider>().get(
    '/money-market/:pool',
    {
      schema: {
        querystring: paginationSchema,
        params: z.object({
          pool: z.string(),
        }),
      },
    },
    async (req: FastifyRequest<{ Params: { pool: string } }>, reply) => {
      const pools = await fetchPoolList(req.chain.chainId);
      const pool = pools.find(
        (p) => p.address.toLowerCase() === req.params.pool.toLowerCase(),
      );

      if (!pool) {
        return reply.notFound('Pool not found');
      }

      const reserves = await fetchPoolReserves(req.chain.chainId, pool);

      return { data: reserves };

      // const tokens = await client.query.tTokens.findMany({
      //   columns: tTokensSelectors.columns,
      //   where: and(
      //     eq(tTokens.chainId, req.chain.chainId),
      //     inArray(
      //       tTokens.address,
      //       items.map((i) => i.underlyingAsset),
      //     ),
      //   ),
      // });

      // return {
      //   data: items
      //     .map((item) => ({
      //       ...item,
      //       token: tokens.find((t) => t.address === item.underlyingAsset),
      //     }))
      //     .filter((i) => i.token),
      //   nextCursor: null,
      //   count: items.length,
      // };
    },
  );
}
