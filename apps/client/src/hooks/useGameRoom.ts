import { useState, useEffect, useCallback } from 'react';
import { Room } from 'colyseus.js';
import { colyseusService } from '../services/colyseus';
import type { CardData, TrickCardData } from '../components/ui';

export interface GamePlayer {
  id: string;
  name: string;
  avatarUrl: string;
  score: number;
  cardCount: number;
  isCurrentTurn?: boolean;
  status?: string;
  lives: number;
  bid: number;
  tricksWon: number;
  isSpectator: boolean;
  isHost: boolean;
}

export interface GameState {
  phase: 'lobby' | 'dealing' | 'bidding' | 'trick' | 'trick_end' | 'round_end' | 'game_over';
  roomId: string;
  round: number;
  players: GamePlayer[];
  currentPlayerId: string;
  myPlayerId: string;
  myHand: CardData[];
  deckCount: number;
  hostId: string;
  bidTimerEnd: number;
  totalBids: number;
  currentBidderIndex: number;
  biddingOrder: string[];
  currentTrick: TrickCardData[];
  trickWinnerId: string;
  currentCardCount: number;
}

const initialState: GameState = {
  phase: 'lobby',
  roomId: '',
  round: 0,
  players: [],
  currentPlayerId: '',
  myPlayerId: '',
  myHand: [],
  deckCount: 0,
  hostId: '',
  bidTimerEnd: 0,
  totalBids: 0,
  currentBidderIndex: 0,
  biddingOrder: [],
  currentTrick: [],
  trickWinnerId: '',
  currentCardCount: 5,
};

// Helper to convert player schema to GamePlayer
function schemaToPlayer(player: any, id: string, currentPlayerId: string): GamePlayer {
  return {
    id,
    name: player.name || 'Unknown',
    avatarUrl: player.avatarUrl || '',
    score: player.score || 0,
    cardCount: player.hand?.length || 0,
    isCurrentTurn: currentPlayerId === id,
    status: player.status,
    lives: player.lives ?? 3,
    bid: player.bid ?? -1,
    tricksWon: player.tricksWon ?? 0,
    isSpectator: player.isSpectator ?? false,
    isHost: player.isHost ?? false,
  };
}

// Helper to extract state from room
function extractGameState(room: Room): GameState {
  const state = room.state as any;
  if (!state) return initialState;

  const players: GamePlayer[] = [];
  let myHand: CardData[] = [];
  let myPlayerId = '';

  // Iterate players using for...of which works with MapSchema
  if (state.players && state.players.size > 0) {
    for (const [sessionId, player] of state.players) {
      if (player.sessionId === room.sessionId) {
        myPlayerId = sessionId;
        if (player.hand) {
          myHand = Array.from(player.hand).map((card: any) => ({
            id: card.id,
            suit: card.suit as 'hearts' | 'diamonds' | 'clubs' | 'spades',
            rank: card.value,
          }));
        }
      }
      players.push(schemaToPlayer(player, sessionId, state.currentPlayerId));
    }
  }

  const currentTrick: TrickCardData[] = Array.from(state.currentTrick || []).map((tc: any) => {
    const player = players.find(p => p.id === tc.playerId);
    return {
      playerId: tc.playerId,
      playerName: player?.name || 'Unknown',
      card: {
        id: tc.card?.id || '',
        suit: (tc.card?.suit || 'spades') as 'hearts' | 'diamonds' | 'clubs' | 'spades',
        rank: tc.card?.value || 'A',
      },
      playOrder: tc.playOrder,
    };
  });

  const biddingOrder: string[] = Array.from(state.biddingOrder || []);

  return {
    phase: state.phase || 'lobby',
    roomId: state.roomId || room.roomId || '',
    round: state.round || 0,
    players,
    currentPlayerId: state.currentPlayerId || '',
    myPlayerId,
    myHand,
    deckCount: state.deck?.length || 0,
    hostId: state.hostId || '',
    bidTimerEnd: state.bidTimerEnd || 0,
    totalBids: state.totalBids || 0,
    currentBidderIndex: state.currentBidderIndex || 0,
    biddingOrder,
    currentTrick,
    trickWinnerId: state.trickWinnerId || '',
    currentCardCount: state.currentCardCount || 5,
  };
}

// Suit rank for sorting (higher = stronger)
const SUIT_ORDER: Record<string, number> = {
  hearts: 4,
  diamonds: 3,
  clubs: 2,
  spades: 1,
};

// Card value rank for sorting (A=1, K=13)
const VALUE_ORDER: Record<string, number> = {
  'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
  '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13,
};

export function useGameRoom() {
  const [room, setRoom] = useState<Room | null>(null);
  const [gameState, setGameState] = useState<GameState>(initialState);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSorted, setIsSorted] = useState(false);

  // Update game state from room
  const updateState = useCallback((r: Room) => {
    const newState = extractGameState(r);
    console.log('[useGameRoom] Updating state, players:', newState.players.length);
    setGameState(newState);
  }, []);

  // Connect to a room
  const createRoom = useCallback(async (playerName: string, avatarUrl?: string) => {
    setIsConnecting(true);
    setError(null);
    try {
      const newRoom = await colyseusService.createRoom(playerName, avatarUrl);
      
      // Set up state change listener
      newRoom.onStateChange(() => {
        console.log('[useGameRoom] onStateChange fired');
        console.log('[useGameRoom] room.state:', newRoom.state);
        console.log('[useGameRoom] room.state keys:', Object.keys(newRoom.state as any));
        console.log('[useGameRoom] room.state.players:', (newRoom.state as any).players);
        console.log('[useGameRoom] room.state.$:', (newRoom.state as any).$);
        updateState(newRoom);
      });

      newRoom.onError((code, message) => {
        console.error('[Room Error]', code, message);
        setError(message || 'Room error');
      });

      newRoom.onLeave((code) => {
        console.log('[Room] Left with code:', code);
        setRoom(null);
        setGameState(initialState);
      });
      
      setRoom(newRoom);
      
      // Poll for initial state update (workaround for timing issue)
      let attempts = 0;
      const pollInterval = setInterval(() => {
        attempts++;
        const state = newRoom.state as any;
        console.log(`[useGameRoom] Polling attempt ${attempts}, players.size:`, state?.players?.size);
        
        if (state?.players?.size > 0) {
          console.log('[useGameRoom] Found players via polling!');
          updateState(newRoom);
          clearInterval(pollInterval);
        } else if (attempts >= 20) {
          console.log('[useGameRoom] Polling timed out');
          clearInterval(pollInterval);
        }
      }, 100);
      
    } catch (err) {
      setError('Failed to create room');
      console.error(err);
    } finally {
      setIsConnecting(false);
    }
  }, [updateState]);

  const joinRoom = useCallback(async (roomId: string, playerName: string, avatarUrl?: string): Promise<boolean> => {
    setIsConnecting(true);
    setError(null);
    try {
      const newRoom = await colyseusService.joinRoom(roomId, playerName, avatarUrl);

      newRoom.onStateChange(() => updateState(newRoom));
      newRoom.onError((code, message) => {
        console.error('[Room Error]', code, message);
        setError(message || 'Room error');
      });
      newRoom.onLeave((code) => {
        console.log('[Room] Left with code:', code);
        setRoom(null);
        setGameState(initialState);
      });

      setRoom(newRoom);

      // Poll for initial state
      let attempts = 0;
      const pollInterval = setInterval(() => {
        attempts++;
        const state = newRoom.state as any;
        if (state?.players?.size > 0) {
          updateState(newRoom);
          clearInterval(pollInterval);
        } else if (attempts >= 20) {
          clearInterval(pollInterval);
        }
      }, 100);

      return true;
    } catch {
      setError('Invalid room code. Please check and try again.');
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, [updateState]);

  const leaveRoom = useCallback(() => {
    colyseusService.leaveRoom();
    setRoom(null);
    setGameState(initialState);
  }, []);

  // Check if reconnection is available
  const canReconnect = useCallback(() => {
    return colyseusService.getReconnectData() !== null;
  }, []);

  // Reconnect to a previous session
  const reconnect = useCallback(async (): Promise<boolean> => {
    setIsConnecting(true);
    setError(null);
    try {
      const newRoom = await colyseusService.reconnect();

      newRoom.onStateChange(() => updateState(newRoom));
      newRoom.onError((code, message) => {
        console.error('[Room Error]', code, message);
        setError(message || 'Room error');
      });
      newRoom.onLeave((code) => {
        console.log('[Room] Left with code:', code);
        setRoom(null);
        setGameState(initialState);
      });

      setRoom(newRoom);

      // Poll for initial state
      let attempts = 0;
      const pollInterval = setInterval(() => {
        attempts++;
        const state = newRoom.state as any;
        if (state?.players?.size > 0) {
          updateState(newRoom);
          clearInterval(pollInterval);
        } else if (attempts >= 20) {
          clearInterval(pollInterval);
        }
      }, 100);

      return true;
    } catch {
      setError('Failed to reconnect to game');
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, [updateState]);

  // Game actions
  const sendReady = useCallback(() => colyseusService.sendReady(), []);
  const sendStartGame = useCallback(() => colyseusService.sendStartGame(), []);
  const sendBid = useCallback((bid: number) => colyseusService.sendBid(bid), []);
  const sendPlayCard = useCallback((cardId: string) => colyseusService.sendPlayCard(cardId), []);
  
  // Sort hand (client-side only) - once sorted, stays sorted
  const sortHand = useCallback(() => {
    setIsSorted(true);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      colyseusService.leaveRoom();
    };
  }, []);

  // Sort hand if needed
  const sortedHand = isSorted
    ? [...gameState.myHand].sort((a, b) => {
        const suitDiff = SUIT_ORDER[b.suit] - SUIT_ORDER[a.suit];
        if (suitDiff !== 0) return suitDiff;
        return VALUE_ORDER[b.rank] - VALUE_ORDER[a.rank];
      })
    : gameState.myHand;

  return {
    room,
    gameState: { ...gameState, myHand: sortedHand },
    isConnecting,
    error,
    setError,
    createRoom,
    joinRoom,
    leaveRoom,
    reconnect,
    canReconnect,
    sendReady,
    sendStartGame,
    sendBid,
    sendPlayCard,
    sortHand,
    isHost: gameState.hostId === gameState.myPlayerId,
    isMyTurn: gameState.currentPlayerId === gameState.myPlayerId,
  };
}
