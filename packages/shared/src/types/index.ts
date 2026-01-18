import type { GamePhaseType, PlayerStatusType } from '../constants';

// Card types - to be expanded based on game design
export interface Card {
  id: string;
  type: string;
  value: number;
  name: string;
  description: string;
}

// Player state
export interface Player {
  id: string;
  sessionId: string;
  name: string;
  status: PlayerStatusType;
  lives: number;
  score: number;
  hand: Card[];
  isHost: boolean;
  connectedAt: number;
}

// Game state
export interface GameState {
  roomId: string;
  phase: GamePhaseType;
  players: Map<string, Player>;
  currentPlayerId: string | null;
  round: number;
  deck: Card[];
  discardPile: Card[];
  hostId: string;
  createdAt: number;
  startedAt: number | null;
}

// Room options
export interface RoomOptions {
  maxPlayers?: number;
  playerName?: string;
}

// Client events
export interface PlayCardEvent {
  cardId: string;
  targetPlayerId?: string;
  guessedCard?: string;
}

// Server events
export interface GameStateUpdate {
  phase: GamePhaseType;
  players: Player[];
  currentPlayerId: string | null;
  round: number;
}

export interface RoundResult {
  winnerId: string;
  reason: string;
  scores: Record<string, number>;
}

export interface GameResult {
  winnerId: string;
  finalScores: Record<string, number>;
}
