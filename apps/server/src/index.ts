import { Server } from '@colyseus/core';
import { WebSocketTransport } from '@colyseus/ws-transport';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { config } from 'dotenv';

import { GameRoom } from './rooms/GameRoom.js';
import { logger } from './logger.js';

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

// Discord OAuth token exchange endpoint
// Note: Discord URL mapping strips the prefix, so /.proxy/api/token arrives as /token
app.post('/token', async (req, res) => {
  const { code } = req.body;

  if (!code) {
    res.status(400).json({ error: 'Missing authorization code' });
    return;
  }

  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    logger.error('[Discord] Missing DISCORD_CLIENT_ID or DISCORD_CLIENT_SECRET');
    res.status(500).json({ error: 'Discord credentials not configured' });
    return;
  }

  try {
    const response = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code: code,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('[Discord] Token exchange failed:', errorText);
      res.status(response.status).json({ error: 'Token exchange failed' });
      return;
    }

    const data = await response.json();
    logger.log('[Discord] Token exchange successful');
    res.json({ access_token: data.access_token });
  } catch (error) {
    logger.error('[Discord] Token exchange error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
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
gameServer.define('game_room', GameRoom);

// Start server
httpServer.listen(PORT, () => {
  console.log(`🎮 Besugen Server listening on http://localhost:${PORT}`);
  console.log(`   WebSocket: ws://localhost:${PORT}`);
});
