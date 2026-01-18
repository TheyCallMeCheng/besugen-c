import { Room, Client } from '@colyseus/core';
import { GameStateSchema, PlayerSchema } from '../state/GameState.js';
import { GamePhase, GameConfig } from '@besugen/shared';
import type { RoomOptions } from '@besugen/shared';

export class GameRoom extends Room<GameStateSchema> {
  maxClients = GameConfig.MAX_PLAYERS;

  onCreate(options: RoomOptions) {
    this.setState(new GameStateSchema());
    this.state.roomId = this.roomId;
    this.state.createdAt = Date.now();
    this.state.phase = GamePhase.LOBBY;

    console.log(`[GameRoom] Room ${this.roomId} created`);

    // Set up message handlers
    this.onMessage('ready', (client, message) => {
      this.handleReady(client);
    });

    this.onMessage('start_game', (client, message) => {
      this.handleStartGame(client);
    });

    this.onMessage('play_card', (client, message) => {
      this.handlePlayCard(client, message);
    });
  }

  onJoin(client: Client, options: RoomOptions) {
    console.log(`[GameRoom] Player ${client.sessionId} joined room ${this.roomId}`);

    const player = new PlayerSchema();
    player.id = client.sessionId;
    player.sessionId = client.sessionId;
    player.name = options.playerName || `Player ${this.state.players.size + 1}`;
    player.status = 'waiting';
    player.lives = GameConfig.STARTING_LIVES;
    player.connectedAt = Date.now();

    // First player is the host
    if (this.state.players.size === 0) {
      player.isHost = true;
      this.state.hostId = client.sessionId;
    }

    this.state.players.set(client.sessionId, player);
  }

  onLeave(client: Client, consented: boolean) {
    console.log(`[GameRoom] Player ${client.sessionId} left room ${this.roomId}`);

    const player = this.state.players.get(client.sessionId);
    
    if (player) {
      if (this.state.phase === GamePhase.LOBBY) {
        // In lobby, just remove the player
        this.state.players.delete(client.sessionId);
        
        // Reassign host if needed
        if (this.state.hostId === client.sessionId && this.state.players.size > 0) {
          const newHost = Array.from(this.state.players.values())[0];
          newHost.isHost = true;
          this.state.hostId = newHost.sessionId;
        }
      } else {
        // During game, mark as disconnected
        player.status = 'disconnected';
        // TODO: Implement reconnection timeout
      }
    }
  }

  onDispose() {
    console.log(`[GameRoom] Room ${this.roomId} disposing`);
  }

  // Message handlers
  private handleReady(client: Client) {
    const player = this.state.players.get(client.sessionId);
    if (player) {
      player.status = player.status === 'ready' ? 'waiting' : 'ready';
    }
  }

  private handleStartGame(client: Client) {
    // Only host can start
    if (client.sessionId !== this.state.hostId) {
      return;
    }

    // Check if enough players are ready
    const readyPlayers = Array.from(this.state.players.values()).filter(
      (p) => p.status === 'ready' || p.isHost
    );

    if (readyPlayers.length >= GameConfig.MIN_PLAYERS) {
      this.state.phase = GamePhase.PLAYING;
      this.state.startedAt = Date.now();
      this.state.round = 1;

      // Update all player statuses
      this.state.players.forEach((player) => {
        player.status = 'playing';
      });

      console.log(`[GameRoom] Game started in room ${this.roomId}`);
      // TODO: Initialize deck and deal cards
    }
  }

  private handlePlayCard(client: Client, message: { cardId: string; targetPlayerId?: string }) {
    // TODO: Implement card play logic
    console.log(`[GameRoom] Player ${client.sessionId} played card ${message.cardId}`);
  }
}
