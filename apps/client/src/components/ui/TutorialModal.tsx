import { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayingCard, CardData } from './PlayingCard';
import { soundManager } from '../../utils/soundManager';
import {
    Sparkles,
    Target,
    Crown,
    Hash,
    HelpCircle,
    Swords,
    Heart,
    Lightbulb,
    Users,
    Layers,
    RefreshCw,
    Clock,
    Trophy,
    AlertTriangle,
    Check,
    X,
    Zap,
    Calculator,
    Copy,
} from 'lucide-react';

interface TutorialModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Sample cards for demonstrations
const SAMPLE_CARDS: Record<string, CardData> = {
    heartK: { id: 'h-K', suit: 'hearts', rank: 'K' },
    heartA: { id: 'h-A', suit: 'hearts', rank: 'A' },
    heart5: { id: 'h-5', suit: 'hearts', rank: '5' },
    diamondK: { id: 'd-K', suit: 'diamonds', rank: 'K' },
    diamond7: { id: 'd-7', suit: 'diamonds', rank: '7' },
    clubK: { id: 'c-K', suit: 'clubs', rank: 'K' },
    club3: { id: 'c-3', suit: 'clubs', rank: '3' },
    spadeK: { id: 's-K', suit: 'spades', rank: 'K' },
    spadeA: { id: 's-A', suit: 'spades', rank: 'A' },
};

// Tutorial slides
const slides: Array<{ id: string; title: string; subtitle: string; icon: ReactNode }> = [
    {
        id: 'welcome',
        title: 'Welcome to Besugen!',
        subtitle: 'The Ultimate Card Battle',
        icon: <Sparkles className="w-7 h-7" />,
    },
    {
        id: 'overview',
        title: 'Game Overview',
        subtitle: 'Predict & Survive',
        icon: <Target className="w-7 h-7" />,
    },
    {
        id: 'suits',
        title: 'Suit Hierarchy',
        subtitle: 'Not All Suits Are Equal',
        icon: <Crown className="w-7 h-7" />,
    },
    {
        id: 'values',
        title: 'Card Values',
        subtitle: 'Higher is Better (Usually)',
        icon: <Hash className="w-7 h-7" />,
    },
    {
        id: 'bidding',
        title: 'The Bidding Phase',
        subtitle: 'Make Your Predictions',
        icon: <HelpCircle className="w-7 h-7" />,
    },
    {
        id: 'tricks',
        title: 'Playing Tricks',
        subtitle: 'May the Best Card Win',
        icon: <Swords className="w-7 h-7" />,
    },
    {
        id: 'lives',
        title: 'Lives & Scoring',
        subtitle: 'Stay in the Game',
        icon: <Heart className="w-7 h-7" />,
    },
    {
        id: 'tips',
        title: 'Pro Tips',
        subtitle: 'Secrets to Victory',
        icon: <Lightbulb className="w-7 h-7" />,
    },
];

function WelcomeSlide() {
    return (
        <div className="text-center space-y-6">
            <motion.div
                className="text-8xl"
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
                🂠
            </motion.div>
            <p className="text-slate-300 text-lg leading-relaxed max-w-md mx-auto">
                A trick-taking card game where <span className="text-yellow-400 font-semibold">prediction is key</span>.
                Bid wisely, play smart, and be the last one standing!
            </p>
            <div className="flex justify-center gap-4 pt-4">
                {['♠', '♣', '♦', '♥'].map((suit, i) => (
                    <motion.span
                        key={suit}
                        className={`text-4xl ${i >= 2 ? 'text-red-500' : 'text-slate-400'}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + i * 0.2 }}
                    >
                        {suit}
                    </motion.span>
                ))}
            </div>
        </div>
    );
}

function OverviewSlide() {
    const phases: Array<{ icon: ReactNode; label: string; desc: string }> = [
        { icon: <Layers className="w-6 h-6" />, label: 'Deal', desc: 'Cards are dealt' },
        { icon: <Target className="w-6 h-6" />, label: 'Bid', desc: 'Predict your wins' },
        { icon: <Swords className="w-6 h-6" />, label: 'Play', desc: 'Win tricks' },
        { icon: <Trophy className="w-6 h-6" />, label: 'Score', desc: 'Check your bid' },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-4 gap-2">
                {phases.map((phase, i) => (
                    <motion.div
                        key={phase.label}
                        className="text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.15 }}
                    >
                        <div className="flex justify-center mb-2 text-blue-400">{phase.icon}</div>
                        <div className="text-white font-semibold text-sm">{phase.label}</div>
                        <div className="text-slate-400 text-xs">{phase.desc}</div>
                    </motion.div>
                ))}
            </div>

            <div className="bg-slate-700/50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-blue-400" />
                    <div>
                        <span className="text-white font-medium">2-6 Players</span>
                        <span className="text-slate-400 text-sm ml-2">The more the merrier!</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Layers className="w-6 h-6 text-purple-400" />
                    <div>
                        <span className="text-white font-medium">104 Cards</span>
                        <span className="text-slate-400 text-sm ml-2">(Two full decks shuffled together)</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <RefreshCw className="w-6 h-6 text-green-400" />
                    <div>
                        <span className="text-white font-medium">Card Rotation</span>
                        <span className="text-slate-400 text-sm ml-2">5 → 4 → 3 → 2 → 1 → repeat</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SuitsSlide() {
    const suits = [
        { symbol: '♥', name: 'Hearts', rank: 1, color: 'text-red-500', bg: 'bg-red-500/20' },
        { symbol: '♦', name: 'Diamonds', rank: 2, color: 'text-red-400', bg: 'bg-red-400/20' },
        { symbol: '♣', name: 'Clubs', rank: 3, color: 'text-slate-300', bg: 'bg-slate-500/20' },
        { symbol: '♠', name: 'Spades', rank: 4, color: 'text-slate-400', bg: 'bg-slate-600/20' },
    ];

    return (
        <div className="space-y-4">
            <p className="text-slate-300 text-center mb-4">
                Suits have a <span className="text-yellow-400 font-semibold">fixed hierarchy</span> - a higher suit ALWAYS beats a lower one!
            </p>

            <div className="space-y-2">
                {suits.map((suit, i) => (
                    <motion.div
                        key={suit.name}
                        className={`flex items-center gap-4 ${suit.bg} rounded-lg p-3`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.15 }}
                    >
                        <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-white font-bold">
                            #{suit.rank}
                        </div>
                        <span className={`text-4xl ${suit.color}`}>{suit.symbol}</span>
                        <span className="text-white font-medium flex-1">{suit.name}</span>
                        {i === 0 && (
                            <span className="bg-yellow-500 text-yellow-900 text-xs font-bold px-2 py-1 rounded">
                                STRONGEST
                            </span>
                        )}
                        {i === suits.length - 1 && (
                            <span className="bg-slate-600 text-slate-300 text-xs font-medium px-2 py-1 rounded">
                                weakest
                            </span>
                        )}
                    </motion.div>
                ))}
            </div>

            <motion.div
                className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
            >
                <p className="text-blue-300 text-sm text-center">
                    <span className="font-bold">Example:</span> A <span className="text-red-500">♥2</span> beats a <span className="text-slate-400">♠K</span> because Hearts &gt; Spades!
                </p>
            </motion.div>
        </div>
    );
}

function ValuesSlide() {
    return (
        <div className="space-y-4">
            <p className="text-slate-300 text-center">
                When suits are the <span className="text-yellow-400 font-semibold">same</span>, card value decides the winner.
            </p>

            <div className="bg-slate-700/50 rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-slate-400 text-sm">LOWEST</span>
                    <span className="text-slate-400 text-sm">HIGHEST</span>
                </div>
                <div className="flex justify-between items-center gap-1">
                    {['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'].map((val, i) => (
                        <motion.div
                            key={val}
                            className={`
                                w-7 h-10 rounded flex items-center justify-center text-xs font-bold
                                ${val === 'A' ? 'bg-slate-600 text-slate-400' : ''}
                                ${val === 'K' ? 'bg-yellow-500 text-yellow-900' : ''}
                                ${val !== 'A' && val !== 'K' ? 'bg-slate-700 text-white' : ''}
                            `}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            {val}
                        </motion.div>
                    ))}
                </div>
                <div className="flex justify-between items-center mt-2">
                    <span className="text-slate-500 text-xs">= 1</span>
                    <span className="text-yellow-500 text-xs">= 13</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
                <motion.div
                    className="bg-green-500/20 border border-green-500/30 rounded-lg p-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                >
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <PlayingCard card={SAMPLE_CARDS.heartK} size="sm" />
                        <Trophy className="w-5 h-5 text-green-400" />
                        <PlayingCard card={SAMPLE_CARDS.heart5} size="sm" />
                    </div>
                    <p className="text-green-300 text-xs text-center">K of Hearts beats 5 of Hearts</p>
                </motion.div>

                <motion.div
                    className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                >
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <PlayingCard card={SAMPLE_CARDS.heartA} size="sm" />
                        <AlertTriangle className="w-5 h-5 text-amber-400" />
                    </div>
                    <p className="text-amber-300 text-xs text-center">Ace is the LOWEST card (=1)</p>
                </motion.div>
            </div>
        </div>
    );
}

function BiddingSlide() {
    const [animatedBid, setAnimatedBid] = useState(0);

    return (
        <div className="space-y-4">
            <p className="text-slate-300 text-center">
                Before playing, you must <span className="text-yellow-400 font-semibold">predict</span> how many tricks you'll win!
            </p>

            <motion.div
                className="bg-slate-700/50 rounded-xl p-4 text-center"
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
            >
                <p className="text-slate-400 text-sm mb-3">Example: Round with 5 cards</p>
                <div className="flex justify-center gap-2 mb-4">
                    {[0, 1, 2, 3, 4, 5].map((bid) => (
                        <motion.button
                            key={bid}
                            className={`w-10 h-10 rounded-lg font-bold transition-colors ${
                                animatedBid === bid
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                            }`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setAnimatedBid(bid)}
                        >
                            {bid}
                        </motion.button>
                    ))}
                </div>
                <p className="text-white text-sm">
                    You bid: <span className="text-blue-400 font-bold text-xl">{animatedBid}</span> trick{animatedBid !== 1 ? 's' : ''}
                </p>
            </motion.div>

            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                <p className="text-red-300 text-sm">
                    <span className="font-bold">Important:</span> The total of ALL bids cannot equal the number of cards dealt.
                    The last bidder might have limited options!
                </p>
            </div>

            <div className="bg-slate-700/30 rounded-lg p-3">
                <p className="text-slate-400 text-sm text-center flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4" />
                    You have <span className="text-white font-bold">10 seconds</span> to bid, or you'll auto-bid 0!
                </p>
            </div>
        </div>
    );
}

function TricksSlide() {
    return (
        <div className="space-y-4">
            <p className="text-slate-300 text-center">
                Players take turns playing <span className="text-yellow-400 font-semibold">one card each</span>. Highest card wins the trick!
            </p>

            <div className="bg-slate-700/50 rounded-xl p-4">
                <p className="text-slate-400 text-sm text-center mb-3">Example Trick:</p>
                <div className="flex justify-center items-end gap-3">
                    <div className="text-center">
                        <PlayingCard card={SAMPLE_CARDS.spadeK} size="sm" />
                        <p className="text-slate-400 text-xs mt-1">Player 1</p>
                    </div>
                    <div className="text-center">
                        <PlayingCard card={SAMPLE_CARDS.diamondK} size="sm" />
                        <p className="text-slate-400 text-xs mt-1">Player 2</p>
                    </div>
                    <motion.div
                        className="text-center"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                    >
                        <div className="relative">
                            <PlayingCard card={SAMPLE_CARDS.heartA} size="sm" />
                            <Crown className="absolute -top-2 -right-2 w-5 h-5 text-yellow-400" />
                        </div>
                        <p className="text-green-400 text-xs mt-1 font-bold">WINNER!</p>
                    </motion.div>
                </div>
                <p className="text-slate-400 text-xs text-center mt-3">
                    Even an Ace of Hearts beats Kings of other suits!
                </p>
            </div>

            <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-3">
                <p className="text-purple-300 text-sm">
                    <span className="font-bold">Tie-breaker:</span> If two players play the exact same card
                    (remember, there are 2 decks!), the one who played it <span className="text-white font-semibold">first</span> wins!
                </p>
            </div>
        </div>
    );
}

function LivesSlide() {
    return (
        <div className="space-y-4">
            <p className="text-slate-300 text-center">
                Each player starts with <span className="text-red-400 font-semibold">3 lives</span>. Miss your bid? Lose a life!
            </p>

            <div className="grid grid-cols-2 gap-4">
                <motion.div
                    className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 text-center"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <div className="flex justify-center mb-2">
                        <Check className="w-10 h-10 text-green-400" />
                    </div>
                    <p className="text-white font-medium">Bid = Tricks Won</p>
                    <p className="text-green-400 text-sm mt-1">Safe! + Bonus points</p>
                    <div className="mt-2 flex justify-center gap-1">
                        <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                        <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                        <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                    </div>
                </motion.div>

                <motion.div
                    className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-center"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <div className="flex justify-center mb-2">
                        <X className="w-10 h-10 text-red-400" />
                    </div>
                    <p className="text-white font-medium">Bid ≠ Tricks Won</p>
                    <p className="text-red-400 text-sm mt-1">Lose a life!</p>
                    <div className="mt-2 flex justify-center gap-1">
                        <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                        <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                        <Heart className="w-5 h-5 text-slate-600" />
                    </div>
                </motion.div>
            </div>

            <motion.div
                className="bg-slate-800 rounded-xl p-4 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <div className="flex justify-center mb-2">
                    <Trophy className="w-12 h-12 text-yellow-400" />
                </div>
                <p className="text-white font-bold text-lg">Last Player Standing Wins!</p>
                <p className="text-slate-400 text-sm mt-1">
                    When you lose all 3 lives, you're eliminated and become a spectator.
                </p>
            </motion.div>
        </div>
    );
}

function TipsSlide() {
    const tips: Array<{ icon: ReactNode; tip: string; color: string }> = [
        {
            icon: <Heart className="w-5 h-5" />,
            tip: 'Hearts are KING - even a low Heart beats high cards of other suits',
            color: 'text-red-400'
        },
        {
            icon: <Target className="w-5 h-5" />,
            tip: 'Bidding 0 is valid! Sometimes dodging tricks is the smartest play',
            color: 'text-blue-400'
        },
        {
            icon: <Copy className="w-5 h-5" />,
            tip: 'With 2 decks, duplicates exist - playing first matters in ties',
            color: 'text-purple-400'
        },
        {
            icon: <Calculator className="w-5 h-5" />,
            tip: 'Count what\'s been played to predict what others might have',
            color: 'text-green-400'
        },
        {
            icon: <Zap className="w-5 h-5" />,
            tip: 'In the 1-card round, it\'s pure chaos - embrace it!',
            color: 'text-yellow-400'
        },
    ];

    return (
        <div className="space-y-3">
            {tips.map((tip, i) => (
                <motion.div
                    key={i}
                    className="flex items-start gap-3 bg-slate-700/30 rounded-lg p-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                >
                    <div className={`${tip.color} flex-shrink-0 mt-0.5`}>{tip.icon}</div>
                    <p className="text-slate-300 text-sm">{tip.tip}</p>
                </motion.div>
            ))}

            <motion.div
                className="text-center mt-4 pt-4 border-t border-slate-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
            >
                <p className="text-yellow-400 font-medium">Good luck and have fun!</p>
                <p className="text-slate-500 text-sm mt-1">May your bids always be true...</p>
            </motion.div>
        </div>
    );
}

function SlideContent({ slideId }: { slideId: string }) {
    switch (slideId) {
        case 'welcome':
            return <WelcomeSlide />;
        case 'overview':
            return <OverviewSlide />;
        case 'suits':
            return <SuitsSlide />;
        case 'values':
            return <ValuesSlide />;
        case 'bidding':
            return <BiddingSlide />;
        case 'tricks':
            return <TricksSlide />;
        case 'lives':
            return <LivesSlide />;
        case 'tips':
            return <TipsSlide />;
        default:
            return null;
    }
}

export function TutorialModal({ isOpen, onClose }: TutorialModalProps) {
    const [currentSlide, setCurrentSlide] = useState(0);

    const goToSlide = (index: number) => {
        soundManager.play('buttonClick');
        setCurrentSlide(index);
    };

    const nextSlide = () => {
        if (currentSlide < slides.length - 1) {
            goToSlide(currentSlide + 1);
        }
    };

    const prevSlide = () => {
        if (currentSlide > 0) {
            goToSlide(currentSlide - 1);
        }
    };

    const handleClose = () => {
        soundManager.play('buttonClick');
        setCurrentSlide(0);
        onClose();
    };

    if (!isOpen) return null;

    const slide = slides[currentSlide];

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                {/* Backdrop */}
                <motion.div
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    onClick={handleClose}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                />

                {/* Modal */}
                <motion.div
                    className="relative bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="text-white">{slide.icon}</div>
                                <div>
                                    <h2 className="text-white font-bold text-lg">{slide.title}</h2>
                                    <p className="text-white/70 text-sm">{slide.subtitle}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                className="text-white/70 hover:text-white transition-colors p-1"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[50vh]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentSlide}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                <SlideContent slideId={slide.id} />
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Footer with navigation */}
                    <div className="border-t border-slate-700 p-4">
                        {/* Progress dots */}
                        <div className="flex justify-center gap-2 mb-4">
                            {slides.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => goToSlide(i)}
                                    className={`w-2 h-2 rounded-full transition-all ${
                                        i === currentSlide
                                            ? 'bg-blue-500 w-6'
                                            : 'bg-slate-600 hover:bg-slate-500'
                                    }`}
                                />
                            ))}
                        </div>

                        {/* Navigation buttons */}
                        <div className="flex justify-between items-center">
                            <motion.button
                                onClick={prevSlide}
                                disabled={currentSlide === 0}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    currentSlide === 0
                                        ? 'text-slate-600 cursor-not-allowed'
                                        : 'text-slate-300 hover:text-white hover:bg-slate-700'
                                }`}
                                whileHover={currentSlide > 0 ? { scale: 1.05 } : undefined}
                                whileTap={currentSlide > 0 ? { scale: 0.95 } : undefined}
                            >
                                ← Previous
                            </motion.button>

                            <span className="text-slate-500 text-sm">
                                {currentSlide + 1} / {slides.length}
                            </span>

                            {currentSlide < slides.length - 1 ? (
                                <motion.button
                                    onClick={nextSlide}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Next →
                                </motion.button>
                            ) : (
                                <motion.button
                                    onClick={handleClose}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Let's Play!
                                    <Sparkles className="w-4 h-4" />
                                </motion.button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
