import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { FastifyAdapter } from '@bull-board/fastify';
import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { ENV } from '../../env';
import { ingestQueue } from '../../workers/queues';

export default fp(
  async function (fastify: FastifyInstance) {
    if (ENV.isProd && !ENV.FLAGS.includes('ui')) {
      // only show UI in non-prod environments
      return;
    }
    const serverAdapter = new FastifyAdapter();
    serverAdapter.setBasePath('/ui');

    createBullBoard({
      queues: [ingestQueue].map((q) => new BullMQAdapter(q)),
      serverAdapter,
    });

    fastify.register(serverAdapter.registerPlugin(), { prefix: '/ui' });
  },
  { name: 'bullmq-ui' },
);
