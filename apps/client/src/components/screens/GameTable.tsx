import { motion } from 'framer-motion';
import { useState } from 'react';
import { PlayerAvatar, PlayingCard, CardFan, BiddingModal, TrickArea, type CardData, type TrickCardData } from '../ui';

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
}

// Position players around an oval table
const PLAYER_POSITIONS = [
    { top: '50%', left: '5%', transform: 'translateY(-50%)' },      // Left
    { top: '12%', left: '25%', transform: 'translate(-50%, -50%)' }, // Top-left
    { top: '8%', left: '50%', transform: 'translate(-50%, -50%)' },  // Top
    { top: '12%', right: '25%', transform: 'translate(50%, -50%)' }, // Top-right
    { top: '50%', right: '5%', transform: 'translateY(-50%)' },      // Right
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
}: GameTableProps) {
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

    // Get other players (not me)
    const otherPlayers = players.filter((p) => p.id !== myPlayerId);
    const myPlayer = players.find((p) => p.id === myPlayerId);
    const isMyTurn = currentPlayerId === myPlayerId;
    const isBiddingPhase = phase === 'bidding';
    const isTrickPhase = phase === 'trick' || phase === 'trick_end';
    const isSpectator = myPlayer?.isSpectator ?? false;

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
            onPlayCard?.(selectedCardId);
            setSelectedCardId(null);
        }
    };

    return (
        <div className="min-h-screen bg-game-table relative overflow-hidden">
            {/* Header */}
            <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
                <div className="flex items-center gap-4">
                    {/* Logo */}
                    <div className="flex items-center gap-2 bg-slate-900/80 rounded-lg px-4 py-2">
                        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm">🂠</span>
                        </div>
                        <span className="text-white font-semibold">Besugen</span>
                    </div>

                    {/* Round indicator */}
                    <div className="bg-slate-900/80 rounded-lg px-4 py-2">
                        <span className="text-slate-400">Round {round}</span>
                    </div>

                    {/* Phase indicator */}
                    <div className="bg-slate-900/80 rounded-lg px-4 py-2">
                        <span className={`capitalize ${phase === 'bidding' ? 'text-amber-400' :
                            phase === 'trick' ? 'text-green-400' :
                                phase === 'game_over' ? 'text-red-400' :
                                    'text-slate-400'
                            }`}>
                            {(phase ?? 'loading').replace('_', ' ')}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Cards per round */}
                    <div className="bg-slate-900/80 rounded-lg px-4 py-2 flex items-center gap-2">
                        <span className="text-slate-400 text-sm">CARDS</span>
                        <span className="text-white font-bold text-xl">{cardCount}</span>
                    </div>

                    {/* Settings */}
                    <motion.button
                        onClick={onSettings}
                        className="w-10 h-10 bg-slate-900/80 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        ⚙️
                    </motion.button>
                </div>
            </header>

            {/* Game Area */}
            <div className="relative w-full h-screen">
                {/* Other Players positioned around the table */}
                {otherPlayers.slice(0, 5).map((player, index) => {
                    const position = PLAYER_POSITIONS[index];
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
                                score={player.score}
                                cardCount={player.cardCount}
                                isCurrentTurn={player.id === currentPlayerId}
                                status={player.id === currentPlayerId ? (isBiddingPhase ? 'Bidding...' : 'Playing...') : undefined}
                                size="md"
                                lives={player.lives}
                                bid={player.bid}
                                tricksWon={player.tricksWon}
                                isSpectator={player.isSpectator}
                            />
                        </div>
                    );
                })}

                {/* Center Play Area */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    {isTrickPhase ? (
                        <TrickArea
                            trickCards={currentTrick}
                            winnerId={trickWinnerId}
                            showWinner={phase === 'trick_end'}
                            deckCount={deckCount}
                        />
                    ) : (
                        /* Default center area */
                        <div className="w-72 h-72 rounded-full border-2 border-table-border/30 flex items-center justify-center gap-6">
                            {/* Deck */}
                            <div className="relative">
                                <PlayingCard faceUp={false} size="md" />
                                {deckCount > 1 && (
                                    <>
                                        <div className="absolute top-1 left-1 w-full h-full rounded-xl bg-red-900/50 -z-10" />
                                        <div className="absolute top-2 left-2 w-full h-full rounded-xl bg-red-900/30 -z-20" />
                                    </>
                                )}
                            </div>

                            {/* Phase info */}
                            <div className="text-center text-slate-400">
                                {phase === 'dealing' && <p>Dealing cards...</p>}
                                {phase === 'bidding' && <p>Bidding in progress...</p>}
                                {phase === 'round_end' && <p>Round complete!</p>}
                                {phase === 'game_over' && <p className="text-xl text-amber-400">Game Over!</p>}
                            </div>
                        </div>
                    )}
                </div>

                {/* My Player Info (bottom left) */}
                {myPlayer && (
                    <div className="absolute bottom-6 left-6">
                        <div className="flex items-center gap-3 bg-slate-900/80 rounded-xl px-4 py-3">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isSpectator ? 'bg-slate-700' : 'bg-gradient-to-br from-blue-500 to-purple-500'
                                }`}>
                                <span className="text-white font-semibold">{myPlayer.name.charAt(0)}</span>
                            </div>
                            <div>
                                <p className="text-white font-medium">
                                    {myPlayer.name.length > 25 ? myPlayer.name.slice(0, 24) + '…' : myPlayer.name}
                                    {isSpectator && <span className="ml-2 text-slate-400 text-sm">👁 Spectating</span>}
                                </p>
                                {/* Lives */}
                                {myPlayer.lives !== undefined && (
                                    <div className="flex gap-1">
                                        {[...Array(3)].map((_, i) => (
                                            <span key={i} className={i < (myPlayer.lives || 0) ? 'text-red-500' : 'text-slate-600'}>
                                                ♥
                                            </span>
                                        ))}
                                    </div>
                                )}
                                {/* Bid info */}
                                {myPlayer.bid !== undefined && myPlayer.bid >= 0 && (
                                    <p className="text-amber-400 text-sm">
                                        Bid: {myPlayer.bid} | Won: {myPlayer.tricksWon ?? 0}
                                    </p>
                                )}
                                <p className="text-green-400 text-sm">Score: {myPlayer.score}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Buttons (only during trick phase and not spectating) */}
                {isTrickPhase && !isSpectator && (
                    <div className="absolute bottom-64 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
                        <motion.button
                            onClick={onSortHand}
                            className="bg-slate-800/80 hover:bg-slate-700/80 text-white rounded-lg px-6 py-3 flex items-center gap-2 transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <span>⇅</span>
                            <span>Sort Hand</span>
                        </motion.button>

                        <motion.button
                            onClick={handlePlaySelected}
                            disabled={!selectedCardId || !isMyTurn}
                            className={`rounded-lg px-8 py-3 flex items-center gap-2 transition-all ${selectedCardId && isMyTurn
                                ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/25'
                                : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                }`}
                            whileHover={selectedCardId && isMyTurn ? { scale: 1.02 } : undefined}
                            whileTap={selectedCardId && isMyTurn ? { scale: 0.98 } : undefined}
                        >
                            <span>▶</span>
                            <span className="font-medium">
                                {isMyTurn
                                    ? (selectedCardId ? 'Play Selected' : 'Select a Card')
                                    : 'Wait for your turn'}
                            </span>
                        </motion.button>
                    </div>
                )}

                {/* My Hand */}
                {!isSpectator && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 pb-4">
                        <CardFan
                            cards={myHand}
                            selectedCardId={selectedCardId}
                            onSelectCard={(cardId) => setSelectedCardId(cardId)}
                            spread={12}
                        />
                    </div>
                )}

                {/* Spectator message */}
                {isSpectator && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                        <div className="bg-slate-900/90 rounded-xl px-6 py-4 text-center">
                            <p className="text-slate-400 text-lg">👁 You are spectating</p>
                            <p className="text-slate-500 text-sm">Wait for the next game to join</p>
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
