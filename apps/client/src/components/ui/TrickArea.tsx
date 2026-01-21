import { motion, AnimatePresence } from 'framer-motion';
import { PlayingCard, type CardData } from './PlayingCard';

export interface TrickCardData {
    playerId: string;
    playerName: string;
    card: CardData;
    playOrder: number;
    isWinner?: boolean;
}

interface TrickAreaProps {
    trickCards: TrickCardData[];
    winnerId?: string;
    showWinner: boolean;
    deckCount: number;
}

// Position offsets for cards played in trick (relative to center)
const CARD_POSITIONS = [
    { x: 0, y: 0, rotate: 0 },        // Center (first player)
    { x: -20, y: 5, rotate: -8 },     // Slight left
    { x: 20, y: 5, rotate: 8 },       // Slight right
    { x: -10, y: -5, rotate: -4 },    // Upper left
    { x: 10, y: -5, rotate: 4 },      // Upper right
    { x: 0, y: 10, rotate: 2 },       // Lower center
];

export function TrickArea({
    trickCards,
    winnerId,
    showWinner,
    deckCount,
}: TrickAreaProps) {
    return (
        <div className="relative w-72 h-72 flex items-center justify-center">
            {/* Table felt background */}
            <div className="absolute inset-0 rounded-full border-2 border-table-border/30" />

            {/* Deck */}
            <div className="absolute left-1/4 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                    <PlayingCard faceUp={false} size="md" />
                    {deckCount > 1 && (
                        <>
                            <div className="absolute top-1 left-1 w-full h-full rounded-xl bg-red-900/50 -z-10" />
                            <div className="absolute top-2 left-2 w-full h-full rounded-xl bg-red-900/30 -z-20" />
                        </>
                    )}
                    {/* Deck count badge */}
                    <div className="absolute -top-2 -right-2 bg-slate-800 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                        {deckCount}
                    </div>
                </div>
            </div>

            {/* Played cards in trick */}
            <div className="absolute right-1/4 top-1/2 transform translate-x-1/2 -translate-y-1/2">
                <AnimatePresence>
                    {trickCards.length === 0 ? (
                        // Empty play area
                        <div className="w-24 h-32 rounded-xl border-2 border-dashed border-table-border/50 flex items-center justify-center">
                            <span className="text-table-border/50 text-xs text-center">Play here</span>
                        </div>
                    ) : (
                        // Stack of played cards
                        <div className="relative w-24 h-32">
                            {trickCards.map((tc, index) => {
                                const pos = CARD_POSITIONS[index % CARD_POSITIONS.length];
                                const isWinningCard = showWinner && tc.playerId === winnerId;

                                return (
                                    <motion.div
                                        key={tc.card.id}
                                        className="absolute"
                                        style={{
                                            zIndex: tc.playOrder + 1,
                                        }}
                                        initial={{
                                            x: pos.x - 100,
                                            y: pos.y,
                                            rotate: pos.rotate - 30,
                                            opacity: 0,
                                            scale: 0.8,
                                        }}
                                        animate={{
                                            x: pos.x * 0.3,
                                            y: pos.y * 0.3,
                                            rotate: pos.rotate * 0.5,
                                            opacity: 1,
                                            scale: isWinningCard ? 1.1 : 1,
                                        }}
                                        exit={{
                                            y: -50,
                                            opacity: 0,
                                            scale: 0.8,
                                        }}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 300,
                                            damping: 20,
                                        }}
                                    >
                                        <div className={`
                                            relative
                                            ${isWinningCard ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-transparent rounded-xl' : ''}
                                        `}>
                                            <PlayingCard
                                                card={tc.card}
                                                faceUp={true}
                                                size="md"
                                            />
                                            {/* Player name tag */}
                                            <div className={`
                                                absolute -bottom-6 left-1/2 transform -translate-x-1/2
                                                text-xs whitespace-nowrap px-2 py-1 rounded
                                                ${isWinningCard ? 'bg-yellow-500 text-black font-bold' : 'bg-slate-800/80 text-white'}
                                            `}>
                                                {tc.playerName.length > 25 ? tc.playerName.slice(0, 24) + '…' : tc.playerName}
                                                {isWinningCard && ' 👑'}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
