import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['apps/indexer/**/*.ts'],
    rules: {
      'no-console': 'warn',
    },
  },
];
