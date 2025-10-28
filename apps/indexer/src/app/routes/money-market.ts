import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

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
      //   const items = await queryFromSubgraph(ENV.)

      return { data: items };
    },
  );
}
