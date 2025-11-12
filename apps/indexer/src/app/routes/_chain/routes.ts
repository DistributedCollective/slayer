import { and, asc, eq, gte, inArray } from 'drizzle-orm';
import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import gql from 'graphql-tag';
import z from 'zod';
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
      const { cursor, limit } = req.query;

      const data = await queryFromSubgraph<{
        pools: Array<{
          id: string;
          pool: string;
        }>;
      }>(
        chain.aaveSubgraphUrl,
        gql`
          query ($first: Int!, $cursor: String) {
            pools(first: $first, where: { id_gt: $cursor }) {
              id
              pool
              addressProviderId
              poolCollateralManager
              poolImpl
              poolDataProviderImpl
              poolConfigurator
              proxyPriceProvider
              lastUpdateTimestamp
              bridgeProtocolFee
              flashloanPremiumTotal
              flashloanPremiumToProtocol
            }
          }
        `,
        {
          first: limit,
          cursor: cursor ?? '',
        },
      );

      const items = data.pools.map((p) => ({
        pool: p.pool,
        addressProvider: p.id,
      }));

      return paginationResponse(items, limit, 'addressProvider');
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
    async (req, reply) => {
      if (req.chain.key !== 'bob-sepolia') {
        return reply.notFound(
          'Money Market data is only available for BOB Sepolia',
        );
      }

      const chain = chains.get('bob-sepolia');
      const { pool } = req.params;
      const { cursor, limit } = req.query;

      const data = await queryFromSubgraph<{
        reserves: Array<{
          id: string;
          totalLiquidity: string;
          underlyingAsset: string;
          usageAsCollateralEnabled: boolean;
          borrowingEnabled: boolean;
          pool: {
            id: string;
            pool: string;
          };
        }>;
      }>(
        chain.aaveSubgraphUrl,
        gql`
          query ($pool: String!, $first: Int!, $cursor: String) {
            reserves(
              first: $first
              where: { pool_: { id: $pool }, id_gt: $cursor }
            ) {
              underlyingAsset
              pool {
                id
                pool
              }
              symbol
              name
              decimals
              usageAsCollateralEnabled
              borrowingEnabled
              totalLiquidity
              totalATokenSupply
              totalLiquidityAsCollateral
              availableLiquidity
              totalSupplies
              liquidityRate
            }
          }
        `,
        {
          pool,
          first: limit,
          cursor: cursor ?? '',
        },
      );

      const items = data.reserves;

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

      const merged = items
        .map((item) => ({
          ...item,
          token: tokens.find((t) => t.address === item.underlyingAsset),
        }))
        .filter((i) => i.token);

      return paginationResponse(merged, limit, 'id');
    },
  );
}
