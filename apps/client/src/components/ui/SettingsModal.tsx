import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { soundManager } from '../../utils/soundManager';
import { Volume2, VolumeX, Volume1, Music, Music2 } from 'lucide-react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigateToPrivacy?: () => void;
    onNavigateToTerms?: () => void;
}

export function SettingsModal({ isOpen, onClose, onNavigateToPrivacy, onNavigateToTerms }: SettingsModalProps) {
    const [sfxVolume, setSfxVolume] = useState(soundManager.getVolume() * 100);
    const [musicVolume, setMusicVolume] = useState(soundManager.getMusicVolume() * 100);

    // Store previous volume for mute/unmute toggle
    const prevSfxVolume = useRef(50);
    const prevMusicVolume = useRef(30);

    // Sync with sound manager on mount/open
    useEffect(() => {
        if (isOpen) {
            const currentSfx = soundManager.getVolume() * 100;
            const currentMusic = soundManager.getMusicVolume() * 100;
            setSfxVolume(currentSfx);
            setMusicVolume(currentMusic);
            // Store as previous if not muted
            if (currentSfx > 0) prevSfxVolume.current = currentSfx;
            if (currentMusic > 0) prevMusicVolume.current = currentMusic;
        }
    }, [isOpen]);

    const handleSfxVolumeChange = (value: number) => {
        if (value > 0) prevSfxVolume.current = value;
        setSfxVolume(value);
        soundManager.setVolume(value / 100);
    };

    const handleMusicVolumeChange = (value: number) => {
        if (value > 0) prevMusicVolume.current = value;
        setMusicVolume(value);
        soundManager.setMusicVolume(value / 100);
        // Start music if turning volume up from 0 and not already playing
        if (value > 0 && !soundManager.isMusicPlaying()) {
            soundManager.startMusic();
        } else if (value === 0) {
            soundManager.stopMusic();
        }
    };

    const toggleSfxMute = () => {
        if (sfxVolume > 0) {
            // Mute - store current and set to 0
            prevSfxVolume.current = sfxVolume;
            handleSfxVolumeChange(0);
        } else {
            // Unmute - restore previous
            handleSfxVolumeChange(prevSfxVolume.current || 50);
        }
        soundManager.play('buttonClick');
    };

    const toggleMusicMute = () => {
        if (musicVolume > 0) {
            // Mute - store current and set to 0
            prevMusicVolume.current = musicVolume;
            handleMusicVolumeChange(0);
        } else {
            // Unmute - restore previous
            handleMusicVolumeChange(prevMusicVolume.current || 30);
        }
    };

    // Get icon based on volume level
    const SfxIcon = sfxVolume === 0 ? VolumeX : sfxVolume < 50 ? Volume1 : Volume2;
    const MusicIcon = musicVolume === 0 ? Music : Music2;

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
                            <div className="p-8 space-y-8">
                                {/* Sound Effects Volume */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={toggleSfxMute}
                                            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${sfxVolume === 0 ? 'bg-slate-800 text-slate-500 hover:bg-slate-700' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
                                        >
                                            <SfxIcon className="w-5 h-5" />
                                        </button>
                                        <div className="flex-1">
                                            <p className="text-white font-medium">Sound Effects</p>
                                            <p className="text-slate-400 text-sm">Game sounds</p>
                                        </div>
                                        <span className="text-slate-400 text-sm w-12 text-right">{Math.round(sfxVolume)}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={sfxVolume}
                                        onChange={(e) => handleSfxVolumeChange(Number(e.target.value))}
                                        onMouseUp={() => soundManager.play('buttonClick')}
                                        onTouchEnd={() => soundManager.play('buttonClick')}
                                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider-blue"
                                    />
                                </div>

                                {/* Music Volume */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={toggleMusicMute}
                                            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${musicVolume === 0 ? 'bg-slate-800 text-slate-500 hover:bg-slate-700' : 'bg-purple-600 text-white hover:bg-purple-500'}`}
                                        >
                                            <MusicIcon className="w-5 h-5" />
                                        </button>
                                        <div className="flex-1">
                                            <p className="text-white font-medium">Background Music</p>
                                            <p className="text-slate-400 text-sm">Ambient lofi theme</p>
                                        </div>
                                        <span className="text-slate-400 text-sm w-12 text-right">{Math.round(musicVolume)}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={musicVolume}
                                        onChange={(e) => handleMusicVolumeChange(Number(e.target.value))}
                                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider-purple"
                                    />
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="bg-slate-800/30 p-6 flex justify-between items-center">
                                <div className="flex gap-4 text-sm">
                                    <button
                                        onClick={onNavigateToPrivacy}
                                        className="text-slate-400 hover:text-white transition-colors"
                                    >
                                        Privacy
                                    </button>
                                    <button
                                        onClick={onNavigateToTerms}
                                        className="text-slate-400 hover:text-white transition-colors"
                                    >
                                        Terms
                                    </button>
                                </div>
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
