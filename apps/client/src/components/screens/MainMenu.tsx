import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Globe, Settings, Trophy, BookOpen } from 'lucide-react';
import { soundManager } from '../../utils/soundManager';
import { TutorialModal } from '../ui/TutorialModal';
import { trackTutorialOpened } from '../../services/analytics';


// Floating card decoration icons with glow effect
function FloatingCard({
    icon,
    className,
    delay = 0,
    rotation = 0,
    size = 'text-8xl',
}: {
    icon: string;
    className: string;
    delay?: number;
    rotation?: number;
    size?: string;
}) {
    return (
        <motion.div
            className={`absolute ${className}`}
            style={{
                filter: 'blur(0.5px) drop-shadow(0 0 20px rgba(99, 130, 255, 0.4))',
            }}
            initial={{ opacity: 0, scale: 0.8, rotate: rotation }}
            animate={{ opacity: 1, scale: 1, rotate: rotation }}
            transition={{ duration: 0.6, delay }}
        >
            <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay }}
            >
                <span
                    className={`${size} text-[#4a5d8a]/50`}
                    style={{ textShadow: '0 0 30px rgba(99, 130, 255, 0.5)' }}
                >
                    {icon}
                </span>
            </motion.div>
        </motion.div>
    );
}

// Logo icon with glow halo
function LogoIcon() {
    return (
        <div className="relative mb-6">
            {/* Glow halo behind the logo */}
            <div
                className="absolute inset-0 w-20 h-20 rounded-2xl"
                style={{
                    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.6) 0%, transparent 70%)',
                    transform: 'scale(1.5)',
                    filter: 'blur(15px)',
                }}
            />
            <div className="relative w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/40">
                <span className="text-white text-4xl">🂠</span>
            </div>
        </div>
    );
}

interface MainMenuProps {
    playerName?: string;
    avatarUrl?: string;
    playerLevel?: number;
    onPlayWithFriends?: () => void;
    onPlayOnline?: () => void;
    onSettings?: () => void;
    onRanking?: () => void;
    onNavigateToPrivacy?: () => void;
    onNavigateToTerms?: () => void;
}

export function MainMenu({
    playerName = 'PlayerOne',
    avatarUrl,
    playerLevel = 12,
    onPlayWithFriends,
    onPlayOnline,
    onSettings,
    onRanking,
    onNavigateToPrivacy,
    onNavigateToTerms,
}: MainMenuProps) {
    const [showTutorial, setShowTutorial] = useState(false);

    // Start music when MainMenu mounts
    useEffect(() => {
        soundManager.startMusic();
    }, []);

    // Handle any button click - play sound
    const handleButtonClick = (callback?: () => void) => {
        soundManager.play('buttonClick');
        callback?.();
    };

    // Handle opening tutorial with analytics tracking
    const handleOpenTutorial = () => {
        trackTutorialOpened();
        setShowTutorial(true);
    };

    return (
        <div className="min-h-screen bg-main-menu relative overflow-hidden">
            {/* Soft vignette + grain to avoid banding */}
            <div className="menu-vignette" />

            {/* Ambient glow orbs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-400/20 blur-3xl animate-sway" />
                <div className="absolute top-28 -left-10 h-56 w-56 rounded-full bg-emerald-400/20 blur-3xl animate-float" />
                <div className="absolute bottom-10 right-6 h-64 w-64 rounded-full bg-amber-300/20 blur-3xl animate-float-delayed" />
            </div>

            {/* Floating decorations - card suit symbols, closer to center */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <FloatingCard icon="♠" className="top-24 left-[15%]" delay={0} rotation={-12} size="text-8xl" />
                <FloatingCard icon="♦" className="top-28 right-[15%]" delay={0.5} rotation={8} size="text-8xl" />
                <FloatingCard icon="♥" className="bottom-32 left-[18%]" delay={1} rotation={-8} size="text-8xl" />
                <FloatingCard icon="♣" className="bottom-28 right-[18%]" delay={1.5} rotation={10} size="text-8xl" />
            </div>

            {/* Header */}
            <header className="absolute top-0 left-0 right-0 p-6 flex justify-end items-center z-10">

                {/* Player profile badge */}
                <motion.div
                    className="flex items-center gap-3 bg-slate-950/70 border border-white/10 rounded-full pl-1 pr-4 py-1 backdrop-blur"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    {avatarUrl ? (
                        <img src={avatarUrl} alt={playerName} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                            <span className="text-white font-semibold">{playerName.charAt(0)}</span>
                        </div>
                    )}
                    <div className="text-left">
                        <p className="text-white text-sm font-medium">{playerName}</p>
                        <p className="text-green-400 text-xs">Lvl {playerLevel}</p>
                    </div>
                </motion.div>
            </header>

            {/* Main content */}
            <main className="min-h-screen flex flex-col items-center justify-center px-6 relative z-10">
                <motion.div
                    className="text-center max-w-2xl"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    {/* Logo */}
                    <motion.div
                        className="flex justify-center"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <LogoIcon />
                    </motion.div>

                    <motion.div
                        className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-cyan-200 mb-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.25 }}
                    >
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        Daily Bonus +200 XP
                    </motion.div>

                    {/* Title */}
                    <motion.h1
                        className="text-5xl md:text-6xl text-white mb-3 text-display"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        BESUGEN
                    </motion.h1>
                    <motion.p
                        className="text-slate-300 text-lg md:text-xl mb-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        Battle, bluff, and flex your best hands.
                    </motion.p>

                    {/* Menu buttons */}
                    <motion.div
                        className="menu-shell space-y-4 max-w-md mx-auto p-6 md:p-7"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        {/* Play with Friends - Primary action */}
                        <motion.button
                            onClick={() => handleButtonClick(onPlayWithFriends)}
                            className="group fluid-button relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-500 text-white px-6 py-4 flex items-center justify-between transition-all shadow-lg shadow-cyan-500/25"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <span
                                className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
                                style={{ background: 'radial-gradient(circle at top left, rgba(255,255,255,0.25), transparent 55%)' }}
                            />
                            <div className="flex items-center gap-4 relative">
                                <div className="w-10 h-10 bg-white/15 rounded-lg flex items-center justify-center">
                                    <Users className="w-5 h-5 text-white" />
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold">PLAY WITH FRIENDS</p>
                                    <p className="text-white/80 text-sm">Create or join a private room</p>
                                </div>
                            </div>
                            <span className="text-white/90 text-xl relative">›</span>
                        </motion.button>

                        {/* Play Online - Coming Soon */}
                        <div className="relative">
                            <motion.button
                                disabled
                                className="w-full bg-slate-800/30 text-slate-500 rounded-xl px-6 py-4 flex items-center justify-between transition-all border border-slate-700/30 cursor-not-allowed"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-slate-700/50 rounded-lg flex items-center justify-center">
                                        <Globe className="w-5 h-5 text-slate-500" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-semibold">PLAY ONLINE</p>
                                        <p className="text-slate-600 text-sm">Match with random players</p>
                                    </div>
                                </div>
                            </motion.button>
                            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                                SOON
                            </div>
                        </div>

                        {/* Settings and Ranking row */}
                        <div className="flex gap-4">
                            <motion.button
                                onClick={() => handleButtonClick(onSettings)}
                                className="flex-1 bg-slate-900/60 hover:bg-slate-800/80 text-white rounded-xl px-6 py-3 flex items-center justify-center gap-2 transition-all border border-white/10"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Settings className="w-5 h-5" />
                                <span className="font-medium">SETTINGS</span>
                            </motion.button>

                            <div className="relative flex-1">
                                <motion.button
                                    disabled
                                    className="w-full bg-slate-800/30 text-slate-500 rounded-xl px-6 py-3 flex items-center justify-center gap-2 transition-all border border-slate-700/30 cursor-not-allowed"
                                >
                                    <Trophy className="w-5 h-5" />
                                    <span className="font-medium">RANKING</span>
                                </motion.button>
                                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                                    SOON
                                </div>
                            </div>
                        </div>

                        {/* How to Play button */}
                        <motion.button
                            onClick={() => handleButtonClick(handleOpenTutorial)}
                            className="w-full bg-gradient-to-r from-amber-500/80 to-orange-500/80 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl px-6 py-3 flex items-center justify-center gap-3 transition-all border border-amber-400/40"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <BookOpen className="w-5 h-5" />
                            <span className="font-medium">HOW TO PLAY</span>
                        </motion.button>

                        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-slate-200">
                            <span className="text-amber-300 font-semibold">Tip:</span> Win the final trick to steal momentum and bonus points.
                        </div>
                    </motion.div>
                </motion.div>
            </main>

            {/* Footer */}
            <footer className="absolute bottom-0 left-0 right-0 p-4 md:p-6 z-10">
                <div className="flex flex-col md:flex-row justify-center items-center gap-2 md:gap-4 text-slate-500 text-xs md:text-sm">
                    <div className="flex items-center gap-3 md:gap-4">
                        <button
                            onClick={() => handleButtonClick(handleOpenTutorial)}
                            className="hover:text-white transition-colors"
                        >
                            How to Play
                        </button>
                        <span className="hidden md:inline">•</span>
                        <button className="hover:text-white transition-colors">Credits</button>
                    </div>
                    <div className="flex items-center gap-3 md:gap-4">
                        <span className="hidden md:inline">•</span>
                        <button onClick={onNavigateToPrivacy} className="hover:text-white transition-colors">Privacy</button>
                        <span>•</span>
                        <button onClick={onNavigateToTerms} className="hover:text-white transition-colors">Terms</button>
                        <span>•</span>
                        <span>v1.0.2</span>
                    </div>
                </div>
            </footer>

            {/* Tutorial Modal */}
            <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} />
        </div>
    );
}
