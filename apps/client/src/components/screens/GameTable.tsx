import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Settings, Eye, Play } from 'lucide-react';
import { PlayerAvatar, PlayingCard, CardFan, BiddingModal, TrickArea, type CardData, type TrickCardData } from '../ui';
import { soundManager } from '../../utils/soundManager';

// Hook to detect mobile screen
function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return isMobile;
}


interface Player {
    id: string;
    name: string;
    imageUrl?: string;
    score: number;
    cardCount: number;
    isCurrentTurn?: boolean;
    status?: string;
    // Game-specific
    lives?: number;
    bid?: number;
    tricksWon?: number;
    isSpectator?: boolean;
}

type GamePhase = 'lobby' | 'dealing' | 'bidding' | 'trick' | 'trick_end' | 'round_end' | 'game_over';

interface GameTableProps {
    roomId?: string;
    round: number;
    phase: GamePhase;
    players: Player[];
    currentPlayerId?: string;
    myPlayerId: string;
    myHand: CardData[];
    deckCount: number;
    // Bidding state
    bidTimerEnd?: number;
    totalBidsSoFar?: number;
    currentBidderIndex?: number;
    biddingOrder?: string[];
    // Trick state
    currentTrick?: TrickCardData[];
    trickWinnerId?: string;
    // Callbacks
    onPlayCard?: (cardId: string) => void;
    onSortHand?: () => void;
    onSubmitBid?: (bid: number) => void;
    onSettings?: () => void;
    onLeaveRoom?: () => void;
}

// Position players around an oval table - Desktop
const DESKTOP_PLAYER_POSITIONS = [
    { top: '50%', left: '5%', transform: 'translateY(-50%)' },      // Left
    { top: '12%', left: '25%', transform: 'translate(-50%, -50%)' }, // Top-left
    { top: '8%', left: '50%', transform: 'translate(-50%, -50%)' },  // Top
    { top: '12%', right: '25%', transform: 'translate(50%, -50%)' }, // Top-right
    { top: '50%', right: '5%', transform: 'translateY(-50%)' },      // Right
];

// Mobile positions - horizontal row at top
const MOBILE_PLAYER_POSITIONS = [
    { top: '72px', left: '10%', transform: 'translateX(-50%)' },
    { top: '72px', left: '30%', transform: 'translateX(-50%)' },
    { top: '72px', left: '50%', transform: 'translateX(-50%)' },
    { top: '72px', left: '70%', transform: 'translateX(-50%)' },
    { top: '72px', left: '90%', transform: 'translateX(-50%)' },
];

export function GameTable({
    round,
    phase,
    players,
    currentPlayerId,
    myPlayerId,
    myHand,
    deckCount,
    bidTimerEnd,
    totalBidsSoFar = 0,
    currentBidderIndex = 0,
    biddingOrder = [],
    currentTrick = [],
    trickWinnerId,
    onPlayCard,
    onSortHand,
    onSubmitBid,
    onSettings,
    onLeaveRoom,
}: GameTableProps) {
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
    const prevIsMyTurnRef = useRef(false);
    const isMobile = useIsMobile();

    // Get other players (not me)
    const otherPlayers = players.filter((p) => p.id !== myPlayerId);
    const playerPositions = isMobile ? MOBILE_PLAYER_POSITIONS : DESKTOP_PLAYER_POSITIONS;
    const myPlayer = players.find((p) => p.id === myPlayerId);
    const isMyTurn = currentPlayerId === myPlayerId;
    const isBiddingPhase = phase === 'bidding';
    const isTrickPhase = phase === 'trick' || phase === 'trick_end';
    const isSpectator = myPlayer?.isSpectator ?? false;

    // Play sound when it becomes your turn
    useEffect(() => {
        if (isMyTurn && !prevIsMyTurnRef.current && isTrickPhase && !isSpectator) {
            soundManager.play('turnStart');
        }
        prevIsMyTurnRef.current = isMyTurn;
    }, [isMyTurn, isTrickPhase, isSpectator]);

    // Bidding info
    const currentBidderId = biddingOrder[currentBidderIndex];
    const currentBidder = players.find(p => p.id === currentBidderId);
    const isMyBidTurn = currentBidderId === myPlayerId;
    const isLastBidder = currentBidderIndex === biddingOrder.length - 1;
    const cardCount = myHand.length || 5;

    // Get bids from players who have already bid
    const otherPlayerBids = players
        .filter(p => p.bid !== undefined && p.bid >= 0 && p.id !== myPlayerId)
        .map(p => ({ name: p.name, bid: p.bid! }));

    const handlePlaySelected = () => {
        if (selectedCardId && !isSpectator) {
            soundManager.play('cardPlay');
            onPlayCard?.(selectedCardId);
            setSelectedCardId(null);
        }
    };

    return (
        <div className="min-h-screen bg-game-table relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-emerald-400/15 blur-3xl animate-float" />
                <div className="absolute top-20 right-10 h-56 w-56 rounded-full bg-cyan-400/15 blur-3xl animate-float-delayed" />
                <div className="absolute bottom-10 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-amber-300/10 blur-3xl animate-sway" />
            </div>
            {/* Header */}
            <header className="absolute top-0 left-0 right-0 p-2 md:p-4 flex justify-between items-center z-10">
                <div className="flex items-center gap-1 md:gap-4">
                    {/* Logo - icon only on mobile */}
                    <div className="flex items-center gap-2 bg-slate-950/70 border border-white/10 rounded-lg px-2 md:px-4 py-1.5 md:py-2 backdrop-blur">
                        <div className="w-6 h-6 md:w-8 md:h-8 bg-green-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs md:text-sm">🂠</span>
                        </div>
                        <span className="text-white font-semibold hidden md:inline">Besugen</span>
                    </div>

                    {/* Round indicator */}
                    <div className="bg-slate-950/70 border border-white/10 rounded-lg px-2 md:px-4 py-1.5 md:py-2 backdrop-blur">
                        <span className="text-slate-400 text-xs md:text-base">R{round}</span>
                    </div>

                    {/* Phase indicator - hidden on mobile, shown in center area instead */}
                    <div className="bg-slate-950/70 border border-white/10 rounded-lg px-2 md:px-4 py-1.5 md:py-2 hidden md:block backdrop-blur">
                        <span className={`capitalize ${phase === 'bidding' ? 'text-amber-400' :
                            phase === 'trick' ? 'text-green-400' :
                                phase === 'game_over' ? 'text-red-400' :
                                    'text-slate-400'
                            }`}>
                            {(phase ?? 'loading').replace('_', ' ')}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-1 md:gap-4">
                    {/* Cards per round */}
                    <div className="bg-slate-950/70 border border-white/10 rounded-lg px-2 md:px-4 py-1.5 md:py-2 flex items-center gap-1 md:gap-2 backdrop-blur">
                        <span className="text-slate-400 text-xs hidden md:inline">CARDS</span>
                        <span className="text-white font-bold text-sm md:text-xl">{cardCount}</span>
                    </div>

                    {/* Settings */}
                    <motion.button
                        onClick={onSettings}
                        className="w-8 h-8 md:w-10 md:h-10 bg-slate-950/70 border border-white/10 rounded-lg flex items-center justify-center text-slate-300 hover:text-white transition-colors text-sm md:text-base backdrop-blur"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Settings className="w-4 h-4 md:w-5 md:h-5" />
                    </motion.button>

                    {/* Exit */}
                    <motion.button
                        onClick={onLeaveRoom}
                        className="w-8 h-8 md:w-10 md:h-10 bg-slate-950/70 border border-white/10 rounded-lg flex items-center justify-center text-red-300 hover:text-red-200 hover:bg-red-900/40 transition-colors text-sm md:text-base backdrop-blur"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        ✕
                    </motion.button>
                </div>
            </header>

            {/* Game Area */}
            <div className="relative w-full h-screen">
                {/* Other Players positioned around the table */}
                {otherPlayers.slice(0, 5).map((player, index) => {
                    const position = playerPositions[index];
                    if (!position) return null;

                    return (
                        <div
                            key={player.id}
                            className="absolute"
                            style={position as React.CSSProperties}
                        >
                            <PlayerAvatar
                                name={player.name}
                                imageUrl={player.imageUrl}
                                cardCount={player.cardCount}
                                isCurrentTurn={player.id === currentPlayerId}
                                status={player.id === currentPlayerId ? (isBiddingPhase ? 'Bidding...' : 'Playing...') : undefined}
                                size={isMobile ? 'sm' : 'md'}
                                lives={player.lives}
                                bid={player.bid}
                                tricksWon={player.tricksWon}
                                isSpectator={player.isSpectator}
                            />
                        </div>
                    );
                })}

                {/* YOUR TURN Indicator */}
                {isMyTurn && isTrickPhase && !isSpectator && (
                    <motion.div
                        className={`absolute inset-x-0 flex justify-center ${isMobile ? 'top-[140px]' : 'top-[20%]'} z-20`}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <motion.div
                            className={`bg-slate-900/90 border border-blue-500/50 ${isMobile ? 'px-4 py-1.5' : 'px-6 py-2'} rounded-lg backdrop-blur-sm`}
                            animate={{ borderColor: ['rgba(59, 130, 246, 0.5)', 'rgba(59, 130, 246, 0.8)', 'rgba(59, 130, 246, 0.5)'] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        >
                            <p className={`text-blue-400 font-semibold ${isMobile ? 'text-xs' : 'text-sm'} tracking-widest uppercase`}>
                                Your Turn
                            </p>
                        </motion.div>
                    </motion.div>
                )}

                {/* Center Play Area */}
                <div className={`absolute left-1/2 transform -translate-x-1/2 ${isMobile ? 'top-[35%]' : 'top-1/2'} -translate-y-1/2`}>
                    {isTrickPhase ? (
                        <TrickArea
                            trickCards={currentTrick}
                            winnerId={trickWinnerId}
                            showWinner={phase === 'trick_end'}
                            deckCount={deckCount}
                            size={isMobile ? 'sm' : 'md'}
                        />
                    ) : (
                        /* Default center area */
                        <div className={`${isMobile ? 'w-52 h-52' : 'w-72 h-72'} rounded-full border-2 border-white/10 bg-white/5 backdrop-blur-sm flex items-center justify-center gap-2 md:gap-6 shadow-[0_0_40px_rgba(56,189,248,0.15)] relative overflow-hidden`}>
                            <div
                                className="absolute inset-0 opacity-60"
                                style={{ background: 'radial-gradient(circle at top, rgba(255,255,255,0.18), transparent 60%)' }}
                            />
                            {/* Deck */}
                            <div className="relative">
                                <PlayingCard faceUp={false} size={isMobile ? 'sm' : 'md'} />
                                {deckCount > 1 && (
                                    <>
                                        <div className="absolute top-1 left-1 w-full h-full rounded-xl bg-red-900/50 -z-10" />
                                        <div className="absolute top-2 left-2 w-full h-full rounded-xl bg-red-900/30 -z-20" />
                                    </>
                                )}
                            </div>

                            {/* Phase info */}
                            <div className="text-center text-slate-400 text-xs md:text-base">
                                {phase === 'dealing' && <p>Dealing...</p>}
                                {phase === 'bidding' && <p>Bidding...</p>}
                                {phase === 'round_end' && <p>Round done!</p>}
                                {phase === 'game_over' && <p className="text-base md:text-xl text-amber-400">Game Over!</p>}
                            </div>
                        </div>
                    )}
                </div>

                {/* My Player Info (bottom left) */}
                {myPlayer && (
                    <div className={`absolute ${isMobile ? 'bottom-32 left-2' : 'bottom-6 left-6'}`}>
                        <div className={`flex items-center gap-2 md:gap-3 bg-slate-900/80 rounded-xl px-2 md:px-4 py-2 md:py-3`}>
                            <div className={`${isMobile ? 'w-8 h-8' : 'w-12 h-12'} rounded-full flex items-center justify-center ${isSpectator ? 'bg-slate-700' : 'bg-gradient-to-br from-blue-500 to-purple-500'
                                }`}>
                                <span className={`text-white font-semibold ${isMobile ? 'text-sm' : ''}`}>{myPlayer.name.charAt(0)}</span>
                            </div>
                            <div>
                                <p className={`text-white font-medium ${isMobile ? 'text-xs' : ''}`}>
                                    {isMobile
                                        ? (myPlayer.name.length > 10 ? myPlayer.name.slice(0, 9) + '…' : myPlayer.name)
                                        : (myPlayer.name.length > 25 ? myPlayer.name.slice(0, 24) + '…' : myPlayer.name)}
                                    {isSpectator && <Eye className="ml-1 md:ml-2 w-3 h-3 md:w-4 md:h-4 text-slate-400 inline" />}
                                </p>
                                {/* Lives */}
                                {myPlayer.lives !== undefined && (
                                    <div className={`flex gap-1 ${isMobile ? 'text-xs' : ''}`}>
                                        {[...Array(3)].map((_, i) => (
                                            <span key={i} className={i < (myPlayer.lives || 0) ? 'text-red-500' : 'text-slate-600'}>
                                                ♥
                                            </span>
                                        ))}
                                    </div>
                                )}
                                {/* Bid info */}
                                {myPlayer.bid !== undefined && myPlayer.bid >= 0 && (
                                    <p className={`text-amber-400 ${isMobile ? 'text-[10px]' : 'text-sm'}`}>
                                        {isMobile ? `${myPlayer.bid}/${myPlayer.tricksWon ?? 0}` : `Bid: ${myPlayer.bid} | Won: ${myPlayer.tricksWon ?? 0}`}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Buttons (only during trick phase and not spectating) */}
                {isTrickPhase && !isSpectator && (
                    <div className={`absolute ${isMobile ? 'bottom-32 right-2' : 'bottom-64 left-1/2 transform -translate-x-1/2'} flex items-center gap-2 md:gap-4`}>
                        <motion.button
                            onClick={() => {
                                soundManager.play('sortHand');
                                onSortHand?.();
                            }}
                            className={`bg-slate-800/80 hover:bg-slate-700/80 text-white rounded-lg ${isMobile ? 'px-3 py-2 text-xs' : 'px-6 py-3'} flex items-center gap-1 md:gap-2 transition-colors`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <span>⇅</span>
                            <span className="hidden md:inline">Sort Hand</span>
                        </motion.button>

                        <motion.button
                            onClick={handlePlaySelected}
                            disabled={!selectedCardId || !isMyTurn}
                            className={`rounded-lg ${isMobile ? 'px-3 py-2 text-xs' : 'px-8 py-3'} flex items-center gap-1 md:gap-2 transition-all ${selectedCardId && isMyTurn
                                ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/25'
                                : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                }`}
                            whileHover={selectedCardId && isMyTurn ? { scale: 1.02 } : undefined}
                            whileTap={selectedCardId && isMyTurn ? { scale: 0.98 } : undefined}
                        >
                            <Play className="w-4 h-4" />
                            <span className="font-medium">
                                {isMobile
                                    ? (isMyTurn ? 'Play' : 'Wait')
                                    : (isMyTurn
                                        ? (selectedCardId ? 'Play Selected' : 'Select a Card')
                                        : 'Wait for your turn')}
                            </span>
                        </motion.button>
                    </div>
                )}

                {/* My Hand */}
                {!isSpectator && (
                    <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 ${isMobile ? 'pb-1' : 'pb-4'}`}>
                        {/* Subtle glow effect when it's your turn */}
                        {isMyTurn && isTrickPhase && (
                            <motion.div
                                className="absolute -inset-x-8 -inset-y-4 rounded-3xl pointer-events-none"
                                style={{
                                    background: 'radial-gradient(ellipse at center bottom, rgba(59, 130, 246, 0.2) 0%, transparent 70%)',
                                }}
                                animate={{ opacity: [0.4, 0.8, 0.4] }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                            />
                        )}
                        <CardFan
                            cards={myHand}
                            selectedCardId={selectedCardId}
                            onSelectCard={(cardId) => setSelectedCardId(cardId)}
                            spread={isMobile ? 3 : 5}
                            xSpacing={isMobile ? 26 : 30}
                            size={isMobile ? 'sm' : 'lg'}
                        />
                    </div>
                )}

                {/* Spectator message */}
                {isSpectator && (
                    <div className={`absolute ${isMobile ? 'bottom-2' : 'bottom-4'} left-1/2 transform -translate-x-1/2`}>
                        <div className={`bg-slate-900/90 rounded-xl ${isMobile ? 'px-4 py-2' : 'px-6 py-4'} text-center`}>
                            <p className={`text-slate-400 ${isMobile ? 'text-sm' : 'text-lg'} flex items-center gap-2`}><Eye className="w-4 h-4 md:w-5 md:h-5" /> Spectating</p>
                            <p className={`text-slate-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>Wait for next game</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Bidding Modal */}
            <BiddingModal
                isOpen={isBiddingPhase}
                isMyTurn={isMyBidTurn}
                currentBidderName={currentBidder?.name ?? ''}
                cardCount={cardCount}
                totalBidsSoFar={totalBidsSoFar}
                isLastBidder={isLastBidder}
                timerEndTime={bidTimerEnd ?? Date.now() + 10000}
                otherPlayerBids={otherPlayerBids}
                onSubmitBid={(bid) => onSubmitBid?.(bid)}
            />
        </div>
    );
}
