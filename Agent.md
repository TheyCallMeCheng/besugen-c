# Besugen - AI Agent Guide

> **Purpose**: This document helps LLM coding assistants understand the Besugen codebase quickly, saving tokens and reducing exploration time.

## Project Overview

**Besugen** is a real-time multiplayer card game built as a **Discord Activity** (embedded app that runs inside Discord). Players bid on how many tricks they'll win each round, then play cards to win exactly that many tricks. Miss your bid? Lose a life. Last player standing wins.

### Tech Stack
- **Frontend**: React 18 + Vite + TypeScript
- **Backend**: Node.js + Express + Colyseus (WebSocket game server)
- **State Sync**: Colyseus Schema (automatic state synchronization)
- **Discord**: Embedded App SDK for Discord Activity integration
- **Analytics**: PostHog
- **Package Manager**: pnpm (monorepo with workspaces)
- **Deployment**: PM2 + Nginx on Linux server

---

## Architecture

```
besugen-c/
├── apps/
│   ├── client/                 # React SPA (Vite)
│   │   ├── src/
│   │   │   ├── App.tsx              # Main app, screen routing, game flow
│   │   │   ├── main.tsx             # Entry point, Discord SDK init
│   │   │   ├── components/
│   │   │   │   ├── screens/         # Full-page views
│   │   │   │   │   ├── MainMenu.tsx    # Home screen with play buttons
│   │   │   │   │   ├── Lobby.tsx       # Room waiting area
│   │   │   │   │   └── GameTable.tsx   # Main game UI
│   │   │   │   ├── ui/              # Reusable components
│   │   │   │   │   ├── PlayingCard.tsx
│   │   │   │   │   ├── BiddingModal.tsx
│   │   │   │   │   ├── TrickArea.tsx
│   │   │   │   │   ├── PlayerAvatar.tsx
│   │   │   │   │   ├── SettingsModal.tsx
│   │   │   │   │   └── TutorialModal.tsx
│   │   │   │   └── legal/           # Privacy/Terms pages
│   │   │   ├── hooks/
│   │   │   │   └── useGameRoom.ts   # Main game state hook (Colyseus)
│   │   │   ├── services/
│   │   │   │   ├── discord.ts       # Discord SDK wrapper
│   │   │   │   ├── colyseus.ts      # Colyseus client service
│   │   │   │   └── analytics.ts     # PostHog tracking
│   │   │   └── utils/
│   │   │       └── soundManager.ts  # Audio/music handling
│   │   └── vite.config.ts           # Vite config with proxy setup
│   │
│   └── server/                 # Node.js backend
│       └── src/
│           ├── index.ts             # Express + Colyseus server setup
│           ├── rooms/
│           │   └── GameRoom.ts      # Main game room (all game logic)
│           ├── engine/
│           │   └── GameEngine.ts    # Pure game logic (deck, tricks, bids)
│           ├── state/
│           │   └── GameState.ts     # Colyseus Schema definitions
│           └── logger.ts            # Logging utility
│
├── packages/
│   └── shared/                 # Shared types & constants
│       └── src/
│           ├── types/index.ts       # TypeScript interfaces
│           └── constants/index.ts   # Game config, enums, phases
│
├── ecosystem.config.cjs        # PM2 production config
├── package.json                # Monorepo root
└── .env                        # Environment variables (not committed)
```

---

## Key Concepts

### 1. Game Flow (Phases)

```
LOBBY → DEALING → BIDDING → TRICK → TRICK_END → ROUND_END → (repeat or GAME_OVER)
```

| Phase | Description |
|-------|-------------|
| `lobby` | Players join/leave, toggle ready, host can start |
| `dealing` | Cards dealt to players (5→4→3→2→1 pattern) |
| `bidding` | Each player bids how many tricks they'll win (10s timer) |
| `trick` | Players take turns playing one card each |
| `trick_end` | Winner determined, brief pause to show result |
| `round_end` | Compare bids vs tricks won, lose life if wrong |
| `game_over` | One player remains, show winner, return to lobby |

### 2. Card Rules

- **Deck**: 104 cards (2 standard 52-card decks)
- **Suit Ranking**: Hearts > Diamonds > Clubs > Spades (always)
- **Value Ranking**: K > Q > J > 10 > ... > 2 > A
- **Trick Winner**: Highest suit rank wins. If same suit, highest value wins.
- **No trump/lead suit rules**: Pure hierarchy comparison

### 3. Discord Activity Integration

The app runs inside Discord as an "Activity" (iframe). Key points:

- **Detection**: `isDiscordActivity()` checks for `frame_id`, `instance_id` params or Discord domains
- **Auth Flow**:
  1. `discordSdk.commands.authorize()` → get auth code
  2. POST to `/.proxy/api/token` → exchange for access token
  3. `discordSdk.commands.authenticate()` → get user info
- **URL Mapping**: Discord strips `/.proxy/` prefix, so `/.proxy/api/token` → `/token` on server
- **State Storage**: Discord user stored in module-level variables in `discord.ts`

**CRITICAL**: Navigation must be client-side (React state) not `<a href>`. Full page loads lose Discord SDK state.

### 4. Colyseus State Sync

Server state automatically syncs to all clients via Colyseus Schema:

```typescript
// Server (GameState.ts)
@type({ map: PlayerSchema }) players = new MapSchema<PlayerSchema>();
@type('string') phase: string = 'lobby';

// Client (useGameRoom.ts)
room.onStateChange(() => {
  // Automatically called when any state changes
  const players = Array.from(room.state.players.values());
});
```

**Message Types** (client → server):
- `ready` - Toggle ready status in lobby
- `start_game` - Host starts the game
- `submit_bid` - Submit bid during bidding phase
- `play_card` - Play a card during trick phase
- `kick_player` - Host kicks a player (lobby only)

---

## Important Files Deep Dive

### `apps/client/src/App.tsx`
- **Screen routing** via `useState<Screen>` (not React Router)
- **Screens**: `'home' | 'menu' | 'lobby' | 'game' | 'privacy' | 'terms'`
- Receives `discordContext` prop with user info from `main.tsx`
- Auto-transitions between screens based on `gameState.phase`

### `apps/client/src/hooks/useGameRoom.ts`
- **Main game state hook** - wraps Colyseus room
- Returns: `room`, `gameState`, `isConnecting`, `error`, game actions
- `gameState` structure matches what components expect
- Handles reconnection via `sessionStorage` token (60s window)

### `apps/server/src/rooms/GameRoom.ts`
- **All server-side game logic lives here**
- Handles: join/leave, ready, start, bidding, card play, kick
- Manages timers for bids and trick resolution
- Auto-plays for disconnected players
- Resets to lobby after game over

### `apps/server/src/engine/GameEngine.ts`
- **Pure game logic** (no Colyseus dependencies conceptually)
- `createDeck()` - Creates shuffled 104-card deck
- `dealCards()` - Distributes cards to players
- `determineTrickWinner()` - Compares cards, returns winner
- `isValidBid()` - Validates bid constraints
- `getActivePlayers()` - Returns non-eliminated player IDs

### `packages/shared/src/constants/index.ts`
- `GamePhase` - All phase string constants
- `PlayerStatus` - Player state constants
- `SuitRank` - Hearts=4, Diamonds=3, Clubs=2, Spades=1
- `GameConfig` - Min/max players, timeouts, card counts, etc.

---

## Environment Variables

```bash
# .env (root)
VITE_DISCORD_CLIENT_ID=your_discord_app_id
DISCORD_CLIENT_ID=your_discord_app_id
DISCORD_CLIENT_SECRET=your_discord_secret
VITE_COLYSEUS_URL=ws://localhost:2567
VITE_PUBLIC_POSTHOG_KEY=your_posthog_key
VITE_PUBLIC_POSTHOG_HOST=https://app.posthog.com
PORT=2567
```

---

## Common Tasks

### Running Locally
```bash
pnpm install          # Install all dependencies
pnpm dev              # Start both client (5173) and server (2567)
pnpm dev:client       # Start only client
pnpm dev:server       # Start only server
```

### Building
```bash
pnpm build            # Build both client and server
pnpm build:client     # Build only client → apps/client/dist/
pnpm build:server     # Build only server → apps/server/dist/
```

### Deploying (Production)
```bash
# On server
cd /root/besugen-c
git pull
pnpm install
pnpm build
pm2 restart besugen-server
```

### Testing Discord Activity
1. Set up Discord Developer Portal with URL mappings
2. Run `cloudflared tunnel` or similar for HTTPS
3. Use Discord's Activity development tools

---

## Gotchas & Common Issues

### 1. Discord Auth Lost on Navigation
**Problem**: Using `<a href="/privacy">` causes full page reload, losing Discord SDK state.
**Solution**: Use `onClick={() => setCurrentScreen('privacy')}` for client-side navigation.

### 2. Colyseus State Not Updating
**Problem**: `onStateChange` not firing immediately after join.
**Solution**: Poll for initial state (see `createRoom` in `useGameRoom.ts`).

### 3. WebSocket Connection in Discord
**Problem**: WebSocket URLs need special handling in Discord Activities.
**Solution**: Use same-origin connection with protocol detection:
```typescript
const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
return `${protocol}//${window.location.host}`;
```

### 4. Vite Proxy for Development
The client's `vite.config.ts` proxies:
- `/matchmake/*` → `http://localhost:2567` (Colyseus HTTP)
- `/colyseus/*` → `ws://localhost:2567` (Colyseus WS)
- `/api/*` → `http://localhost:2567` (strips `/api` prefix)

### 5. Player Hand Privacy
- `player.hand` (ArraySchema) is only sent to that player
- `player.handCount` (number) is public to all clients
- Filter logic happens automatically via Colyseus

---

## Game Rules Summary

1. **2-6 players** can play
2. Each player starts with **3 lives**
3. Rounds deal **5, 4, 3, 2, 1** cards (then repeats)
4. **Bidding**: Predict tricks you'll win (0 to cards dealt)
5. **Playing**: Take turns playing cards, highest wins trick
6. **Scoring**: Bid matches tricks won = safe. Otherwise lose 1 life.
7. **Elimination**: 0 lives = spectator mode
8. **Victory**: Last player with lives wins

---

## Quick Reference

| What | Where |
|------|-------|
| Discord SDK setup | `apps/client/src/services/discord.ts` |
| Game state hook | `apps/client/src/hooks/useGameRoom.ts` |
| Server game logic | `apps/server/src/rooms/GameRoom.ts` |
| Card/trick logic | `apps/server/src/engine/GameEngine.ts` |
| State schemas | `apps/server/src/state/GameState.ts` |
| Shared types | `packages/shared/src/types/index.ts` |
| Game constants | `packages/shared/src/constants/index.ts` |
| Main UI screens | `apps/client/src/components/screens/` |
| UI components | `apps/client/src/components/ui/` |

---

## Code Patterns

### Adding a New Game Action

1. **Add message handler in `GameRoom.ts`**:
```typescript
this.onMessage('my_action', (client, message) => {
  this.handleMyAction(client, message);
});
```

2. **Add method in `ColyseusService`**:
```typescript
sendMyAction(data: MyData): void {
  this.room?.send('my_action', data);
}
```

3. **Add callback in `useGameRoom.ts`**:
```typescript
const sendMyAction = useCallback((data: MyData) =>
  colyseusService.sendMyAction(data), []);
```

### Adding a New Screen

1. Create component in `apps/client/src/components/screens/`
2. Add to `Screen` type in `App.tsx`
3. Add case in `renderScreen()` function
4. Add navigation callback if needed

### Adding Shared Types

1. Add interface in `packages/shared/src/types/index.ts`
2. Export from `packages/shared/src/index.ts`
3. Import as `import { MyType } from '@besugen/shared'`

---

*Last updated: February 2026*
