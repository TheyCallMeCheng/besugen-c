import { motion } from 'framer-motion';

interface PlayerAvatarProps {
    name: string;
    imageUrl?: string;
    size?: 'sm' | 'md' | 'lg';
    isHost?: boolean;
    isReady?: boolean;
    isCurrentTurn?: boolean;
    isPlaying?: boolean;
    score?: number;
    cardCount?: number;
    status?: string;
    className?: string;
    // Game-specific props
    lives?: number;
    maxLives?: number;
    bid?: number;
    tricksWon?: number;
    isSpectator?: boolean;
}

const SIZE_CLASSES = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
};

export function PlayerAvatar({
    name,
    imageUrl,
    size = 'md',
    isHost = false,
    isReady = false,
    isCurrentTurn = false,
    isPlaying = false,
    score,
    cardCount,
    status,
    className = '',
    lives,
    maxLives = 3,
    bid,
    tricksWon,
    isSpectator = false,
}: PlayerAvatarProps) {
    const sizeClass = SIZE_CLASSES[size];

    // Generate hearts for lives display
    const renderLives = () => {
        if (lives === undefined) return null;
        const hearts = [];
        for (let i = 0; i < maxLives; i++) {
            hearts.push(
                <span key={i} className={i < lives ? 'text-red-500' : 'text-slate-600'}>
                    ♥
                </span>
            );
        }
        return hearts;
    };

    return (
        <div className={`flex flex-col items-center gap-2 ${className} ${isSpectator ? 'opacity-50' : ''}`}>
            {/* Avatar container */}
            <div className="relative">
                {/* Avatar image */}
                <motion.div
                    className={`
            ${sizeClass} rounded-full overflow-hidden
            border-2 ${isSpectator ? 'border-slate-700 grayscale' : isCurrentTurn ? 'border-green-500' : isPlaying ? 'border-green-400' : 'border-slate-600'}
            bg-slate-700
          `}
                    animate={isCurrentTurn && !isSpectator ? {
                        boxShadow: ['0 0 20px rgba(34, 197, 94, 0.4)', '0 0 30px rgba(34, 197, 94, 0.6)', '0 0 20px rgba(34, 197, 94, 0.4)'],
                    } : undefined}
                    transition={isCurrentTurn ? { duration: 2, repeat: Infinity } : undefined}
                >
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/60 text-xl font-semibold">
                            {name.charAt(0).toUpperCase()}
                        </div>
                    )}
                </motion.div>

                {/* Host crown badge */}
                {isHost && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                        <span className="text-xs">👑</span>
                    </div>
                )}

                {/* Card count badge */}
                {cardCount !== undefined && !isHost && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-slate-800 border border-slate-600 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-white">{cardCount}</span>
                    </div>
                )}

                {/* Ready indicator */}
                {isReady && !isPlaying && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900" />
                )}

                {/* Spectator/Eliminated badge */}
                {isSpectator && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-slate-800 px-2 py-0.5 rounded text-xs text-slate-400">
                        👁
                    </div>
                )}
            </div>

            {/* Name and status */}
            <div className="text-center">
                <p className={`font-medium text-sm ${isSpectator ? 'text-slate-500' : 'text-white'}`}>{name}</p>

                {/* Lives display */}
                {lives !== undefined && (
                    <div className="flex justify-center gap-0.5 text-sm">
                        {renderLives()}
                    </div>
                )}

                {/* Bid and tricks display */}
                {bid !== undefined && bid >= 0 && (
                    <div className="flex items-center justify-center gap-1 text-xs mt-1">
                        <span className="text-amber-400">Bid: {bid}</span>
                        {tricksWon !== undefined && (
                            <>
                                <span className="text-slate-500">|</span>
                                <span className={tricksWon === bid ? 'text-green-400' : 'text-slate-400'}>
                                    Won: {tricksWon}
                                </span>
                            </>
                        )}
                    </div>
                )}

                {status && (
                    <p className={`text-xs ${status === 'Playing...' ? 'text-green-400' : 'text-slate-400'}`}>
                        {status}
                    </p>
                )}
                {isHost && !status && !isSpectator && (
                    <p className="text-xs text-blue-400">Host</p>
                )}
                {isReady && !isHost && !status && (
                    <p className="text-xs text-green-400">Ready</p>
                )}
                {score !== undefined && (
                    <p className="text-xs text-slate-400">Score: {score}</p>
                )}
            </div>
        </div>
    );
}

// Empty player slot for lobby
interface EmptySlotProps {
    size?: 'sm' | 'md' | 'lg';
}

export function EmptyPlayerSlot({ size = 'md' }: EmptySlotProps) {
    const sizeClass = SIZE_CLASSES[size];

    return (
        <div className="flex flex-col items-center gap-2">
            <div
                className={`${sizeClass} rounded-full border-2 border-dashed border-slate-600 flex items-center justify-center`}
            >
                <span className="text-slate-500 text-2xl">+</span>
            </div>
            <p className="text-slate-500 text-sm">Empty</p>
        </div>
    );
}
