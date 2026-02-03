import { motion } from 'framer-motion';
import { Check, Link2, Play, LogOut, X, Settings } from 'lucide-react';
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
    myPlayerId?: string;
    onStartGame?: () => void;
    onToggleReady?: () => void;
    onInviteFriends?: () => void;
    onLeave?: () => void;
    onSettings?: () => void;
    onPointsChange?: (points: number) => void;
    onKickPlayer?: (playerId: string) => void;
}

export function Lobby({
    roomCode,
    players,
    maxPlayers = 6,
    isHost = false,
    minPlayers = 2,
    myPlayerId,
    onStartGame,
    onToggleReady,
    onInviteFriends,
    onLeave,
    onSettings,
    onKickPlayer,
}: LobbyProps) {
    const emptySlots = maxPlayers - players.length;
    const allReady = players.filter(p => !p.isHost).every(p => p.isReady);
    const nonHostPlayers = players.filter(p => !p.isHost);
    const hasEnoughPlayers = players.length >= minPlayers;
    const canStart = hasEnoughPlayers && (nonHostPlayers.length === 0 || allReady);

    return (
        <div className="min-h-screen bg-lobby flex flex-col relative overflow-hidden">
            <div className="lobby-vignette" />
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-24 left-10 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl animate-float" />
                <div className="absolute top-16 right-10 h-56 w-56 rounded-full bg-emerald-400/15 blur-3xl animate-float-delayed" />
                <div className="absolute bottom-8 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-amber-300/10 blur-3xl animate-sway" />
            </div>

            {/* Header */}
            <header className="p-4 md:p-6 flex justify-center relative z-10">
                <div className="glass-panel w-full max-w-5xl px-4 md:px-6 py-4 flex justify-between items-center">
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
                <div className="room-code-card">
                    <div className="text-[10px] uppercase tracking-[0.3em] text-slate-400 mb-1">Room Code</div>
                    <span className="font-mono text-white font-bold text-base md:text-xl select-all">{roomCode}</span>
                </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center px-4 md:px-6 py-4 md:py-8 relative z-10">
                {/* Player Slots */}
                <motion.div
                    className="glass-panel p-4 md:p-8 mb-4 md:mb-8 w-full max-w-3xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex justify-center gap-4 md:gap-8 flex-wrap">
                        {/* Existing players */}
                        {players.map((player) => (
                            <div key={player.id} className="relative group">
                                <PlayerAvatar
                                    name={player.name}
                                    imageUrl={player.imageUrl}
                                    isHost={player.isHost}
                                    isReady={player.isReady}
                                    size="md"
                                    className="md:scale-125"
                                />
                                {/* Kick button - only shown to host for non-host players */}
                                {isHost && !player.isHost && player.id !== myPlayerId && (
                                    <motion.button
                                        onClick={() => {
                                            soundManager.play('buttonClick');
                                            onKickPlayer?.(player.id);
                                        }}
                                        className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        title="Kick player"
                                    >
                                        <X className="w-3 h-3" />
                                    </motion.button>
                                )}
                            </div>
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
                            className="fluid-button w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium py-3 md:py-4 shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Check className="w-5 h-5" />
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
                        <Link2 className="w-5 h-5" />
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
                            className={`py-3 md:py-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${canStart
                                ? 'fluid-button bg-gradient-to-r from-emerald-500 via-green-500 to-lime-400 text-white shadow-lg shadow-green-500/25'
                                : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                }`}
                            whileHover={canStart ? { scale: 1.02 } : undefined}
                            whileTap={canStart ? { scale: 0.98 } : undefined}
                        >
                            <Play className="w-5 h-5" />
                            <span>Start Game</span>
                        </motion.button>
                    )}

                    {/* Settings and Leave row */}
                    <div className="flex gap-3">
                        <motion.button
                            onClick={() => {
                                soundManager.play('buttonClick');
                                onSettings?.();
                            }}
                            className="btn-secondary py-2 md:py-3 flex-1"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Settings className="w-5 h-5" />
                            <span>Settings</span>
                        </motion.button>

                        <motion.button
                            onClick={() => {
                                soundManager.play('buttonClick');
                                onLeave?.();
                            }}
                            className="btn-secondary py-2 md:py-3 text-red-400 hover:bg-red-500/10 flex-1"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Leave</span>
                        </motion.button>
                    </div>

                    {/* Status message - fixed height to prevent layout shift */}
                    <div className="h-5 flex items-center justify-center">
                        {!hasEnoughPlayers && (
                            <p className="text-slate-500 text-xs md:text-sm">
                                Minimum {minPlayers} players required
                            </p>
                        )}
                        {hasEnoughPlayers && !allReady && nonHostPlayers.length > 0 && (
                            <p className="text-amber-500 text-xs md:text-sm">
                                Waiting for all players to be ready
                            </p>
                        )}
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
