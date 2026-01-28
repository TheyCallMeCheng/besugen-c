import { motion } from 'framer-motion';
import { useState } from 'react';
import { PlayerAvatar, EmptyPlayerSlot } from '../ui';
import { soundManager } from '../../utils/soundManager';


interface Player {
    id: string;
    name: string;
    imageUrl?: string;
    isHost?: boolean;
    isReady?: boolean;
}

interface LobbyProps {
    roomCode: string;
    players: Player[];
    maxPlayers?: number;
    isHost?: boolean;
    pointsToWin?: number;
    minPlayers?: number;
    onStartGame?: () => void;
    onToggleReady?: () => void;
    onInviteFriends?: () => void;
    onLeave?: () => void;
    onPointsChange?: (points: number) => void;
}

export function Lobby({
    roomCode,
    players,
    maxPlayers = 6,
    isHost = false,
    minPlayers = 2,
    onStartGame,
    onToggleReady,
    onInviteFriends,
    onLeave,
}: LobbyProps) {
    const emptySlots = maxPlayers - players.length;
    const canStart = players.length >= minPlayers;

    return (
        <div className="min-h-screen bg-lobby flex flex-col">
            {/* Header */}
            <header className="p-4 md:p-6 flex justify-between items-center">
                <div>
                    {/* Logo and Title - hidden on mobile */}
                    <div className="hidden md:flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xl">🂠</span>
                        </div>
                        <h1 className="text-3xl font-bold text-white">Besugen</h1>
                    </div>
                    {/* Status - simplified on mobile */}
                    <div className="flex items-center gap-2 text-slate-400">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        <span className="hidden md:inline">Waiting Lobby •</span>
                        <span className="text-white font-medium">{players.length}/{maxPlayers}</span>
                        <span className="md:hidden">players</span>
                        <span className="hidden md:inline">Players</span>
                    </div>
                </div>

                {/* Room Code */}
                <div className="bg-slate-800/50 rounded-lg px-3 md:px-6 py-2 md:py-3 border border-slate-700/50">
                    <span className="font-mono text-white font-bold tracking-wider md:tracking-widest text-base md:text-xl select-all">{roomCode}</span>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center px-4 md:px-6 py-4 md:py-8">
                {/* Player Slots */}
                <motion.div
                    className="card-panel p-4 md:p-8 mb-4 md:mb-8 w-full max-w-3xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex justify-center gap-4 md:gap-8 flex-wrap">
                        {/* Existing players */}
                        {players.map((player) => (
                            <PlayerAvatar
                                key={player.id}
                                name={player.name}
                                imageUrl={player.imageUrl}
                                isHost={player.isHost}
                                isReady={player.isReady}
                                size="md"
                                className="md:scale-125"
                            />
                        ))}

                        {/* Empty slots */}
                        {Array.from({ length: emptySlots }).map((_, i) => (
                            <EmptyPlayerSlot key={`empty-${i}`} size="md" />
                        ))}
                    </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    className="flex flex-col gap-3 md:gap-4 w-full max-w-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    {/* Ready Button (for non-host players) */}
                    {!isHost && (
                        <motion.button
                            onClick={() => {
                                soundManager.play('buttonClick');
                                onToggleReady?.();
                            }}
                            className="btn-primary py-3 md:py-4 bg-amber-600 hover:bg-amber-700"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <span>✓</span>
                            <span>Toggle Ready</span>
                        </motion.button>
                    )}

                    <motion.button
                        onClick={() => {
                            soundManager.play('buttonClick');
                            onInviteFriends?.();
                        }}
                        className="btn-secondary py-3 md:py-4"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <span>🔗</span>
                        <span>Invite Friends</span>
                    </motion.button>

                    {isHost && (
                        <motion.button
                            onClick={() => {
                                if (canStart) {
                                    soundManager.play('buttonClick');
                                    onStartGame?.();
                                }
                            }}
                            disabled={!canStart}
                            className={`py-3 md:py-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${canStart
                                ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/25'
                                : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                }`}
                            whileHover={canStart ? { scale: 1.02 } : undefined}
                            whileTap={canStart ? { scale: 0.98 } : undefined}
                        >
                            <span>▶</span>
                            <span>Start Game</span>
                        </motion.button>
                    )}

                    <motion.button
                        onClick={() => {
                            soundManager.play('buttonClick');
                            onLeave?.();
                        }}
                        className="btn-secondary py-2 md:py-3 text-red-400 hover:bg-red-500/10"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <span>🚪</span>
                        <span>Leave Room</span>
                    </motion.button>

                    {!canStart && (
                        <p className="text-center text-slate-500 text-xs md:text-sm">
                            ⚠️ Minimum {minPlayers} players required
                        </p>
                    )}
                </motion.div>
            </main>
        </div>
    );
}
