import tailwindcss from '@tailwindcss/vite';
import viteReact from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

import { devtools } from '@tanstack/devtools-vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// very conservative example; tailor to the library’s pattern
function fixPureAnnotations() {
  return {
    name: 'fix-pure-annotations',
    renderChunk(code: string) {
      // Example: move trailing /*#__PURE__*/ on next line to before the call
      const patched = code.replace(
        /(\bnew\b|\b[A-Za-z_$][\w$]*\s*\()([^;]*?)\);\s*\/\*#__PURE__\*\//g,
        '/*#__PURE__*/ $1$2);',
      );
      if (patched !== code) return { code: patched, map: null };
      return null;
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(() => ({
  _root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/web-app',
  plugins: [
    devtools(),
    fixPureAnnotations(),
    nodePolyfills(),
    // @ts-expect-error not well typed
    ...tanstackRouter({ autoCodeSplitting: true }),
    viteReact(),
    tailwindcss(),
  ],
  // Uncomment this when using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },
  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      onwarn(warning, defaultHandler) {
        if (warning.code === 'INVALID_ANNOTATION') return;
        defaultHandler(warning);
      },
    },
  },
  test: {
    name: 'web-app',
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: './test-output/vitest/coverage',
      provider: 'v8' as const,
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      // 'sdk': path.resolve(__dirname, '../../packages/sdk/src'),
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  },
}));
