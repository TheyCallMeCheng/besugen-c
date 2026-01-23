import { motion } from 'framer-motion';
import { soundManager } from '../../utils/soundManager';


// Floating card decoration icons
function FloatingCard({
    icon,
    className,
    delay = 0,
}: {
    icon: string;
    className: string;
    delay?: number;
}) {
    return (
        <motion.div
            className={`absolute text-blue-500/20 ${className}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay }}
        >
            <motion.div
                animate={{ y: [0, -10, 0], rotate: [0, 2, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay }}
            >
                <span className="text-6xl">{icon}</span>
            </motion.div>
        </motion.div>
    );
}

// Logo icon
function LogoIcon() {
    return (
        <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30">
            <span className="text-white text-4xl">🂠</span>
        </div>
    );
}

interface MainMenuProps {
    playerName?: string;
    playerLevel?: number;
    onPlayWithFriends?: () => void;
    onPlayOnline?: () => void;
    onSettings?: () => void;
    onRanking?: () => void;
}

export function MainMenu({
    playerName = 'PlayerOne',
    playerLevel = 12,
    onPlayWithFriends,
    onPlayOnline,
    onSettings,
    onRanking,
}: MainMenuProps) {
    return (
        <div className="min-h-screen bg-main-menu relative overflow-hidden">
            {/* Floating decorations */}
            <FloatingCard icon="🂡" className="top-24 left-16" delay={0} />
            <FloatingCard icon="🃏" className="top-32 right-24" delay={0.5} />
            <FloatingCard icon="♥" className="bottom-32 left-24" delay={1} />
            <FloatingCard icon="🎰" className="bottom-24 right-16" delay={1.5} />

            {/* Header */}
            <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center">
                <span className="text-white/50 text-sm font-medium tracking-wide">DISCORD ACTIVITY</span>

                {/* Player profile badge */}
                <motion.div
                    className="flex items-center gap-3 bg-slate-800/80 rounded-full pl-1 pr-4 py-1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                        <span className="text-white font-semibold">{playerName.charAt(0)}</span>
                    </div>
                    <div className="text-left">
                        <p className="text-white text-sm font-medium">{playerName}</p>
                        <p className="text-green-400 text-xs">Lvl {playerLevel}</p>
                    </div>
                </motion.div>
            </header>

            {/* Main content */}
            <main className="min-h-screen flex flex-col items-center justify-center px-6">
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
                            onClick={() => {
                                soundManager.play('buttonClick');
                                onPlayWithFriends?.();
                            }}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-4 flex items-center justify-between transition-all shadow-lg shadow-blue-500/20"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                                    <span className="text-xl">👥</span>
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold">PLAY WITH FRIENDS</p>
                                    <p className="text-blue-200 text-sm">Create or join a private room</p>
                                </div>
                            </div>
                            <span className="text-blue-300">›</span>
                        </motion.button>

                        {/* Play Online - Secondary action */}
                        <motion.button
                            onClick={() => {
                                soundManager.play('buttonClick');
                                onPlayOnline?.();
                            }}
                            className="w-full bg-slate-800/50 hover:bg-slate-700/50 text-white rounded-xl px-6 py-4 flex items-center justify-between transition-all border border-slate-700/50"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
                                    <span className="text-xl">🌐</span>
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold">PLAY ONLINE</p>
                                    <p className="text-slate-400 text-sm">Match with random players</p>
                                </div>
                            </div>
                            <span className="text-slate-500">›</span>
                        </motion.button>

                        {/* Settings and Ranking row */}
                        <div className="flex gap-4">
                            <motion.button
                                onClick={() => {
                                    soundManager.play('buttonClick');
                                    onSettings?.();
                                }}
                                className="flex-1 bg-slate-800/50 hover:bg-slate-700/50 text-white rounded-xl px-6 py-3 flex items-center justify-center gap-2 transition-all border border-slate-700/50"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <span>⚙️</span>
                                <span className="font-medium">SETTINGS</span>
                            </motion.button>

                            <motion.button
                                onClick={() => {
                                    soundManager.play('buttonClick');
                                    onRanking?.();
                                }}
                                className="flex-1 bg-slate-800/50 hover:bg-slate-700/50 text-white rounded-xl px-6 py-3 flex items-center justify-center gap-2 transition-all border border-slate-700/50"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <span>📊</span>
                                <span className="font-medium">RANKING</span>
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            </main>

            {/* Footer */}
            <footer className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex justify-center items-center gap-6 text-slate-500 text-sm">
                    <button className="hover:text-white transition-colors">How to Play</button>
                    <span>•</span>
                    <button className="hover:text-white transition-colors">Credits</button>
                    <span>•</span>
                    <span>v1.0.2</span>
                </div>
            </footer>
        </div>
    );
}
