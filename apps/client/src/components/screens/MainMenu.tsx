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
}

export function MainMenu({
    playerName = 'PlayerOne',
    avatarUrl,
    playerLevel = 12,
    onPlayWithFriends,
    onPlayOnline,
    onSettings,
    onRanking,
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
            {/* Radial gradient vignette overlay - darker edges, lighter center */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse at center, transparent 0%, transparent 30%, rgba(10, 15, 30, 0.4) 70%, rgba(5, 8, 20, 0.7) 100%)',
                }}
            />

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
                    className="flex items-center gap-3 bg-slate-800/80 rounded-full pl-1 pr-4 py-1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    {avatarUrl ? (
                        <img src={avatarUrl} alt={playerName} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
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
                    className="text-center"
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

                    {/* Title */}
                    <motion.h1
                        className="text-6xl font-bold text-white mb-3 tracking-tight"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        BESUGEN
                    </motion.h1>
                    <motion.p
                        className="text-slate-400 text-lg mb-12"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        The Ultimate Card Battle
                    </motion.p>

                    {/* Menu buttons */}
                    <motion.div
                        className="space-y-4 max-w-md mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        {/* Play with Friends - Primary action */}
                        <motion.button
                            onClick={() => handleButtonClick(onPlayWithFriends)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-4 flex items-center justify-between transition-all shadow-lg shadow-blue-500/20"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                                    <Users className="w-5 h-5 text-white" />
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold">PLAY WITH FRIENDS</p>
                                    <p className="text-blue-200 text-sm">Create or join a private room</p>
                                </div>
                            </div>
                            <span className="text-blue-300">›</span>
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
                                className="flex-1 bg-slate-800/50 hover:bg-slate-700/50 text-white rounded-xl px-6 py-3 flex items-center justify-center gap-2 transition-all border border-slate-700/50"
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
                            className="w-full bg-gradient-to-r from-purple-600/80 to-pink-600/80 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl px-6 py-3 flex items-center justify-center gap-3 transition-all border border-purple-500/30"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <BookOpen className="w-5 h-5" />
                            <span className="font-medium">HOW TO PLAY</span>
                        </motion.button>
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
                        <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
                        <span>•</span>
                        <a href="/terms" className="hover:text-white transition-colors">Terms</a>
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
