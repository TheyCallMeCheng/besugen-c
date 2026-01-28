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
const RECONNECT_KEY = 'besugen_reconnect';

interface ReconnectData {
  reconnectionToken: string;
  roomId: string;
  playerName: string;
  timestamp: number;
}

class ColyseusService {
  private client: Client;
  private room: Room | null = null;

  constructor() {
    this.client = new Client(COLYSEUS_URL);
  }

  // Store session data for potential reconnection
  private saveReconnectData(room: Room, playerName: string): void {
    const data: ReconnectData = {
      reconnectionToken: room.reconnectionToken,
      roomId: room.roomId,
      playerName,
      timestamp: Date.now(),
    };
    sessionStorage.setItem(RECONNECT_KEY, JSON.stringify(data));
  }

  // Get stored reconnect data if still valid (within 1 minute)
  getReconnectData(): ReconnectData | null {
    const stored = sessionStorage.getItem(RECONNECT_KEY);
    if (!stored) return null;

    try {
      const data: ReconnectData = JSON.parse(stored);
      // Check if still within reconnect window (1 minute)
      const elapsed = Date.now() - data.timestamp;
      if (elapsed > 60000) {
        this.clearReconnectData();
        return null;
      }
      return data;
    } catch {
      this.clearReconnectData();
      return null;
    }
  }

  // Clear reconnect data
  clearReconnectData(): void {
    sessionStorage.removeItem(RECONNECT_KEY);
  }

  async createRoom(playerName: string, avatarUrl?: string): Promise<Room> {
    try {
      this.room = await this.client.create('game_room', { playerName, avatarUrl });
      console.log('[Colyseus] Created room:', this.room.roomId);
      // Save reconnect data
      this.saveReconnectData(this.room, playerName);
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
      // Save reconnect data
      this.saveReconnectData(this.room, playerName);
      return this.room;
    } catch (error) {
      // Room not found is expected when user enters wrong code - use warn instead of error
      console.warn('[Colyseus] Could not join room:', (error as Error).message);
      throw error;
    }
  }

  async reconnect(): Promise<Room> {
    const data = this.getReconnectData();
    if (!data) {
      throw new Error('No reconnect data available');
    }

    try {
      console.log('[Colyseus] Attempting to reconnect to room:', data.roomId);
      this.room = await this.client.reconnect(data.reconnectionToken);
      console.log('[Colyseus] Reconnected successfully!');
      // Update reconnect data with new token
      this.saveReconnectData(this.room, data.playerName);
      return this.room;
    } catch (error) {
      console.warn('[Colyseus] Failed to reconnect:', (error as Error).message);
      this.clearReconnectData();
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
    // Clear reconnect data when explicitly leaving
    this.clearReconnectData();
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
