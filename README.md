# Besugen

Besugen is a real-time multiplayer trick-taking card game built as a Discord Activity.

Players predict how many tricks they will win each round, then play cards and try to match their bid exactly. If a player misses their bid, they lose a life. The last player standing wins.

## Features

- Real-time multiplayer rooms
- Discord Activity integration
- Private room creation and room-code joining
- Discord user authentication and avatars
- Host controls, including starting games and kicking players
- Reconnection support for interrupted sessions
- Automatic synchronized game state with Colyseus
- Bidding timer and trick resolution flow
- Client-side card sorting
- Privacy Policy and Terms of Service pages
- PostHog analytics support

## Gameplay

Besugen is designed for 2 to 6 players.

Each player starts with 3 lives. A game is played over repeated rounds using the card-count sequence:

```text
5 → 4 → 3 → 2 → 1 → repeat
```

At the start of each round:

1. Cards are dealt to all active players.
2. Each player bids how many tricks they think they will win.
3. Players take turns playing one card per trick.
4. The strongest card wins the trick.
5. At the end of the round, each player's bid is compared to their actual tricks won.
6. Players who miss their bid lose 1 life.
7. Players with 0 lives are eliminated.
8. The last remaining player wins.

## Card Rules

Besugen uses two standard 52-card decks, for a total of 104 cards.

Suit strength is fixed:

```text
Hearts > Diamonds > Clubs > Spades
```

Card value strength is:

```text
K > Q > J > 10 > 9 > 8 > 7 > 6 > 5 > 4 > 3 > 2 > A
```

There are no trump or lead-suit restrictions. Trick winners are determined by the strongest card according to suit first, then value.

## Tech Stack

| Area | Technology |
|---|---|
| Frontend | React 18, Vite, TypeScript |
| Backend | Node.js, Express, Colyseus |
| Real-time sync | Colyseus Schema |
| Discord | Discord Embedded App SDK |
| Analytics | PostHog |
| Package manager | pnpm workspaces |
| Deployment | PM2, Nginx |

## Project Structure

```text
besugen-c/
├── apps/
│   ├── client/              # React + Vite frontend
│   │   ├── src/
│   │   │   ├── App.tsx
│   │   │   ├── main.tsx
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── utils/
│   │   └── vite.config.ts
│   │
│   └── server/              # Node.js + Colyseus backend
│       ├── src/
│       │   ├── index.ts
│       │   ├── rooms/
│       │   ├── engine/
│       │   ├── state/
│       │   └── logger.ts
│       └── package.json
│
├── packages/
│   └── shared/              # Shared types and constants
│       └── src/
│           ├── constants/
│           └── types/
│
├── docs/
├── demo/
├── package.json
├── pnpm-workspace.yaml
├── ecosystem.config.cjs
└── DEPLOY.md
```

## Requirements

- Node.js 18 or newer
- pnpm 9 or newer

## Environment Variables

Create the required environment files before running the project.

### Root `.env`

Used by the Vite client build.

```env
VITE_DISCORD_CLIENT_ID=your_discord_app_id
VITE_COLYSEUS_URL=ws://localhost:2567
VITE_PUBLIC_POSTHOG_KEY=your_posthog_key
VITE_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### `apps/server/.env`

Used by the backend server.

```env
PORT=2567
DISCORD_CLIENT_ID=your_discord_app_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
```

## Installation

```bash
pnpm install
```

## Running Locally

Start both the client and server:

```bash
pnpm dev
```

Run only the client:

```bash
pnpm dev:client
```

Run only the server:

```bash
pnpm dev:server
```

By default:

- Client runs on `http://localhost:5173`
- Server runs on `http://localhost:2567`
- Colyseus WebSocket server uses the same backend port

## Building

Build all workspaces:

```bash
pnpm build
```

Build only the client:

```bash
pnpm build:client
```

Build only the server:

```bash
pnpm build:server
```

The client build output is generated in:

```text
apps/client/dist/
```

The server build output is generated in:

```text
apps/server/dist/
```

## Type Checking

```bash
pnpm typecheck
```

## Linting

```bash
pnpm lint
```

## Deployment

The current production setup uses Nginx to serve the frontend and PM2 to run the backend.

Typical deployment flow:

```bash
cd /root/besugen-c
git pull
pnpm install
pnpm build
pm2 restart besugen-server
```

Useful PM2 commands:

```bash
pm2 status
pm2 logs
pm2 logs --lines 50
pm2 restart besugen-server
pm2 stop besugen-server
pm2 start ecosystem.config.cjs
```

Reload Nginx after configuration changes:

```bash
nginx -t && systemctl reload nginx
```

## Discord Activity Setup

Besugen is designed to run as a Discord Activity.

The Discord integration includes:

- Discord Embedded App SDK initialization
- OAuth authorization
- Backend token exchange
- Authenticated Discord user data
- Activity sharing support

The backend exposes the Discord token exchange endpoint at:

```text
/token
```

In Discord Activity mode, the client calls:

```text
/.proxy/api/token
```

Discord URL mapping should route API traffic to the backend.

## Game Flow

The game moves through the following phases:

```text
LOBBY → DEALING → BIDDING → TRICK → TRICK_END → ROUND_END → GAME_OVER
```

### Lobby

Players join the room, toggle ready status, and wait for the host to start the game.

### Dealing

Cards are dealt to active players according to the current round's card count.

### Bidding

Players take turns bidding how many tricks they expect to win.

### Trick

Players play one card each. The strongest card wins the trick.

### Trick End

The winner is shown briefly before the next trick begins.

### Round End

Bids are compared with tricks won. Players who missed their bid lose a life.

### Game Over

The last player with remaining lives is declared the winner.

## Shared Package

The `@besugen/shared` package contains shared TypeScript types, constants, game phases, player statuses, card values, suit rankings, and game configuration used by both the client and server.

## Main Scripts

```bash
pnpm dev            # Start client and server
pnpm dev:client     # Start only the client
pnpm dev:server     # Start only the server
pnpm build          # Build all workspaces
pnpm build:client   # Build the client
pnpm build:server   # Build the server
pnpm clean          # Clean build outputs
pnpm typecheck      # Run TypeScript checks
pnpm lint           # Run linting
```

## License

No license file is currently included in this repository.
