import type { GamePhaseType, PlayerStatusType, SuitType, CardValueType } from '../constants/index.js';

// Card types
export interface Card {
  id: string;
  suit: SuitType;
  value: CardValueType;
  numericValue: number; // 1-13 for comparison
}

// Card played in a trick
export interface TrickCard {
  playerId: string;
  card: Card;
  playOrder: number;
}

// Player state
export interface Player {
  id: string;
  sessionId: string;
  name: string;
  avatarUrl: string;
  status: PlayerStatusType;
  lives: number;
  score: number;
  hand: Card[];
  isHost: boolean;
  connectedAt: number;
  // Round-specific state
  bid: number; // -1 = not yet bid
  tricksWon: number;
  isSpectator: boolean;
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
  // Round state
  cardCountIndex: number; // Index in CARD_COUNTS [5,4,3,2,1]
  currentCardCount: number;
  // Bidding state
  biddingOrder: string[]; // Player IDs in bidding order
  currentBidderIndex: number;
  totalBids: number;
  bidTimerEnd: number; // Timestamp when current bid timer expires
  // Trick state
  currentTrick: TrickCard[];
  leadSuit: SuitType | null;
  trickNumber: number;
  trickWinnerId: string | null;
}

// Room options
export interface RoomOptions {
  maxPlayers?: number;
  playerName?: string;
  avatarUrl?: string;
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
