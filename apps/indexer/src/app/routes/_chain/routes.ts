import { and, asc, eq, gte } from 'drizzle-orm';
import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import gql from 'graphql-tag';
import { chains } from '../../../configs/chains';
import { client } from '../../../database/client';
import { tTokens } from '../../../database/schema';
import { queryFromSubgraph } from '../../../libs/loaders/subgraph';
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
    },
    async (req) => {
      const items = await client.query.tTokens.findMany({
        columns: {
          identifier: true,
          address: true,
          symbol: true,
          name: true,
          decimals: true,
          logoUrl: true,
          chainId: true,
        },
        orderBy: asc(tTokens.identifier),
        where: and(
          eq(tTokens.chainId, req.chain.chainId),
          req.query.cursor
            ? gte(tTokens.identifier, req.query.cursor)
            : undefined,
        ),
        limit: req.query.limit,
      });

      return paginationResponse(items, req.query.limit, 'identifier');
    },
  );

  fastify.withTypeProvider<ZodTypeProvider>().get(
    '/m',
    {
      schema: {
        querystring: paginationSchema,
      },
    },
    async (req, reply) => {
      if (req.chain.key !== 'bob-sepolia') {
        return reply.notFound(
          'Money Market data is only available for BOB Sepolia',
        );
      }

      const chain = chains.get('bob-sepolia');

      const items = await queryFromSubgraph<{ pools: Array<{ id: string }> }>(
        chain.aaveSubgraphUrl,
        gql`
          query {
            pools {
              id
              reserves {
                id
                symbol
                decimals
                totalLiquidity
              }
            }
          }
        `,
      ).then((data) => data.pools);

      return { data: items };
    },
  );
}
