import { FastifyInstance } from 'fastify';
import { chains } from '../../configs/chains';

export default async function (fastify: FastifyInstance) {
  fastify.get('/', async function () {
    return { data: chains.list() };
  });
}
