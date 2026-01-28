// Game phases
export const GamePhase = {
  LOBBY: 'lobby',
  DEALING: 'dealing',
  BIDDING: 'bidding',
  TRICK: 'trick',
  TRICK_END: 'trick_end',
  ROUND_END: 'round_end',
  GAME_OVER: 'game_over',
} as const;

export type GamePhaseType = (typeof GamePhase)[keyof typeof GamePhase];

// Player status
export const PlayerStatus = {
  WAITING: 'waiting',
  READY: 'ready',
  PLAYING: 'playing',
  BIDDING: 'bidding',
  SPECTATOR: 'spectator',
  ELIMINATED: 'eliminated',
  DISCONNECTED: 'disconnected',
} as const;

export type PlayerStatusType = (typeof PlayerStatus)[keyof typeof PlayerStatus];

// Suit ranking (higher = stronger)
export const SuitRank = {
  HEARTS: 4,
  DIAMONDS: 3,
  CLUBS: 2,
  SPADES: 1,
} as const;

export const Suits = ['spades', 'clubs', 'diamonds', 'hearts'] as const;
export type SuitType = (typeof Suits)[number];

// Card value ranking (K=13 highest, A=1 lowest)
export const CardValues = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const;
export type CardValueType = (typeof CardValues)[number];

// Game configuration
export const GameConfig = {
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 6,
  STARTING_LIVES: 3,
  RECONNECT_TIMEOUT_MS: 60000, // 1 minute to reconnect
  BID_TIMEOUT_MS: 10000,
  CARD_COUNTS: [5, 4, 3, 2, 1] as readonly number[],
  TRICK_RESOLVE_DELAY_MS: 1500,
} as const;

// WebSocket message types
export const MessageType = {
  // Client -> Server
  READY: 'ready',
  PLAY_CARD: 'play_card',
  SELECT_TARGET: 'select_target',
  
  // Server -> Client  
  GAME_STATE: 'game_state',
  PLAYER_JOINED: 'player_joined',
  PLAYER_LEFT: 'player_left',
  ROUND_START: 'round_start',
  ROUND_END: 'round_end',
  GAME_END: 'game_end',
} as const;

export type MessageTypeType = (typeof MessageType)[keyof typeof MessageType];
