import { logger } from './logger';

const callbacks: Array<() => void | Promise<void>> = [];
let ready = false;

const log = logger.child({ module: 'startup' });

export function onReady(callback?: () => void) {
  if (callback) {
    if (ready) {
      Promise.allSettled([callback()]);
    } else {
      callbacks.push(callback);
    }
  }
}

export async function notifyReady() {
  if (ready) {
    // already notified
    return;
  }
  ready = true;
  await Promise.allSettled(callbacks.map((cb) => cb())).finally(() => {
    callbacks.length = 0;
    log.info('Startup complete.');
  });
}
