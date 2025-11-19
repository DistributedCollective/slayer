import { ENV } from '../env';
import { createRedisConnection } from '../libs/utils/redis';

export const queueRedisConnection = createRedisConnection(
  ENV.REDIS_URL,
  ENV.REDIS_CLUSTER_MODE,
);

export const INGEST_QUEUE_NAME = 'ingest';
