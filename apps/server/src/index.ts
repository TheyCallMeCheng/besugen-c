import { Server } from '@colyseus/core';
import { WebSocketTransport } from '@colyseus/ws-transport';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { config } from 'dotenv';

import { GameRoom } from './rooms/GameRoom.js';

// Load environment variables
config();

const PORT = parseInt(process.env.PORT || '2567', 10);

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Create HTTP server
const httpServer = createServer(app);

// Create Colyseus server
const gameServer = new Server({
  transport: new WebSocketTransport({
    server: httpServer,
  }),
});

// Register game room
gameServer.define('game', GameRoom);

// Start server
httpServer.listen(PORT, () => {
  console.log(`🎮 Besugen Server listening on http://localhost:${PORT}`);
  console.log(`   WebSocket: ws://localhost:${PORT}`);
});
