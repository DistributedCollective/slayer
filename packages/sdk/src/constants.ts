export const modes = {
  production: 'production',
  staging: 'staging',
  development: 'development',
  custom: 'custom', // for custom indexer URL use
} as const;
export type Mode = (typeof modes)[keyof typeof modes];

export const DEFAULT_PAGE_LIMIT = 100;

export const INDEXER_URL = {
  [modes.production]: 'https://slayer-indexer.sovryn.app',
  [modes.staging]: 'https://slayer-indexer.staging.sovryn.app',
  [modes.development]: 'https://slayer-indexer.test.sovryn.app',
} as const;
