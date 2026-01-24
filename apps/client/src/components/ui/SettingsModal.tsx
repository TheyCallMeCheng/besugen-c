import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { soundManager } from '../../utils/soundManager';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const [isMuted, setIsMuted] = useState(soundManager.isMuted());

    // Sync with sound manager on mount/open
    useEffect(() => {
        if (isOpen) {
            setIsMuted(soundManager.isMuted());
        }
    }, [isOpen]);

    const handleToggleMute = () => {
        const newMuteState = soundManager.toggleMute();
        setIsMuted(newMuteState);
        soundManager.play('buttonClick');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
                    >
                        <motion.div
                            className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md mx-4 shadow-2xl overflow-hidden pointer-events-auto"
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        >
                            {/* Header */}
                            <div className="bg-slate-800/50 p-6 border-b border-slate-700/50 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <span>⚙️</span>
                                    Settings
                                </h2>
                                <button
                                    onClick={() => {
                                        soundManager.play('buttonClick');
                                        onClose();
                                    }}
                                    className="text-slate-400 hover:text-white transition-colors text-2xl leading-none"
                                >
                                    &times;
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-8 space-y-6">
                                {/* Sound Toggle */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isMuted ? 'bg-slate-800 text-slate-500' : 'bg-blue-600 text-white'}`}>
                                            <span className="text-xl">
                                                {isMuted ? '🔇' : '🔊'}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">Sound Effects</p>
                                            <p className="text-slate-400 text-sm">Enable game sounds</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleToggleMute}
                                        className={`w-14 h-8 rounded-full p-1 transition-colors relative ${isMuted ? 'bg-slate-700' : 'bg-green-500'}`}
                                    >
                                        <motion.div
                                            className="w-6 h-6 bg-white rounded-full shadow-md"
                                            animate={{ x: isMuted ? 0 : 24 }}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        />
                                    </button>
                                </div>

                                {/* Placeholder for future settings */}
                                <div className="pt-4 border-t border-slate-800">
                                    <p className="text-slate-500 text-sm text-center italic">
                                        More settings coming soon...
                                    </p>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="bg-slate-800/30 p-6 flex justify-end">
                                <button
                                    onClick={() => {
                                        soundManager.play('buttonClick');
                                        onClose();
                                    }}
                                    className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                                >
                                    Done
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
