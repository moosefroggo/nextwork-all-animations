import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/nextwork-visualization/',
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
truck: resolve(__dirname, 'truck.html'),
        scratch: resolve(__dirname, 'scratch.html'),
        journey: resolve(__dirname, 'journey.html'),
        magic:   resolve(__dirname, 'magic.html'),
        remote:  resolve(__dirname, 'remote.html'),
        city:    resolve(__dirname, 'city.html')
      }
    }
  }
});
