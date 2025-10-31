import pino, { LoggerOptions } from 'pino';
import { ENV } from '../env';

const envLogger: Record<string, LoggerOptions> = {
  development: {
    name: 'slayer-indexer',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
  },
  production: {
    name: 'slayer-indexer',
    timestamp: pino.stdTimeFunctions.isoTime,
  },
};

export const logger = pino(envLogger[ENV.NODE_ENV] || true);
