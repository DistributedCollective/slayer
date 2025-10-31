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

  ingestWorker.on('ready', () => {
    log.info('Ingest worker is ready to process jobs.');
  });

  ingestWorker.on('paused', () => {
    log.info('Ingest worker has been paused.');
  });

  ingestWorker.on('resumed', () => {
    log.info('Ingest worker has been resumed.');
  });

  onShutdown(async () => {
    log.info('Shutting down ingest worker.');
    await ingestWorker
      .close()
      .then(() => {
        log.info('Ingest worker shut down complete.');
      })
      .catch((err) => {
        log.error({ err }, 'Error during ingest worker shutdown.');
      });
  });

  onReady(async () => {
    log.info('Starting ingest worker.');
    await ingestWorker
      .run()
      .then(() => {
        log.info('Ingest worker is ready.');
      })
      .catch((err) => {
        log.error({ err }, 'Ingest worker failed to start.');
      });
  });
} else {
  logger.info('READ-ONLY mode enabled, not starting workers.');
}
