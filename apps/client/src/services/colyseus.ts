import { Client, Room } from 'colyseus.js';
import { isDiscordActivity } from './discord';

// Colyseus server URL
// Uses protocol-relative URL that works via Vite's proxy in both:
// - Local development (localhost:5173 → proxy to localhost:2567)
// - Discord Activity (tunnel → Vite → proxy to Colyseus)
function getColyseusUrl(): string {
  // Development, we take the backend URL from env
  if (!isDiscordActivity()) {
    return import.meta.env.VITE_COLYSEUS_URL;
  }

  // Production/Discord, connect via same origin (Vite proxy handles routing)
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  console.log("PROTOCOL", protocol)

  return `${protocol}//${window.location.host}`;
  

}

const COLYSEUS_URL = getColyseusUrl();

class ColyseusService {
  private client: Client;
  private room: Room | null = null;

  constructor() {
    this.client = new Client(COLYSEUS_URL);
  }

  async createRoom(playerName: string, avatarUrl?: string): Promise<Room> {
    try {
      this.room = await this.client.create('game_room', { playerName, avatarUrl });
      console.log('[Colyseus] Created room - Full object:', this.room);
      console.log('[Colyseus] room.id:', this.room.roomId);
      console.log('[Colyseus] room.roomId:', (this.room as any).roomId);
      console.log('[Colyseus] room.sessionId:', this.room.sessionId);
      console.log('[Colyseus] room.state:', this.room.state);
      return this.room;
    } catch (error) {
      console.error('[Colyseus] Failed to create room:', error);
      throw error;
    }
  }

  async joinRoom(roomId: string, playerName: string, avatarUrl?: string): Promise<Room> {
    try {
      this.room = await this.client.joinById(roomId, { playerName, avatarUrl });
      console.log('[Colyseus] Joined room:', this.room.roomId);
      return this.room;
    } catch (error) {
      console.error('[Colyseus] Failed to join room:', error);
      throw error;
    }
  }

  async joinOrCreate(playerName: string): Promise<Room> {
    try {
      this.room = await this.client.joinOrCreate('game_room', { playerName });
      console.log('[Colyseus] Joined or created room:', this.room.roomId);
      return this.room;
    } catch (error) {
      console.error('[Colyseus] Failed to join or create room:', error);
      throw error;
    }
  }

  getRoom(): Room | null {
    return this.room;
  }

  leaveRoom(): void {
    if (this.room) {
      this.room.leave();
      this.room = null;
    }
  }

  // Game actions
  sendReady(): void {
    this.room?.send('ready');
  }

  sendStartGame(): void {
    this.room?.send('start_game');
  }

  sendBid(bid: number): void {
    this.room?.send('submit_bid', { bid });
  }

  sendPlayCard(cardId: string): void {
    this.room?.send('play_card', { cardId });
  }
}

// Singleton instance
export const colyseusService = new ColyseusService();
