import cors from '@fastify/cors';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import Fastify from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod';
import path from 'node:path';
import { slayerShared } from 'slayer-shared';
import { app } from './app/app';
import { client } from './database/client';
import { ENV } from './env';
import { logger } from './libs/logger';
import { onShutdown } from './libs/shutdown';
import { notifyReady, onReady } from './libs/startup';

logger.info('test sdk' + slayerShared());

// Instantiate Fastify with some config
const server = Fastify({
  loggerInstance: logger,
  disableRequestLogging: true,
  trustProxy: true,
});

server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

// Enable CORS with the given origins.
server.register(cors, {
  origin: ENV.CORS_ORIGINS,
  strictPreflight: false,
});

// Register your application as a normal plugin.
server.register(app);

(async () => {
  if (ENV.isProduction) {
    // Run database migrations in production
    // await migrate(); --- IGNORE ---
    logger.info('Running in production mode');

    logger.info(
      { path: path.resolve(__dirname, '../drizzle') },
      'Migrating DB',
    );

    await migrate(client, {
      migrationsFolder: path.resolve(__dirname, '../drizzle'),
    });

    logger.info('Database migrated');
  } else {
    logger.info(`Running in ${ENV.NODE_ENV} mode`);
  }

  await server.listen({
    port: ENV.PORT,
    host: ENV.HOST,
  });

  await notifyReady();
})();

// we can add hooks to startup and shutdown events
onReady(() => logger.info('Service is ready to accept requests'));
onShutdown(() => server.close());
