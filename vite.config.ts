import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@engine': '/engine',
      '@editor': '/editor',
      '@runtime': '/runtime',
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
