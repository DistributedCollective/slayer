import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'indexer',
    globals: true,
    environment: 'node',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: './test-output/vitest/coverage',
      provider: 'v8' as const,
    },
    server: {
      deps: {
        inline: ['@fastify/autoload'],
      },
    },
  },
});
