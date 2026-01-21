import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface BiddingModalProps {
    isOpen: boolean;
    isMyTurn: boolean;
    currentBidderName: string;
    cardCount: number;
    totalBidsSoFar: number;
    isLastBidder: boolean;
    timerEndTime: number; // Timestamp when timer expires
    otherPlayerBids: Array<{ name: string; bid: number }>;
    onSubmitBid: (bid: number) => void;
}

export function BiddingModal({
    isOpen,
    isMyTurn,
    currentBidderName,
    cardCount,
    totalBidsSoFar,
    isLastBidder,
    timerEndTime,
    otherPlayerBids,
    onSubmitBid,
}: BiddingModalProps) {
    const [timeLeft, setTimeLeft] = useState(10);
    const [selectedBid, setSelectedBid] = useState<number | null>(null);

    // Calculate max bid (capped by remaining tricks)
    const maxBid = Math.max(0, cardCount - totalBidsSoFar);

    // Timer countdown
    useEffect(() => {
        if (!isOpen) return;

        const updateTimer = () => {
            const now = Date.now();
            const remaining = Math.max(0, Math.ceil((timerEndTime - now) / 1000));
            setTimeLeft(remaining);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 100);
        return () => clearInterval(interval);
    }, [isOpen, timerEndTime]);

    // Reset selection when turn changes
    useEffect(() => {
        setSelectedBid(null);
    }, [isMyTurn]);

    const handleSubmit = () => {
        if (selectedBid !== null) {
            onSubmitBid(selectedBid);
        }
    };

    // Generate bid options
    const bidOptions = [];
    for (let i = 0; i <= maxBid; i++) {
        bidOptions.push(i);
    }

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                {/* Modal Content */}
                <motion.div
                    className="relative bg-slate-900/95 border border-slate-700 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                >
                    {/* Header */}
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-white mb-2">
                            {isMyTurn ? 'Your Turn to Bid' : 'Bidding Phase'}
                        </h2>
                        <p className="text-slate-400">
                            {isMyTurn
                                ? `How many tricks will you win? (${cardCount} cards)`
                                : `Waiting for ${currentBidderName}...`}
                        </p>
                    </div>

                    {/* Timer */}
                    <div className="flex justify-center mb-6">
                        <div className={`
                            w-20 h-20 rounded-full flex items-center justify-center
                            text-3xl font-bold transition-colors
                            ${timeLeft <= 3 ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-slate-800 text-white'}
                        `}>
                            {timeLeft}s
                        </div>
                    </div>

                    {/* Other Players' Bids */}
                    {otherPlayerBids.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-slate-400 mb-2">Current Bids</h3>
                            <div className="flex flex-wrap gap-2">
                                {otherPlayerBids.map((p, i) => (
                                    <div
                                        key={i}
                                        className="bg-slate-800 rounded-lg px-3 py-2 text-sm"
                                    >
                                        <span className="text-slate-400">{p.name}:</span>{' '}
                                        <span className="text-green-400 font-bold">{p.bid}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-slate-500 text-sm mt-2">
                                Total: {totalBidsSoFar} / {cardCount} picks
                            </p>
                        </div>
                    )}

                    {/* Bid Selection (only when it's my turn) */}
                    {isMyTurn && (
                        <>
                            <div className="mb-6">
                                <h3 className="text-sm font-medium text-slate-400 mb-3">
                                    Select your bid (0 to {maxBid})
                                </h3>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {bidOptions.map((bid) => (
                                        <motion.button
                                            key={bid}
                                            onClick={() => setSelectedBid(bid)}
                                            className={`
                                                w-14 h-14 rounded-xl text-xl font-bold transition-all
                                                ${selectedBid === bid
                                                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/25'
                                                    : 'bg-slate-800 text-white hover:bg-slate-700'
                                                }
                                            `}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            {bid}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <motion.button
                                onClick={handleSubmit}
                                disabled={selectedBid === null}
                                className={`
                                    w-full py-4 rounded-xl text-lg font-bold transition-all
                                    ${selectedBid !== null
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                                        : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                    }
                                `}
                                whileHover={selectedBid !== null ? { scale: 1.02 } : undefined}
                                whileTap={selectedBid !== null ? { scale: 0.98 } : undefined}
                            >
                                {selectedBid !== null ? `Bid ${selectedBid} Trick${selectedBid !== 1 ? 's' : ''}` : 'Select a Bid'}
                            </motion.button>


                        </>
                    )}

                    {/* Waiting state (not my turn) */}
                    {!isMyTurn && (
                        <div className="text-center py-4">
                            <div className="inline-flex items-center gap-2 text-slate-400">
                                <div className="animate-spin w-5 h-5 border-2 border-slate-500 border-t-white rounded-full" />
                                <span>Waiting for {currentBidderName} to bid...</span>
                            </div>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
