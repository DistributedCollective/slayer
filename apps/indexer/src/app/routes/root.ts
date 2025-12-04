import { chains } from '../../configs/chains';
import { ZodFastifyInstance } from '../../libs/server';

export default async function (fastify: ZodFastifyInstance) {
  fastify.get('/', async function () {
    return { data: chains.list() };
  });
}
