// Game phases
export const GamePhase = {
  LOBBY: 'lobby',
  PLAYING: 'playing',
  ROUND_END: 'round_end',
  GAME_OVER: 'game_over',
} as const;

export type GamePhaseType = (typeof GamePhase)[keyof typeof GamePhase];

// Player status
export const PlayerStatus = {
  WAITING: 'waiting',
  READY: 'ready',
  PLAYING: 'playing',
  ELIMINATED: 'eliminated',
  DISCONNECTED: 'disconnected',
} as const;

export type PlayerStatusType = (typeof PlayerStatus)[keyof typeof PlayerStatus];

// Game configuration
export const GameConfig = {
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 4,
  STARTING_LIVES: 3,
  RECONNECT_TIMEOUT_MS: 30000,
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
