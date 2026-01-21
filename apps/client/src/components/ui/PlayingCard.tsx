import { motion } from 'framer-motion';

// Card suits and their colors
const SUIT_SYMBOLS: Record<string, string> = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠',
};

const SUIT_COLORS: Record<string, string> = {
    hearts: 'text-red-500',
    diamonds: 'text-red-500',
    clubs: 'text-slate-900',
    spades: 'text-slate-900',
};

export interface CardData {
    id: string;
    suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
    rank: string; // A, 2-10, J, Q, K
    faceUp?: boolean;
}

interface PlayingCardProps {
    card?: CardData;
    faceUp?: boolean;
    selected?: boolean;
    selectable?: boolean;
    onClick?: () => void;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES = {
    sm: 'w-14 h-20',
    md: 'w-24 h-32',
    lg: 'w-32 h-44',
};

const TEXT_SIZES = {
    sm: { corner: 'text-xs', symbol: 'text-xs', center: 'text-lg' },
    md: { corner: 'text-sm', symbol: 'text-sm', center: 'text-3xl' },
    lg: { corner: 'text-base', symbol: 'text-lg', center: 'text-5xl' },
};

export function PlayingCard({
    card,
    faceUp = true,
    selected = false,
    selectable = false,
    onClick,
    className = '',
    size = 'md',
}: PlayingCardProps) {
    const sizeClass = SIZE_CLASSES[size];
    const textSize = TEXT_SIZES[size];

    // Card back
    if (!faceUp || !card) {
        return (
            <motion.div
                className={`${sizeClass} rounded-xl shadow-card cursor-default ${className}`}
                style={{
                    background: 'linear-gradient(135deg, #c9553d 0%, #8b2f1f 100%)',
                }}
                whileHover={selectable ? { y: -8 } : undefined}
            >
                {/* Decorative pattern */}
                <div className="w-full h-full flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full border-2 border-white/30 flex items-center justify-center">
                        <span className="text-white/40 text-xl">∞</span>
                    </div>
                </div>
            </motion.div>
        );
    }

    const suitSymbol = SUIT_SYMBOLS[card.suit];
    const suitColor = SUIT_COLORS[card.suit];

    return (
        <motion.div
            onClick={selectable ? onClick : undefined}
            className={`
        ${sizeClass} 
        relative bg-white rounded-xl shadow-card overflow-hidden
        flex flex-col justify-between p-2
        ${selectable ? 'cursor-pointer' : 'cursor-default'}
        ${selected ? 'ring-2 ring-green-500 card-selected' : ''}
        ${className}
      `}
            whileHover={selectable ? { y: -12, boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)' } : undefined}
            whileTap={selectable ? { scale: 0.98 } : undefined}
            layout
        >
            {/* Top left corner */}
            <div className={`flex flex-col items-start leading-tight ${suitColor}`}>
                <span className={`font-bold ${textSize.corner}`}>{card.rank}</span>
                <span className={textSize.symbol}>{suitSymbol}</span>
            </div>

            {/* Center suit - absolute for true centering */}
            <div className={`absolute inset-0 flex items-center justify-center pointer-events-none ${suitColor}`}>
                <span className={textSize.center}>{suitSymbol}</span>
            </div>

            {/* Bottom right corner (rotated) */}
            <div className={`flex flex-col items-end leading-tight rotate-180 mt-auto ${suitColor}`}>
                <span className={`font-bold ${textSize.corner}`}>{card.rank}</span>
                <span className={textSize.symbol}>{suitSymbol}</span>
            </div>
        </motion.div>
    );
}

// Card fan for player's hand
interface CardFanProps {
    cards: CardData[];
    selectedCardId?: string | null;
    onSelectCard?: (cardId: string) => void;
    spread?: number; // Angle spread in degrees
}

export function CardFan({
    cards,
    selectedCardId,
    onSelectCard,
    spread = 8,
}: CardFanProps) {
    const totalSpread = spread * (cards.length - 1);
    const startAngle = -totalSpread / 2;

    return (
        <div className="relative h-48 flex items-end justify-center">
            {cards.map((card, index) => {
                const angle = startAngle + spread * index;
                const isSelected = selectedCardId === card.id;
                const translateY = isSelected ? -20 : 0;

                return (
                    <motion.div
                        key={card.id}
                        className="absolute origin-bottom"
                        style={{
                            rotate: `${angle}deg`,
                        }}
                        animate={{
                            y: translateY,
                        }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    >
                        <PlayingCard
                            card={card}
                            faceUp={true}
                            selected={isSelected}
                            selectable={true}
                            onClick={() => onSelectCard?.(card.id)}
                            size="lg"
                        />
                    </motion.div>
                );
            })}
        </div>
    );
}
