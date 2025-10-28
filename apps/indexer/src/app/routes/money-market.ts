import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import gql from 'graphql-tag';
import { chains } from '../../configs/chains';
import { queryFromSubgraph } from '../../libs/loaders/subgraph';

export default async function (fastify: FastifyInstance) {
  fastify.withTypeProvider<ZodTypeProvider>().get(
    '/money-market',
    {
      //   schema: {
      //     querystring: z.object({
      //       cursor: z.string().optional(),
      //       limit: z.number().min(1).max(100).default(100).optional(),
      //     }),
      //   },
    },
    async () => {
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
