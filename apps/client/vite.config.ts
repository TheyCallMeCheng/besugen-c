import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // Load .env from project root (../../ from apps/client)
  envDir: path.resolve(__dirname, '../..'),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  esbuild: {
    // Strip console.log/debug from production builds; keep console.error/warn
    pure: mode === 'production' ? ['console.log', 'console.debug'] : [],
  },
  server: {
    port: 5173,
    allowedHosts: true,
    proxy: {
      // Proxy Colyseus matchmaking API (HTTP POST for room create/join)
      '/matchmake': {
        target: 'http://localhost:2567',
        changeOrigin: true,
      },
      // Proxy WebSocket connections to Colyseus server (after matchmaking)
      '/colyseus': {
        target: 'ws://localhost:2567',
        ws: true,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/colyseus/, ''),
      },
      // Proxy API calls to server (for Discord token exchange, etc.)
      // Rewrite to strip /api prefix, matching how Discord URL mapping works
      '/api': {
        target: 'http://localhost:2567',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
}));
