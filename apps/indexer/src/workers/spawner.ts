import { Worker } from 'bullmq';
import path from 'path';
import { ENV } from '../env';
import { logger } from '../libs/logger';
import { onShutdown } from '../libs/shutdown';
import { onReady } from '../libs/startup';
import fn from './ingest/processor';
import { INGEST_QUEUE_NAME, redisConnection } from './shared';

if (!ENV.READ_ONLY_MODE) {
  const log = logger.child({ module: 'worker-spawner' });

  const ingestWorker = new Worker(
    INGEST_QUEUE_NAME,
    ENV.isDev ? fn : path.resolve(__dirname, `ingest/processor.js`),
    {
      connection: redisConnection,
      useWorkerThreads: true,
      removeOnComplete: {
        age: 3600, // keep for 1 hour
        count: 100, // keep last 100 completed jobs
      },
      removeOnFail: {
        age: 86400, // keep for 1 day
        count: 1000,
      },
      concurrency: 4,
    },
  );

  onShutdown(async () => {
    log.info('Shutting down ingest worker.');
    await ingestWorker.close();
  });

  onReady(async () => {
    await ingestWorker.run();
    log.info('Ingest worker is ready.');
  });
}
