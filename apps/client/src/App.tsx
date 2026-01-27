import { useState, useEffect } from 'react';
import { MainMenu, Lobby, GameTable } from './components/screens';
import { SettingsModal } from './components/ui';
import { useGameRoom } from './hooks/useGameRoom';
import { shareActivity, isDiscordActivity } from './services/discord';

type Screen = 'home' | 'menu' | 'lobby' | 'game';

interface DiscordContext {
    isDiscord: boolean;
    userName: string | null;
    avatarUrl: string | null;
}

interface AppProps {
    discordContext?: DiscordContext;
}

function App({ discordContext }: AppProps) {
    const [currentScreen, setCurrentScreen] = useState<Screen>('home');
    // Use Discord username if available, otherwise empty for manual input
    const [playerName, setPlayerName] = useState(discordContext?.userName || '');
    const [roomCodeInput, setRoomCodeInput] = useState('');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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

    // Update player name if Discord context becomes available
    useEffect(() => {
        if (discordContext?.userName && !playerName) {
            setPlayerName(discordContext.userName);
        }
    }, [discordContext?.userName]);

    // Handle creating a new room
    const handleCreateRoom = async () => {
        const name = playerName || `Player${Math.floor(Math.random() * 1000)}`;
        setPlayerName(name);
        await createRoom(name, discordContext?.avatarUrl || undefined);
        setCurrentScreen('lobby');
    };

    // Handle joining an existing room
    const handleJoinRoom = async () => {
        if (!roomCodeInput) return;
        const name = playerName || `Player${Math.floor(Math.random() * 1000)}`;
        setPlayerName(name);
        await joinRoom(roomCodeInput, name, discordContext?.avatarUrl || undefined);
        setCurrentScreen('lobby');
    };

    // Handle leaving the room
    const handleLeave = () => {
        leaveRoom();
        setCurrentScreen('home');
    };

    // Navigate to game screen when game starts (phase changes from lobby)
    // This is handled by useEffect to avoid state updates during render
    const gamePhase = gameState.phase;
    const shouldShowGame = room && gamePhase && gamePhase !== 'lobby' && currentScreen === 'lobby';
    if (shouldShowGame) {
        // Use setTimeout to avoid updating state during render
        setTimeout(() => setCurrentScreen('game'), 0);
    }

    const renderScreen = () => {
        // Home Screen - Main Menu with navigation
        if (currentScreen === 'home') {
            return (
                <MainMenu
                    playerName={playerName || discordContext?.userName || 'Player'}
                    avatarUrl={discordContext?.avatarUrl || undefined}
                    playerLevel={12}
                    onPlayWithFriends={() => setCurrentScreen('menu')}
                    onPlayOnline={() => {
                        // TODO: Implement online matchmaking
                        console.log('Play Online clicked');
                    }}
                    onSettings={() => setIsSettingsOpen(true)}
                    onRanking={() => {
                        // TODO: Implement ranking
                        console.log('Ranking clicked');
                    }}
                />
            );
        }

        // Create/Join Room Menu
        if (currentScreen === 'menu') {
            return (
                <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                    <div className="bg-slate-800/80 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-slate-700">
                        {/* Back button */}
                        <button
                            onClick={() => setCurrentScreen('home')}
                            className="mb-4 text-slate-400 hover:text-white transition-colors flex items-center gap-2"
                        >
                            <span>←</span>
                            <span>Back to Menu</span>
                        </button>

                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-green-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                                <span className="text-4xl">🂠</span>
                            </div>
                            <h1 className="text-3xl font-bold text-white mb-2">Play with Friends</h1>
                            <p className="text-slate-400">Create or join a private room</p>
                        </div>

                        {error && (
                            <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Player Name - show Discord user or input field */}
                        {discordContext?.isDiscord && discordContext.userName ? (
                            <div className="mb-6 flex items-center gap-4 bg-slate-700/50 rounded-lg p-4">
                                {discordContext.avatarUrl && (
                                    <img
                                        src={discordContext.avatarUrl}
                                        alt="Discord avatar"
                                        className="w-12 h-12 rounded-full border-2 border-green-500"
                                    />
                                )}
                                <div>
                                    <p className="text-slate-400 text-sm">Playing as</p>
                                    <p className="text-white font-semibold text-lg">{discordContext.userName}</p>
                                </div>
                            </div>
                        ) : (
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
                        )}

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
                imageUrl: p.avatarUrl || undefined,
                isHost: p.isHost,
                isReady: p.status === 'ready',
            }));

            const handleShare = async () => {
                if (isDiscordActivity()) {
                    await shareActivity(room.roomId);
                } else {
                    await navigator.clipboard.writeText(room.roomId);
                }
            };

            return (
                <Lobby
                    roomCode={room.roomId}
                    players={lobbyPlayers}
                    maxPlayers={6}
                    isHost={isHost}
                    minPlayers={2}
                    onStartGame={sendStartGame}
                    onToggleReady={sendReady}
                    onInviteFriends={handleShare}
                    onLeave={handleLeave}
                />
            );
        }

        // Game Table
        if (currentScreen === 'game' && room) {
            return (
                <GameTable
                    round={gameState.round}
                    phase={gameState.phase}
                    players={gameState.players.map(p => ({ ...p, imageUrl: p.avatarUrl || undefined }))}
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
                    onSettings={() => setIsSettingsOpen(true)}
                />
            );
        }

        return null;
    };

    return (
        <>
            {renderScreen()}
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />
        </>
    );
}

export default App;
