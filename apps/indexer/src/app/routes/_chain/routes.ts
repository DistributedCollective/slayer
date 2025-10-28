import { and, asc, eq, gte, inArray } from 'drizzle-orm';
import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import gql from 'graphql-tag';
import { chains } from '../../../configs/chains';
import { client } from '../../../database/client';
import { tTokens } from '../../../database/schema';
import { tTokensSelectors } from '../../../database/selectors';
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

      const items = await queryFromSubgraph<{
        pools: Array<{
          id: string;
          reserves: {
            id: string;
            totalLiquidity: string;
            underlyingAsset: string;
            usageAsCollateralEnabled: boolean;
            borrowingEnabled: boolean;
          }[];
        }>;
      }>(
        chain.aaveSubgraphUrl,
        gql`
          query {
            pools {
              id
              reserves {
                id
                totalLiquidity
                underlyingAsset
                usageAsCollateralEnabled
                borrowingEnabled
              }
            }
          }
        `,
      ).then((data) => data.pools.flatMap((pool) => pool.reserves));

      const tokens = await client.query.tTokens.findMany({
        columns: tTokensSelectors.columns,
        where: and(
          eq(tTokens.chainId, req.chain.chainId),
          inArray(
            tTokens.address,
            items.map((i) => i.underlyingAsset),
          ),
        ),
      });

      return {
        data: items
          .map((item) => ({
            ...item,
            token: tokens.find((t) => t.address === item.underlyingAsset),
          }))
          .filter((i) => i.token),
        nextCursor: null,
        count: items.length,
      };
    },
  );
}
