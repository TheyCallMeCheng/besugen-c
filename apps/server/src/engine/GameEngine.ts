import { ArraySchema } from '@colyseus/schema';
import { CardSchema, PlayerSchema, TrickCardSchema } from '../state/GameState.js';
import { GameConfig, SuitRank, Suits, CardValues } from '@besugen/shared';
import type { SuitType, CardValueType } from '@besugen/shared';

/**
 * Core game engine for Besugen
 * Handles deck creation, card dealing, and trick resolution
 */
export class GameEngine {
  /**
   * Creates a shuffled deck of 104 cards (2 standard 52-card decks)
   */
  static createDeck(): ArraySchema<CardSchema> {
    const cards: CardSchema[] = [];
    
    // Create 2 decks
    for (let deckNum = 0; deckNum < 2; deckNum++) {
      for (const suit of Suits) {
        for (let i = 0; i < CardValues.length; i++) {
          const card = new CardSchema();
          card.id = `${suit}-${CardValues[i]}-${deckNum}`;
          card.suit = suit;
          card.value = CardValues[i];
          card.numericValue = i + 1; // A=1, 2=2, ... K=13
          cards.push(card);
        }
      }
    }
    
    // Shuffle the array using Fisher-Yates algorithm
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    
    // Convert to ArraySchema
    const deck = new ArraySchema<CardSchema>();
    for (const card of cards) {
      deck.push(card);
    }
    
    return deck;
  }

  /**
   * Deal cards to players
   */
  static dealCards(
    deck: ArraySchema<CardSchema>,
    players: Map<string, PlayerSchema>,
    cardCount: number,
    activePlayers: string[]
  ): void {
    // Clear all hands first
    for (const player of players.values()) {
      player.hand.clear();
      player.bid = -1;
      player.tricksWon = 0;
    }

    // Deal cards to each active player
    for (const playerId of activePlayers) {
      const player = players.get(playerId);
      if (!player || player.isSpectator) continue;

      for (let i = 0; i < cardCount; i++) {
        if (deck.length > 0) {
          const card = deck.pop();
          if (card) {
            player.hand.push(card);
          }
        }
      }
    }
  }

  /**
   * Get the suit rank (Hearts=4, Diamonds=3, Clubs=2, Spades=1)
   */
  static getSuitRank(suit: string): number {
    const suitUpper = suit.toUpperCase() as keyof typeof SuitRank;
    return SuitRank[suitUpper] || 0;
  }

  /**
   * Compare two cards and return which one wins
   * Returns > 0 if card1 wins, < 0 if card2 wins
   */
  static compareCards(card1: CardSchema, card2: CardSchema): number {
    // First compare by suit rank
    const suit1Rank = this.getSuitRank(card1.suit);
    const suit2Rank = this.getSuitRank(card2.suit);
    
    if (suit1Rank !== suit2Rank) {
      return suit1Rank - suit2Rank;
    }
    
    // Same suit, compare by value
    return card1.numericValue - card2.numericValue;
  }

  /**
   * Determine the winner of a trick
   * Returns the playerId of the winner
   */
  static determineTrickWinner(currentTrick: ArraySchema<TrickCardSchema>): string {
    if (currentTrick.length === 0) {
      return '';
    }

    let winningCard = currentTrick[0]!;
    
    for (let i = 1; i < currentTrick.length; i++) {
      const challenger = currentTrick[i]!;
      if (this.compareCards(challenger.card, winningCard.card) > 0) {
        winningCard = challenger;
      }
    }
    
    return winningCard.playerId;
  }

  /**
   * Calculate the maximum bid a player can make (limited by remaining tricks)
   */
  static calculateMaxBid(
    cardCount: number,
    totalBidsSoFar: number,
    isLastBidder: boolean
  ): number {
    // Bid cannot exceed remaining available tricks
    // Example: 5 cards, 3 bids so far. Max bid = 2.
    return Math.max(0, cardCount - totalBidsSoFar);
  }

  /**
   * Validate a bid
   */
  static isValidBid(
    bid: number,
    cardCount: number,
    totalBidsSoFar: number,
    isLastBidder: boolean
  ): boolean {
    if (bid < 0) return false;
    
    // Bid cannot exceed remaining available tricks
    if (totalBidsSoFar + bid > cardCount) {
      return false;
    }
    
    return true;
  }

  /**
   * Get the next card count in the sequence (5, 4, 3, 2, 1, 5, 4, ...)
   */
  static getNextCardCount(currentIndex: number): { index: number; count: number } {
    const nextIndex = (currentIndex + 1) % GameConfig.CARD_COUNTS.length;
    return {
      index: nextIndex,
      count: GameConfig.CARD_COUNTS[nextIndex],
    };
  }

  /**
   * Get active (non-spectator, non-eliminated) players in order
   */
  static getActivePlayers(players: Map<string, PlayerSchema>): string[] {
    return Array.from(players.entries())
      .filter(([_, player]) => !player.isSpectator && player.lives > 0)
      .sort((a, b) => a[1].connectedAt - b[1].connectedAt)
      .map(([id]) => id);
  }

  /**
   * Find the next player in turn order (for card playing)
   */
  static getNextPlayer(
    currentPlayerId: string,
    activePlayers: string[]
  ): string {
    const currentIndex = activePlayers.indexOf(currentPlayerId);
    if (currentIndex === -1) {
      return activePlayers[0] || '';
    }
    const nextIndex = (currentIndex + 1) % activePlayers.length;
    return activePlayers[nextIndex];
  }

  /**
   * Check if a player has a card in their hand
   */
  static playerHasCard(player: PlayerSchema, cardId: string): boolean {
    return player.hand.some(card => card.id === cardId);
  }

  /**
   * Remove a card from player's hand and return it
   */
  static removeCardFromHand(player: PlayerSchema, cardId: string): CardSchema | null {
    const cardIndex = player.hand.findIndex(card => card.id === cardId);
    if (cardIndex === -1) return null;
    
    const card = player.hand[cardIndex];
    if (!card) return null;
    player.hand.splice(cardIndex, 1);
    return card;
  }
}
