import { useState } from 'react';
import { MainMenu, Lobby, GameTable } from './components/screens';
import { useGameRoom } from './hooks/useGameRoom';

type Screen = 'menu' | 'lobby' | 'game';

function App() {
    const [currentScreen, setCurrentScreen] = useState<Screen>('menu');
    const [playerName, setPlayerName] = useState('');
    const [roomCodeInput, setRoomCodeInput] = useState('');

    const {
        room,
        gameState,
        isConnecting,
        error,
        createRoom,
        joinRoom,
        leaveRoom,
        sendReady,
        sendStartGame,
        sendBid,
        sendPlayCard,
        sortHand,
        isHost,
    } = useGameRoom();

    // Handle creating a new room
    const handleCreateRoom = async () => {
        const name = playerName || `Player${Math.floor(Math.random() * 1000)}`;
        setPlayerName(name);
        await createRoom(name);
        setCurrentScreen('lobby');
    };

    // Handle joining an existing room
    const handleJoinRoom = async () => {
        if (!roomCodeInput) return;
        const name = playerName || `Player${Math.floor(Math.random() * 1000)}`;
        setPlayerName(name);
        await joinRoom(roomCodeInput, name);
        setCurrentScreen('lobby');
    };

    // Handle leaving the room
    const handleLeave = () => {
        leaveRoom();
        setCurrentScreen('menu');
    };

    // Navigate to game screen when game starts (phase changes from lobby)
    // This is handled by useEffect to avoid state updates during render
    const gamePhase = gameState.phase;
    const shouldShowGame = room && gamePhase && gamePhase !== 'lobby' && currentScreen === 'lobby';
    if (shouldShowGame) {
        // Use setTimeout to avoid updating state during render
        setTimeout(() => setCurrentScreen('game'), 0);
    }

    // Main Menu
    if (currentScreen === 'menu') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="bg-slate-800/80 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-slate-700">
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-green-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                            <span className="text-4xl">🂠</span>
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Besugen</h1>
                        <p className="text-slate-400">Trick-taking card game</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Player Name */}
                    <div className="mb-6">
                        <label className="block text-slate-400 text-sm mb-2">Your Name</label>
                        <input
                            type="text"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            placeholder="Enter your name..."
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    {/* Create Room */}
                    <button
                        onClick={handleCreateRoom}
                        disabled={isConnecting}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg px-6 py-4 mb-4 hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {isConnecting ? 'Connecting...' : 'Create Room'}
                    </button>

                    {/* Join Room */}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={roomCodeInput}
                            onChange={(e) => setRoomCodeInput(e.target.value)}
                            placeholder="Room code..."
                            className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={handleJoinRoom}
                            disabled={isConnecting || !roomCodeInput}
                            className="bg-blue-600 text-white font-semibold rounded-lg px-6 py-3 hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            Join
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Lobby
    if (currentScreen === 'lobby' && room) {
        const lobbyPlayers = gameState.players.map(p => ({
            id: p.id,
            name: p.name,
            isHost: p.isHost,
            isReady: p.status === 'ready',
        }));

        return (
            <Lobby
                roomCode={room.roomId}
                players={lobbyPlayers}
                maxPlayers={6}
                isHost={isHost}
                minPlayers={2}
                onStartGame={sendStartGame}
                onToggleReady={sendReady}
                onLeave={handleLeave}
                onCopyRoomCode={() => navigator.clipboard.writeText(room.roomId)}
            />
        );
    }

    // Game Table
    if (currentScreen === 'game' && room) {
        const myPlayer = gameState.players.find(p => p.id === gameState.myPlayerId);

        return (
            <GameTable
                round={gameState.round}
                phase={gameState.phase}
                players={gameState.players}
                currentPlayerId={gameState.currentPlayerId}
                myPlayerId={gameState.myPlayerId}
                myHand={gameState.myHand}
                deckCount={gameState.deckCount}
                bidTimerEnd={gameState.bidTimerEnd}
                totalBidsSoFar={gameState.totalBids}
                currentBidderIndex={gameState.currentBidderIndex}
                biddingOrder={gameState.biddingOrder}
                currentTrick={gameState.currentTrick}
                trickWinnerId={gameState.trickWinnerId}
                onPlayCard={sendPlayCard}
                onSortHand={sortHand}
                onSubmitBid={sendBid}
                onSettings={handleLeave}
            />
        );
    }

    return null;
}

export default App;
