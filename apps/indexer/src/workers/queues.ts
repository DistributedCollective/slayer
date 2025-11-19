import { Queue } from 'bullmq';
import { IngestWorkerType } from './ingest/types';
import { INGEST_QUEUE_NAME, queueRedisConnection } from './shared';

export const ingestQueue = new Queue<IngestWorkerType>(INGEST_QUEUE_NAME, {
  connection: queueRedisConnection,
  prefix: '{slayer:ingest}',
});
