import { useState } from 'react';
import { MainMenu, Lobby, GameTable } from './components/screens';
import type { CardData } from './components/ui';

type Screen = 'menu' | 'lobby' | 'game';

// Demo data
const DEMO_PLAYERS = [
    { id: '1', name: 'AlexMike', isHost: true, isReady: true },
    { id: '2', name: 'SarahJ', isReady: true },
    { id: '3', name: 'Glitch01', isReady: true },
];

const DEMO_GAME_PLAYERS = [
    { id: '1', name: 'GlitchKing', score: 0, cardCount: 5, isCurrentTurn: true },
    { id: '2', name: 'PixelQueen', score: 95, cardCount: 2 },
    { id: '3', name: 'CyberNinja', score: 120, cardCount: 4 },
    { id: '4', name: 'RetroRogue', score: 80, cardCount: 3 },
    { id: '5', name: 'NeonVibe', score: 200, cardCount: 3 },
    { id: 'me', name: 'Player1', score: 350, cardCount: 4 },
];

const DEMO_HAND: CardData[] = [
    { id: 'c1', suit: 'hearts', rank: '7' },
    { id: 'c2', suit: 'clubs', rank: '10' },
    { id: 'c3', suit: 'diamonds', rank: 'K' },
    { id: 'c4', suit: 'clubs', rank: '9' },
];

const DEMO_LAST_PLAYED: CardData = { id: 'lp', suit: 'spades', rank: 'A' };

function App() {
    const [currentScreen, setCurrentScreen] = useState<Screen>('menu');

    const navigateTo = (screen: Screen) => {
        setCurrentScreen(screen);
    };

    // Main Menu
    if (currentScreen === 'menu') {
        return (
            <MainMenu
                playerName="PlayerOne"
                playerLevel={12}
                onPlayWithFriends={() => navigateTo('lobby')}
                onPlayOnline={() => navigateTo('lobby')}
                onSettings={() => console.log('Settings')}
                onRanking={() => console.log('Ranking')}
            />
        );
    }

    // Lobby
    if (currentScreen === 'lobby') {
        return (
            <Lobby
                roomCode="XY-982"
                players={DEMO_PLAYERS}
                maxPlayers={6}
                isHost={true}
                pointsToWin={500}
                minPlayers={3}
                onStartGame={() => navigateTo('game')}
                onInviteFriends={() => console.log('Invite')}
                onLeave={() => navigateTo('menu')}
                onCopyRoomCode={() => navigator.clipboard.writeText('XY-982')}
            />
        );
    }

    // Game Table
    if (currentScreen === 'game') {
        return (
            <GameTable
                round={3}
                potSize={2450}
                players={DEMO_GAME_PLAYERS}
                currentPlayerId="1"
                myPlayerId="me"
                myHand={DEMO_HAND}
                deckCount={24}
                lastPlayedCard={DEMO_LAST_PLAYED}
                lastPlayedBy="Ace of Spades"
                onPlayCard={(cardId) => console.log('Play card:', cardId)}
                onSortHand={() => console.log('Sort hand')}
                onPassTurn={() => console.log('Pass turn')}
                onSettings={() => navigateTo('menu')}
            />
        );
    }

    return null;
}

export default App;
