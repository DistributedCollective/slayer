import { Mode } from './lib/context.js';

export const DEFAULT_PAGE_LIMIT = 100;

export const INDEXER_URL = {
  [Mode.production]: 'https://slayer-indexer.sovryn.app',
  [Mode.staging]: 'https://slayer-indexer.staging.sovryn.app',
  [Mode.development]: 'https://slayer-indexer.test.sovryn.app',
} as const;
