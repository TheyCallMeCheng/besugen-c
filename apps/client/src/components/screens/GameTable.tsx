import { motion } from 'framer-motion';
import { useState } from 'react';
import { PlayerAvatar, PlayingCard, CardFan, type CardData } from '../ui';

interface Player {
    id: string;
    name: string;
    imageUrl?: string;
    score: number;
    cardCount: number;
    isCurrentTurn?: boolean;
    status?: string;
}

interface GameTableProps {
    roomId?: string;
    round: number;
    potSize: number;
    players: Player[];
    currentPlayerId?: string;
    myPlayerId: string;
    myHand: CardData[];
    deckCount: number;
    lastPlayedCard?: CardData;
    lastPlayedBy?: string;
    onPlayCard?: (cardId: string) => void;
    onSortHand?: () => void;
    onPassTurn?: () => void;
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
    potSize,
    players,
    currentPlayerId,
    myPlayerId,
    myHand,
    deckCount,
    lastPlayedCard,
    lastPlayedBy,
    onPlayCard,
    onSortHand,
    onPassTurn,
    onSettings,
}: GameTableProps) {
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

    // Get other players (not me)
    const otherPlayers = players.filter((p) => p.id !== myPlayerId);
    const myPlayer = players.find((p) => p.id === myPlayerId);
    const isMyTurn = currentPlayerId === myPlayerId;

    const handlePlaySelected = () => {
        if (selectedCardId) {
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
                </div>

                <div className="flex items-center gap-4">
                    {/* Pot size */}
                    <div className="bg-slate-900/80 rounded-lg px-4 py-2 flex items-center gap-2">
                        <span className="text-slate-400 text-sm">POT SIZE</span>
                        <span className="text-green-400 font-bold text-xl">{potSize.toLocaleString()}</span>
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
                                status={player.id === currentPlayerId ? 'Playing...' : undefined}
                                size="md"
                            />
                        </div>
                    );
                })}

                {/* Center Play Area */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    {/* Table felt circle */}
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

                        {/* Last played card */}
                        {lastPlayedCard ? (
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
                                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            >
                                <PlayingCard card={lastPlayedCard} faceUp={true} size="md" />
                            </motion.div>
                        ) : (
                            <div className="w-24 h-36 rounded-xl border-2 border-dashed border-table-border/50 flex items-center justify-center">
                                <span className="text-table-border/50 text-sm">Play here</span>
                            </div>
                        )}
                    </div>

                    {/* Last played info */}
                    {lastPlayedCard && lastPlayedBy && (
                        <motion.div
                            className="text-center mt-4"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <p className="text-slate-400 text-sm">Last Played</p>
                            <p className="text-white font-medium">{lastPlayedBy}</p>
                        </motion.div>
                    )}
                </div>

                {/* My Player Info (bottom left) */}
                {myPlayer && (
                    <div className="absolute bottom-6 left-6">
                        <div className="flex items-center gap-3 bg-slate-900/80 rounded-xl px-4 py-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                <span className="text-white font-semibold">{myPlayer.name.charAt(0)}</span>
                            </div>
                            <div>
                                <p className="text-white font-medium">You ({myPlayer.name})</p>
                                <p className="text-green-400 text-sm">Score: {myPlayer.score}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="absolute bottom-40 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
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
                        className={`rounded-lg px-8 py-3 flex flex-col items-center gap-1 transition-all ${selectedCardId && isMyTurn
                                ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/25'
                                : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                            }`}
                        whileHover={selectedCardId && isMyTurn ? { scale: 1.02 } : undefined}
                        whileTap={selectedCardId && isMyTurn ? { scale: 0.98 } : undefined}
                    >
                        <div className="flex items-center gap-2">
                            <span>▶</span>
                            <span className="font-medium">Play Selected</span>
                        </div>
                        {selectedCardId && (
                            <span className="text-xs text-green-300">SELECTED</span>
                        )}
                    </motion.button>

                    <motion.button
                        onClick={onPassTurn}
                        disabled={!isMyTurn}
                        className={`rounded-lg px-6 py-3 transition-all ${isMyTurn
                                ? 'bg-slate-800/80 hover:bg-slate-700/80 text-white'
                                : 'bg-slate-800/50 text-slate-500 cursor-not-allowed'
                            }`}
                        whileHover={isMyTurn ? { scale: 1.02 } : undefined}
                        whileTap={isMyTurn ? { scale: 0.98 } : undefined}
                    >
                        Pass Turn
                    </motion.button>
                </div>

                {/* My Hand */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 pb-4">
                    <CardFan
                        cards={myHand}
                        selectedCardId={selectedCardId}
                        onSelectCard={(cardId) => setSelectedCardId(cardId)}
                        spread={12}
                    />
                </div>
            </div>
        </div>
    );
}
