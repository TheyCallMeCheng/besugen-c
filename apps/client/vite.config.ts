import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    allowedHosts: true, // TODO: Remove in production - allows cloudflare tunnel access
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
      '/api': {
        target: 'http://localhost:2567',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
