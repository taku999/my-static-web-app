import { readFileSync } from 'node:fs';
import { defineConfig, loadEnv, transformWithEsbuild } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'REACT_APP_');

  return {
    plugins: [
      {
        name: 'jsx-in-js',
        enforce: 'pre',
        async transform(code, id) {
          if (!/\/src\/.*\.js$/.test(id)) return null;
          return transformWithEsbuild(code, id, {
            loader: 'jsx',
            jsx: 'automatic',
          });
        },
      },
      react(),
      {
        name: 'hosting-config',
        generateBundle() {
          this.emitFile({
            type: 'asset',
            fileName: 'staticwebapp.config.json',
            source: readFileSync(new URL('./staticwebapp.config.json', import.meta.url)),
          });
        },
      },
    ],
    define: {
      'process.env.REACT_APP_API': JSON.stringify(env.REACT_APP_API || 'api'),
      'process.env.PUBLIC_URL': JSON.stringify(''),
    },
    optimizeDeps: {
      esbuildOptions: { loader: { '.js': 'jsx' } },
    },
    server: {
      host: '127.0.0.1',
      port: 3000,
      proxy: {
        '/api': {
          target: 'http://localhost:7071',
          changeOrigin: true,
        },
      },
    },
    build: { outDir: 'build' },
  };
});