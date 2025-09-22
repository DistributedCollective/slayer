import IORedis from 'ioredis';
import { ENV } from '../env';

export const redisConnection = new IORedis(ENV.REDIS_URL, {
  maxRetriesPerRequest: null,
});

export const INGEST_QUEUE_NAME = 'ingest';
