import { FastifyInstance, FastifyRequest } from 'fastify';
import { Chain, chains, ChainSelector } from '../../../configs/chains';

declare module 'fastify' {
  interface FastifyRequest {
    chain: Chain;
  }
}

type ChainParams = { chain: ChainSelector };

export default async function (fastify: FastifyInstance) {
  fastify.addHook(
    'onRequest',
    async (req: FastifyRequest<{ Params: ChainParams }>, reply) => {
      const chain = chains.get(req.params.chain);
      if (chain) {
        req.chain = chain;
      } else {
        reply.notFound(`Chain not found: ${req.params.chain}`);
      }
    },
  );
}
