import { asc } from 'drizzle-orm';
import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { client } from '../../database/client';
import { tTokens } from '../../database/schema';

export default async function (fastify: FastifyInstance) {
  fastify.withTypeProvider<ZodTypeProvider>().get(
    '/tokens',
    {
      //   schema: {
      //     querystring: z.object({
      //       cursor: z.string().optional(),
      //       limit: z.number().min(1).max(100).default(100).optional(),
      //     }),
      //   },
    },
    async () => {
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
        orderBy: asc(tTokens.address),
      });

      return { data: items };
    },
  );
}
