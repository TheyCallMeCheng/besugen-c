import { Schema, MapSchema, ArraySchema, type } from '@colyseus/schema';

// Card Schema
export class CardSchema extends Schema {
  @type('string') id: string = '';
  @type('string') suit: string = ''; // spades, clubs, diamonds, hearts
  @type('string') value: string = ''; // A, 2-10, J, Q, K
  @type('number') numericValue: number = 0; // 1-13 for comparison
}

// Trick Card Schema (card played in current trick)
export class TrickCardSchema extends Schema {
  @type('string') playerId: string = '';
  @type(CardSchema) card: CardSchema = new CardSchema();
  @type('number') playOrder: number = 0;
}

// Player Schema
export class PlayerSchema extends Schema {
  @type('string') id: string = '';
  @type('string') sessionId: string = '';
  @type('string') name: string = '';
  @type('string') status: string = 'waiting';
  @type('number') lives: number = 3;
  @type('number') score: number = 0;
  @type([CardSchema]) hand = new ArraySchema<CardSchema>();
  @type('boolean') isHost: boolean = false;
  @type('number') connectedAt: number = 0;
  // Round-specific state
  @type('number') bid: number = -1; // -1 = not yet bid
  @type('number') tricksWon: number = 0;
  @type('boolean') isSpectator: boolean = false;
}

// Game State Schema
export class GameStateSchema extends Schema {
  @type('string') roomId: string = '';
  @type('string') phase: string = 'lobby';
  @type({ map: PlayerSchema }) players = new MapSchema<PlayerSchema>();
  @type('string') currentPlayerId: string = '';
  @type('number') round: number = 0;
  @type([CardSchema]) deck = new ArraySchema<CardSchema>();
  @type([CardSchema]) discardPile = new ArraySchema<CardSchema>();
  @type('string') hostId: string = '';
  @type('number') createdAt: number = 0;
  @type('number') startedAt: number = 0;
  
  // Round state
  @type('number') cardCountIndex: number = 0; // Index in CARD_COUNTS [5,4,3,2,1]
  @type('number') currentCardCount: number = 5;
  
  // Bidding state
  @type(['string']) biddingOrder = new ArraySchema<string>(); // Player IDs in bidding order
  @type('number') currentBidderIndex: number = 0;
  @type('number') totalBids: number = 0;
  @type('number') bidTimerEnd: number = 0; // Timestamp when current bid timer expires
  
  // Trick state
  @type([TrickCardSchema]) currentTrick = new ArraySchema<TrickCardSchema>();
  @type('string') leadSuit: string = ''; // The suit of the first card played
  @type('number') trickNumber: number = 0;
  @type('string') trickWinnerId: string = '';
}
