import { Queue } from 'bullmq';
import { IngestWorkerType } from './ingest/types';
import { INGEST_QUEUE_NAME, redisConnection } from './shared';

export const ingestQueue = new Queue<IngestWorkerType>(INGEST_QUEUE_NAME, {
  connection: redisConnection,
  prefix: '{slayer:ingest}',
});
