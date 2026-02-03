import { useState, useEffect, useRef } from 'react';
import { MainMenu, Lobby, GameTable } from './components/screens';
import { SettingsModal } from './components/ui';
import { PrivacyPolicy, TermsOfService } from './components/legal';
import { useGameRoom } from './hooks/useGameRoom';
import { shareActivity, isDiscordActivity } from './services/discord';
import { trackScreenView, trackPageLeave, trackRoomCreated, trackRoomJoined, trackGameStarted, trackGameEnded } from './services/analytics';

type Screen = 'home' | 'menu' | 'lobby' | 'game' | 'privacy' | 'terms';

// Get initial screen from URL path
function getInitialScreen(): Screen {
    const path = window.location.pathname;
    if (path === '/privacy' || path === '/privacy-policy') return 'privacy';
    if (path === '/terms' || path === '/terms-of-service') return 'terms';
    return 'home';
}

interface DiscordContext {
    isDiscord: boolean;
    userName: string | null;
    avatarUrl: string | null;
}

interface AppProps {
    discordContext?: DiscordContext;
}

function App({ discordContext }: AppProps) {
    const [currentScreen, setCurrentScreen] = useState<Screen>(getInitialScreen);
    // Use Discord username if available, otherwise empty for manual input
    const [playerName, setPlayerName] = useState(discordContext?.userName || '');
    const [roomCodeInput, setRoomCodeInput] = useState('');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const {
        room,
        gameState,
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
        sendKickPlayer,
        sortHand,
        wasKicked,
        clearKicked,
        isHost,
    } = useGameRoom();

    const [showReconnectPrompt, setShowReconnectPrompt] = useState(false);
    const [showKickedModal, setShowKickedModal] = useState(false);
    const prevPhaseRef = useRef<string | null>(null);
    const prevScreenRef = useRef<Screen>('home');

    // Track screen views and page leaves
    useEffect(() => {
        // Track leaving previous screen
        if (prevScreenRef.current !== currentScreen) {
            trackPageLeave(prevScreenRef.current);
        }
        // Track entering new screen
        trackScreenView(currentScreen);
        prevScreenRef.current = currentScreen;
    }, [currentScreen]);

    // Track game started/ended based on phase changes
    useEffect(() => {
        const prevPhase = prevPhaseRef.current;
        const currentPhase = gameState.phase;

        // Game started: transitioning from lobby to any game phase
        if (prevPhase === 'lobby' && currentPhase && currentPhase !== 'lobby') {
            trackGameStarted(gameState.players.length);
        }

        // Game ended: transitioning to game_over
        if (currentPhase === 'game_over' && prevPhase !== 'game_over') {
            const myPlayer = gameState.players.find(p => p.id === gameState.myPlayerId);
            const isWinner = myPlayer && myPlayer.lives > 0 && gameState.players.filter(p => p.lives > 0).length === 1;
            trackGameEnded({
                winner: isWinner || false,
                roundsPlayed: gameState.round,
                playerCount: gameState.players.length,
            });
        }

        prevPhaseRef.current = currentPhase;
    }, [gameState.phase]);

    // Check for reconnect opportunity on mount
    useEffect(() => {
        if (canReconnect() && !room) {
            setShowReconnectPrompt(true);
        }
    }, []);

    // Handle kicked from room
    useEffect(() => {
        if (wasKicked) {
            setShowKickedModal(true);
            setCurrentScreen('home');
        }
    }, [wasKicked]);

    // Handle kicked modal dismiss
    const handleKickedDismiss = () => {
        setShowKickedModal(false);
        clearKicked();
    };

    // Handle reconnection
    const handleReconnect = async () => {
        setShowReconnectPrompt(false);
        const success = await reconnect();
        if (success) {
            // Go directly to game screen since we're rejoining an active game
            setCurrentScreen('game');
        }
    };

    // Dismiss reconnect prompt
    const dismissReconnect = () => {
        setShowReconnectPrompt(false);
    };

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
        const roomId = await createRoom(name, discordContext?.avatarUrl || undefined);
        if (roomId) {
            trackRoomCreated(roomId);
        }
        setCurrentScreen('lobby');
    };

    // Handle joining an existing room
    const handleJoinRoom = async () => {
        if (!roomCodeInput) return;
        const name = playerName || `Player${Math.floor(Math.random() * 1000)}`;
        setPlayerName(name);
        const success = await joinRoom(roomCodeInput, name, discordContext?.avatarUrl || undefined);
        if (success) {
            trackRoomJoined(roomCodeInput);
            setCurrentScreen('lobby');
        }
    };

    // Handle leaving the room
    const handleLeave = () => {
        leaveRoom();
        setCurrentScreen('home');
    };

    // Navigate between screens based on game phase
    const gamePhase = gameState.phase;

    // Go to game screen when game starts (phase changes from lobby)
    const shouldShowGame = room && gamePhase && gamePhase !== 'lobby' && currentScreen === 'lobby';
    if (shouldShowGame) {
        setTimeout(() => setCurrentScreen('game'), 0);
    }

    // Return to lobby screen when game ends and resets to lobby phase
    const shouldReturnToLobby = room && gamePhase === 'lobby' && currentScreen === 'game';
    if (shouldReturnToLobby) {
        setTimeout(() => setCurrentScreen('lobby'), 0);
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
                <div className="min-h-screen bg-main-menu relative overflow-hidden flex items-center justify-center px-4 py-8">
                    <div className="menu-vignette" />
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute -top-24 left-1/3 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl animate-sway" />
                        <div className="absolute top-24 -left-10 h-56 w-56 rounded-full bg-emerald-400/15 blur-3xl animate-float" />
                        <div className="absolute bottom-12 right-10 h-64 w-64 rounded-full bg-amber-300/15 blur-3xl animate-float-delayed" />
                    </div>
                    <div className="menu-shell relative z-10 max-w-md w-full mx-4 p-6 md:p-8">
                        {/* Back button */}
                        <button
                            onClick={() => setCurrentScreen('home')}
                            className="mb-6 text-slate-300 hover:text-white transition-colors flex items-center gap-2"
                        >
                            <span>←</span>
                            <span>Back to Menu</span>
                        </button>

                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                                <span className="text-4xl">🂠</span>
                            </div>
                            <h1 className="text-3xl font-bold text-white mb-2 text-display">Play with Friends</h1>
                            <p className="text-slate-300">Create or join a private room</p>
                        </div>

                        {/* Player Name - show Discord user or input field */}
                        {discordContext?.isDiscord && discordContext.userName ? (
                            <div className="mb-6 flex items-center gap-4 bg-slate-950/60 border border-white/10 rounded-xl p-4">
                                {discordContext.avatarUrl && (
                                    <img
                                        src={discordContext.avatarUrl}
                                        alt="Discord avatar"
                                        className="w-12 h-12 rounded-full border-2 border-emerald-400"
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
                                    className="input-glass"
                                />
                            </div>
                        )}

                        {/* Create Room */}
                        <button
                            onClick={handleCreateRoom}
                            disabled={isConnecting}
                            className="fluid-button w-full rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-500 text-white font-semibold px-6 py-4 mb-5 hover:opacity-95 transition-opacity disabled:opacity-50 overflow-hidden"
                        >
                            {isConnecting ? 'Connecting...' : 'Create Room'}
                        </button>

                        {/* Join Room */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={roomCodeInput}
                                onChange={(e) => {
                                    setRoomCodeInput(e.target.value);
                                    if (error) setError(null);
                                }}
                                placeholder="Room code..."
                                className={`flex-1 input-glass ${
                                    error ? 'border-red-500 focus:ring-red-500' : ''
                                }`}
                            />
                            <button
                                onClick={handleJoinRoom}
                                disabled={isConnecting || !roomCodeInput}
                                className="fluid-button rounded-xl bg-slate-950/60 border border-white/10 text-white font-semibold px-6 py-3 hover:bg-white/10 transition-colors disabled:opacity-50"
                            >
                                Join
                            </button>
                        </div>
                        {/* Error tooltip - fixed height to prevent layout shift */}
                        <div className="h-6 mt-1">
                            {error && (
                                <p className="text-red-400 text-sm animate-pulse">{error}</p>
                            )}
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
                    myPlayerId={gameState.myPlayerId}
                    onStartGame={sendStartGame}
                    onToggleReady={sendReady}
                    onInviteFriends={handleShare}
                    onLeave={handleLeave}
                    onSettings={() => setIsSettingsOpen(true)}
                    onKickPlayer={sendKickPlayer}
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
                    onLeaveRoom={handleLeave}
                />
            );
        }

        // Privacy Policy
        if (currentScreen === 'privacy') {
            return (
                <PrivacyPolicy
                    onBack={() => {
                        window.history.pushState({}, '', '/');
                        setCurrentScreen('home');
                    }}
                />
            );
        }

        // Terms of Service
        if (currentScreen === 'terms') {
            return (
                <TermsOfService
                    onBack={() => {
                        window.history.pushState({}, '', '/');
                        setCurrentScreen('home');
                    }}
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
            {/* Reconnect Prompt Modal */}
            {showReconnectPrompt && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-slate-800 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl border border-slate-700">
                        <h2 className="text-xl font-bold text-white mb-3">Game in Progress</h2>
                        <p className="text-slate-400 mb-6">
                            You were disconnected from an active game. Would you like to rejoin?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={dismissReconnect}
                                className="flex-1 bg-slate-700 text-white font-semibold rounded-lg px-4 py-3 hover:bg-slate-600 transition-colors"
                            >
                                No, thanks
                            </button>
                            <button
                                onClick={handleReconnect}
                                disabled={isConnecting}
                                className="flex-1 bg-green-600 text-white font-semibold rounded-lg px-4 py-3 hover:bg-green-500 transition-colors disabled:opacity-50"
                            >
                                {isConnecting ? 'Reconnecting...' : 'Rejoin Game'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Kicked Modal */}
            {showKickedModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-slate-800 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl border border-slate-700">
                        <h2 className="text-xl font-bold text-white mb-3">Removed from Room</h2>
                        <p className="text-slate-400 mb-6">
                            You have been kicked from the room by the host.
                        </p>
                        <button
                            onClick={handleKickedDismiss}
                            className="w-full bg-slate-700 text-white font-semibold rounded-lg px-4 py-3 hover:bg-slate-600 transition-colors"
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export default App;
