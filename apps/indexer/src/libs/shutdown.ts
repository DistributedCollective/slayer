import { logger } from './logger';

const callbacks: Array<() => void | Promise<void>> = [];
let initialized = false;
let shuttingDown = false;

const log = logger.child({ module: 'shutdown' });

export function onShutdown(callback?: () => void) {
  if (callback && !shuttingDown) {
    callbacks.push(callback);
  }

  if (initialized) {
    return;
  }

  initialized = true;

  process.on('SIGINT', exitHandler);
  process.on('SIGTERM', exitHandler);

  process.on('unhandledRejection', (err) => {
    log.fatal(err, 'Uncaught rejection detected');
  });

  process.on('uncaughtException', (err) => {
    log.fatal(err, 'Uncaught exception detected');

    closeCallbacks(1);

    // If a graceful shutdown is not achieved after 2 seconds,
    // shut down the process completely
    setTimeout(() => {
      logger.fatal('Unable to shut down gracefully, force shutting down...');
      process.abort();
    }, 2000).unref();
  });
}

async function exitHandler(signal: NodeJS.Signals) {
  if (shuttingDown) {
    // already shutting down
    return;
  }
  shuttingDown = true;
  log.info({ signal }, 'Shutting service down...');
  await closeCallbacks(0);
}

const closeCallbacks = async (code = 0) =>
  Promise.allSettled(callbacks.map((cb) => cb())).finally(() => {
    log.info({ code }, 'Shutdown complete.');
    process.exit(code);
  });
