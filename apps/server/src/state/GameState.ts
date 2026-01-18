import { Schema, MapSchema, ArraySchema, type } from '@colyseus/schema';

// Card Schema
export class CardSchema extends Schema {
  @type('string') id: string = '';
  @type('string') cardType: string = '';
  @type('number') value: number = 0;
  @type('string') name: string = '';
  @type('string') description: string = '';
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
}
