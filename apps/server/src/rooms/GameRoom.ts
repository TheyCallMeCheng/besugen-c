import { Room, Client, Delayed } from '@colyseus/core';
import { 
  GameStateSchema, 
  PlayerSchema, 
  CardSchema,
  TrickCardSchema 
} from '../state/GameState.js';
import { GamePhase, GameConfig, PlayerStatus } from '@besugen/shared';
import type { RoomOptions } from '@besugen/shared';
import { GameEngine } from '../engine/GameEngine.js';
import { logger } from '../logger.js';

export class GameRoom extends Room<GameStateSchema> {
  maxClients = GameConfig.MAX_PLAYERS;
  private bidTimer: Delayed | null = null;
  private trickResolveTimer: Delayed | null = null;
  private lastRoundWinnerId: string = '';
  // Track disconnected players' previous status for reconnection
  private disconnectedPlayerStatus: Map<string, string> = new Map();

  onCreate(options: RoomOptions) {
    this.setState(new GameStateSchema());
    this.state.roomId = this.roomId;
    this.state.createdAt = Date.now();
    this.state.phase = GamePhase.LOBBY;

    logger.log(`[GameRoom] Room ${this.roomId} created`);

    // Set up message handlers
    this.onMessage('ready', (client, message) => {
      this.handleReady(client);
    });

    this.onMessage('start_game', (client, message) => {
      this.handleStartGame(client);
    });

    this.onMessage('submit_bid', (client, message: { bid: number }) => {
      this.handleSubmitBid(client, message.bid);
    });

    this.onMessage('play_card', (client, message: { cardId: string }) => {
      this.handlePlayCard(client, message.cardId);
    });
  }

  onJoin(client: Client, options: RoomOptions) {
    logger.log(`[GameRoom] onJoin called - Player ${client.sessionId} joining room ${this.roomId}`);
    logger.log(`[GameRoom] Options:`, options);

    const player = new PlayerSchema();
    player.id = client.sessionId;
    player.sessionId = client.sessionId;
    player.name = options.playerName || `Player ${this.state.players.size + 1}`;
    player.avatarUrl = options.avatarUrl || '';
    player.status = PlayerStatus.WAITING;
    player.lives = GameConfig.STARTING_LIVES;
    player.connectedAt = Date.now();
    player.bid = -1;
    player.tricksWon = 0;
    player.isSpectator = false;

    // First player is the host
    if (this.state.players.size === 0) {
      player.isHost = true;
      this.state.hostId = client.sessionId;
    }

    this.state.players.set(client.sessionId, player);
    
    logger.log(`[GameRoom] Player added! Players count: ${this.state.players.size}`);
    logger.log(`[GameRoom] Player keys:`, Array.from(this.state.players.keys()));
  }

  async onLeave(client: Client, consented: boolean) {
    logger.log(`[GameRoom] Player ${client.sessionId} left room ${this.roomId} (consented: ${consented})`);

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
        // During game, allow reconnection
        // Store the player's current status before marking as disconnected
        this.disconnectedPlayerStatus.set(client.sessionId, player.status);
        player.status = PlayerStatus.DISCONNECTED;

        logger.log(`[GameRoom] Player ${player.name} disconnected, allowing ${GameConfig.RECONNECT_TIMEOUT_MS / 1000}s to reconnect`);

        // Broadcast disconnect event so other players know
        this.broadcast('player_disconnected', {
          playerId: client.sessionId,
          playerName: player.name,
          reconnectTimeoutMs: GameConfig.RECONNECT_TIMEOUT_MS,
        });

        try {
          // Allow reconnection within the timeout window
          await this.allowReconnection(client, GameConfig.RECONNECT_TIMEOUT_MS / 1000);

          // Player reconnected successfully!
          const previousStatus = this.disconnectedPlayerStatus.get(client.sessionId) || PlayerStatus.PLAYING;
          player.status = previousStatus;
          this.disconnectedPlayerStatus.delete(client.sessionId);

          logger.log(`[GameRoom] Player ${player.name} reconnected successfully!`);

          // Broadcast reconnect event
          this.broadcast('player_reconnected', {
            playerId: client.sessionId,
            playerName: player.name,
          });

        } catch (e) {
          // Reconnection timed out - convert to spectator
          logger.log(`[GameRoom] Player ${player.name} failed to reconnect, converting to spectator`);

          this.disconnectedPlayerStatus.delete(client.sessionId);
          player.status = PlayerStatus.ELIMINATED;
          player.isSpectator = true;
          player.lives = 0;
          player.hand.clear(); // Clear their cards

          // Broadcast that player is now eliminated
          this.broadcast('player_eliminated', {
            playerId: client.sessionId,
            playerName: player.name,
            reason: 'disconnect_timeout',
          });

          // Check if game should end
          this.checkGameOver();
        }
      }
    }
  }

  onDispose() {
    logger.log(`[GameRoom] Room ${this.roomId} disposing`);
    if (this.bidTimer) {
      this.bidTimer.clear();
    }
    if (this.trickResolveTimer) {
      this.trickResolveTimer.clear();
    }
  }

  // ==================== Message Handlers ====================

  private handleReady(client: Client) {
    const player = this.state.players.get(client.sessionId);
    if (player && this.state.phase === GamePhase.LOBBY) {
      player.status = player.status === PlayerStatus.READY ? PlayerStatus.WAITING : PlayerStatus.READY;
    }
  }

  private handleStartGame(client: Client) {
    // Only host can start
    if (client.sessionId !== this.state.hostId) {
      return;
    }

    // Check if enough players are ready
    const readyPlayers = Array.from(this.state.players.values()).filter(
      (p) => p.status === PlayerStatus.READY || p.isHost
    );

    if (readyPlayers.length >= GameConfig.MIN_PLAYERS) {
      logger.log(`[GameRoom] Game started in room ${this.roomId}`);
      this.state.startedAt = Date.now();
      this.state.round = 0;
      this.state.cardCountIndex = 0;
      this.state.currentCardCount = GameConfig.CARD_COUNTS[0];
      
      // Start the first round
      this.startNewRound();
    }
  }

  private handleSubmitBid(client: Client, bid: number) {
    if (this.state.phase !== GamePhase.BIDDING) {
      return;
    }

    const currentBidderId = this.state.biddingOrder[this.state.currentBidderIndex];
    if (client.sessionId !== currentBidderId) {
      logger.log(`[GameRoom] Not ${client.sessionId}'s turn to bid`);
      return;
    }

    const player = this.state.players.get(client.sessionId);
    if (!player) return;

    const isLastBidder = this.state.currentBidderIndex === this.state.biddingOrder.length - 1;
    
    // Validate bid
    if (!GameEngine.isValidBid(bid, this.state.currentCardCount, this.state.totalBids, isLastBidder)) {
      // Invalid bid, default to max valid (remaining tricks)
      const maxBid = GameEngine.calculateMaxBid(this.state.currentCardCount, this.state.totalBids, isLastBidder);
      bid = Math.min(Math.max(0, bid), maxBid);
    }

    logger.log(`[GameRoom] Player ${player.name} bids ${bid}`);
    
    player.bid = bid;
    this.state.totalBids += bid;

    // Clear the timer
    if (this.bidTimer) {
      this.bidTimer.clear();
      this.bidTimer = null;
    }

    // Move to next bidder or start trick phase
    this.state.currentBidderIndex++;
    
    if (this.state.currentBidderIndex >= this.state.biddingOrder.length) {
      // All players have bid, start trick phase
      this.startTrickPhase();
    } else {
      // Start timer for next bidder
      this.startBidTimer();
    }
  }

  private handlePlayCard(client: Client, cardId: string) {
    if (this.state.phase !== GamePhase.TRICK) {
      return;
    }

    if (client.sessionId !== this.state.currentPlayerId) {
      logger.log(`[GameRoom] Not ${client.sessionId}'s turn to play`);
      return;
    }

    const player = this.state.players.get(client.sessionId);
    if (!player) return;

    // Validate player has the card
    if (!GameEngine.playerHasCard(player, cardId)) {
      logger.log(`[GameRoom] Player doesn't have card ${cardId}`);
      return;
    }

    // Remove card from hand
    const card = GameEngine.removeCardFromHand(player, cardId);
    if (!card) return;
    
    // Update public hand count
    player.handCount = player.hand.length;

    logger.log(`[GameRoom] Player ${player.name} plays ${card.value} of ${card.suit}`);

    // Add card to current trick
    const trickCard = new TrickCardSchema();
    trickCard.playerId = client.sessionId;
    trickCard.card = card;
    trickCard.playOrder = this.state.currentTrick.length;
    this.state.currentTrick.push(trickCard);

    // Set lead suit if this is the first card
    if (this.state.currentTrick.length === 1) {
      this.state.leadSuit = card.suit;
    }

    // Check if trick is complete
    const activePlayers = GameEngine.getActivePlayers(this.state.players);
    if (this.state.currentTrick.length >= activePlayers.length) {
      // All players have played, resolve trick
      this.resolveTrick();
    } else {
      // Next player's turn
      this.state.currentPlayerId = GameEngine.getNextPlayer(client.sessionId, activePlayers);
      // Check if next player is disconnected and auto-play for them
      this.handleDisconnectedPlayerTurn();
    }
  }

  // ==================== Game Flow Methods ====================

  private startNewRound() {
    this.state.round++;
    this.state.trickNumber = 0;
    this.state.totalBids = 0;
    // Note: Don't clear trickWinnerId here - we need it to determine bidding order
    
    logger.log(`[GameRoom] Starting round ${this.state.round} with ${this.state.currentCardCount} cards`);

    // Create and shuffle deck
    this.state.deck = GameEngine.createDeck();
    
    // Get active players
    const activePlayers = GameEngine.getActivePlayers(this.state.players);
    
    if (activePlayers.length < 2) {
      this.checkGameOver();
      return;
    }

    // Set phase to dealing
    this.state.phase = GamePhase.DEALING;
    
    // Deal cards to players
    GameEngine.dealCards(
      this.state.deck, 
      this.state.players, 
      this.state.currentCardCount,
      activePlayers
    );
    
    // Update deck count for clients
    this.state.deckCount = this.state.deck.length;

    // Update all active player statuses
    this.state.players.forEach((player) => {
      if (!player.isSpectator && player.lives > 0) {
        player.status = PlayerStatus.BIDDING;
      }
    });

    // Set up bidding order
    // First round: use simple rotation
    // Subsequent rounds: last trick winner of previous round starts
    this.state.biddingOrder.clear();
    
    let startingPlayerId: string;
    if (this.state.round === 1) {
      // First round - pick a random player to start
      const randomIndex = Math.floor(Math.random() * activePlayers.length);
      startingPlayerId = activePlayers[randomIndex] ?? '';
    } else if (this.lastRoundWinnerId && activePlayers.includes(this.lastRoundWinnerId)) {
      // Use the winner of the previous round
       startingPlayerId = this.lastRoundWinnerId;
    } else {
       // Fallback to rotation if no winner or winner left
       // Just pick the next person in line relative to round number to be fair
      const startIndex = (this.state.round - 1) % activePlayers.length;
      startingPlayerId = activePlayers[startIndex] ?? activePlayers[0] ?? '';
    }
    
    // Build bidding order starting from the chosen player
    const startIndex = activePlayers.indexOf(startingPlayerId);
    const actualStartIndex = startIndex >= 0 ? startIndex : 0;
    for (let i = 0; i < activePlayers.length; i++) {
      const index = (actualStartIndex + i) % activePlayers.length;
      this.state.biddingOrder.push(activePlayers[index]);
    }
    
    this.state.currentBidderIndex = 0;
    
    // Now clear trickWinnerId for this round's tricks
    this.state.trickWinnerId = '';

    // Start bidding phase
    this.state.phase = GamePhase.BIDDING;
    this.startBidTimer();

    // Broadcast round start
    this.broadcast('round_start', {
      round: this.state.round,
      cardCount: this.state.currentCardCount,
    });
  }

  private startBidTimer() {
    const currentBidderId = this.state.biddingOrder[this.state.currentBidderIndex] ?? '';
    this.state.currentPlayerId = currentBidderId;

    const player = currentBidderId ? this.state.players.get(currentBidderId) : undefined;

    // If player is disconnected, auto-bid immediately
    if (player && player.status === PlayerStatus.DISCONNECTED) {
      logger.log(`[GameRoom] Player ${player.name} is disconnected, auto-bidding 0`);
      player.bid = 0;
      // Move to next bidder
      this.state.currentBidderIndex++;
      if (this.state.currentBidderIndex >= this.state.biddingOrder.length) {
        this.startTrickPhase();
      } else {
        this.startBidTimer();
      }
      return;
    }

    this.state.bidTimerEnd = Date.now() + GameConfig.BID_TIMEOUT_MS;

    logger.log(`[GameRoom] Waiting for ${currentBidderId} to bid (${GameConfig.BID_TIMEOUT_MS}ms)`);

    // Set timeout for auto-bid
    this.bidTimer = this.clock.setTimeout(() => {
      this.handleBidTimeout();
    }, GameConfig.BID_TIMEOUT_MS);
  }

  private handleBidTimeout() {
    const currentBidderId = this.state.biddingOrder[this.state.currentBidderIndex] ?? '';
    const player = currentBidderId ? this.state.players.get(currentBidderId) : undefined;
    
    if (player && player.bid === -1) {
      logger.log(`[GameRoom] Player ${player.name} timed out, auto-bidding 0`);
      player.bid = 0;
      // Don't add to total bids since 0 doesn't change anything
    }

    // Move to next bidder or start trick phase
    this.state.currentBidderIndex++;
    
    if (this.state.currentBidderIndex >= this.state.biddingOrder.length) {
      this.startTrickPhase();
    } else {
      this.startBidTimer();
    }
  }

  private startTrickPhase() {
    // Capture the winner of the previous trick BEFORE clearing the state
    const previousTrickWinner = this.state.trickWinnerId;

    this.state.trickNumber++;
    this.state.phase = GamePhase.TRICK;
    this.state.currentTrick.clear();
    this.state.leadSuit = '';
    this.state.trickWinnerId = '';

    logger.log(`[GameRoom] Starting trick ${this.state.trickNumber}`);

    // Update all active player statuses (except disconnected players)
    this.state.players.forEach((player) => {
      if (!player.isSpectator && player.lives > 0 && player.status !== PlayerStatus.DISCONNECTED) {
        player.status = PlayerStatus.PLAYING;
      }
    });

    // First trick: bidding order leader starts
    // Subsequent tricks: previous trick winner starts
    const activePlayers = GameEngine.getActivePlayers(this.state.players);

    if (this.state.trickNumber === 1) {
      // First player in bidding order starts
      this.state.currentPlayerId = this.state.biddingOrder[0] ?? activePlayers[0] ?? '';
    } else {
      // Winner of last trick starts
      this.state.currentPlayerId = previousTrickWinner || (this.state.biddingOrder[0] ?? '');
    }

    // Broadcast trick start
    this.broadcast('trick_start', {
      trickNumber: this.state.trickNumber,
      startingPlayer: this.state.currentPlayerId,
    });

    // Check if current player is disconnected and auto-play for them
    this.handleDisconnectedPlayerTurn();
  }

  // Auto-play a card for disconnected players
  private handleDisconnectedPlayerTurn() {
    if (this.state.phase !== GamePhase.TRICK) return;

    const player = this.state.players.get(this.state.currentPlayerId);
    if (!player || player.status !== PlayerStatus.DISCONNECTED) return;

    // Player is disconnected, auto-play their first valid card
    if (player.hand.length === 0) return;

    const cardToPlay = player.hand[0];
    logger.log(`[GameRoom] Auto-playing card for disconnected player ${player.name}: ${cardToPlay.value} of ${cardToPlay.suit}`);

    // Remove card from hand
    const card = GameEngine.removeCardFromHand(player, cardToPlay.id);
    if (!card) return;

    // Update public hand count
    player.handCount = player.hand.length;

    // Add card to current trick
    const trickCard = new TrickCardSchema();
    trickCard.playerId = this.state.currentPlayerId;
    trickCard.card = card;
    trickCard.playOrder = this.state.currentTrick.length;
    this.state.currentTrick.push(trickCard);

    // Set lead suit if this is the first card
    if (this.state.currentTrick.length === 1) {
      this.state.leadSuit = card.suit;
    }

    // Check if trick is complete
    const activePlayers = GameEngine.getActivePlayers(this.state.players);
    if (this.state.currentTrick.length >= activePlayers.length) {
      // All players have played, resolve trick
      this.resolveTrick();
    } else {
      // Next player's turn
      this.state.currentPlayerId = GameEngine.getNextPlayer(this.state.currentPlayerId, activePlayers);
      // Recursively check if next player is also disconnected
      this.handleDisconnectedPlayerTurn();
    }
  }

  private resolveTrick() {
    this.state.phase = GamePhase.TRICK_END;

    // Determine winner
    const winnerId = GameEngine.determineTrickWinner(this.state.currentTrick);
    this.state.trickWinnerId = winnerId;

    const winner = this.state.players.get(winnerId);
    if (winner) {
      winner.tricksWon++;
      logger.log(`[GameRoom] ${winner.name} wins trick ${this.state.trickNumber} (total: ${winner.tricksWon})`);
    }

    // Broadcast trick result
    this.broadcast('trick_end', {
      trickNumber: this.state.trickNumber,
      winnerId: winnerId,
      winnerName: winner?.name,
    });

    // Wait a moment before starting next trick or ending round
    this.trickResolveTimer = this.clock.setTimeout(() => {
      // Check if more tricks to play
      const activePlayers = GameEngine.getActivePlayers(this.state.players);
      const anyCardsLeft = activePlayers.some(playerId => {
        const player = this.state.players.get(playerId);
        return player && player.hand.length > 0;
      });

      if (anyCardsLeft) {
        // More tricks to play
        this.startTrickPhase();
      } else {
        // Round complete
        this.endRound();
      }
    }, GameConfig.TRICK_RESOLVE_DELAY_MS);
  }

  private endRound() {
    this.state.phase = GamePhase.ROUND_END;
    
    logger.log(`[GameRoom] Round ${this.state.round} complete`);

    // Check each player's bid vs actual tricks
    const results: Array<{ playerId: string; name: string; bid: number; tricks: number; lostLife: boolean }> = [];
    
    this.state.players.forEach((player, playerId) => {
      if (player.isSpectator || player.lives <= 0) return;

      const success = player.bid === player.tricksWon;
      
      if (!success) {
        player.lives--;
        logger.log(`[GameRoom] ${player.name} loses a life (bid ${player.bid}, got ${player.tricksWon}). Lives: ${player.lives}`);
        
        if (player.lives <= 0) {
          player.status = PlayerStatus.ELIMINATED;
          player.isSpectator = true;
          logger.log(`[GameRoom] ${player.name} is eliminated!`);
        }
      } else {
        logger.log(`[GameRoom] ${player.name} succeeds (bid ${player.bid}, got ${player.tricksWon})`);
        // Award score points for correct bid
        player.score += player.bid + 10;
      }

      results.push({
        playerId,
        name: player.name,
        bid: player.bid,
        tricks: player.tricksWon,
        lostLife: !success,
      });
    });

    // Broadcast round results
    this.broadcast('round_end', {
      round: this.state.round,
      results,
    });

    // Determine round winner (start next round)
    // Winner is the player who made their bid with the highest score (highest bid)
    // If multiple players made their bid with same value, pick the one earlier in turn order (or random/first found)
    let bestBid = -1;
    let winnerId = '';
    
    results.forEach(r => {
      // Only consider players who made their bid (didn't lose a life)
      if (!r.lostLife) {
        if (r.bid > bestBid) {
          bestBid = r.bid;
          winnerId = r.playerId;
        }
      }
    });

    if (winnerId) {
      logger.log(`[GameRoom] Round winner is ${winnerId} with bid ${bestBid}`);
      this.lastRoundWinnerId = winnerId;
    } else {
      logger.log(`[GameRoom] No clear winner this round, maintaining standard rotation`);
      this.lastRoundWinnerId = '';
    }

    // Check if game is over
    if (this.checkGameOver()) {
      return;
    }

    // Advance to next card count
    const next = GameEngine.getNextCardCount(this.state.cardCountIndex);
    this.state.cardCountIndex = next.index;
    this.state.currentCardCount = next.count;

    // Start next round after a delay
    this.clock.setTimeout(() => {
      this.startNewRound();
    }, 2000);
  }

  private checkGameOver(): boolean {
    const activePlayers = GameEngine.getActivePlayers(this.state.players);
    
    if (activePlayers.length <= 1) {
      this.state.phase = GamePhase.GAME_OVER;
      
      const winnerId = activePlayers[0] || '';
      const winner = this.state.players.get(winnerId);
      
      logger.log(`[GameRoom] Game over! Winner: ${winner?.name || 'Nobody'}`);

      // Broadcast game over
      this.broadcast('game_over', {
        winnerId,
        winnerName: winner?.name,
        finalScores: Array.from(this.state.players.entries()).map(([id, p]) => ({
          playerId: id,
          name: p.name,
          score: p.score,
          lives: p.lives,
        })),
      });

      return true;
    }

    return false;
  }
}
