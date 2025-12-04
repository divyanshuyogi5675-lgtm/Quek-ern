
import React, { useState, useRef, useEffect } from 'react';
import { X, Gift, Users, Trophy, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';

// --- DAILY BONUS MODAL ---
interface DailyBonusModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const DailyBonusModal: React.FC<DailyBonusModalProps> = ({ isOpen, onClose }) => {
    const { claimDailyBonus } = useAuth();
    const [claimed, setClaimed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleClaim = async () => {
        setLoading(true);
        try {
            const success = await claimDailyBonus();
            if (success) {
                setClaimed(true);
            } else {
                setError("You have already claimed your bonus today!");
            }
        } catch (e) {
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center relative overflow-hidden shadow-2xl">
                <button onClick={onClose} className="absolute top-2 right-2 p-2 text-gray-400 hover:bg-gray-100 rounded-full"><X className="w-5 h-5"/></button>
                
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-yellow-100 to-transparent -skew-y-6 transform -translate-y-10"></div>

                <div className="relative z-10">
                    <div className="w-24 h-24 bg-gradient-to-br from-yellow-100 to-white rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-xl">
                        <Gift className="w-12 h-12 text-yellow-500" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">Daily Check-in</h3>
                    
                    {!claimed && !error && (
                        <>
                            <p className="text-gray-500 mb-6 text-sm">Login every day to claim free rewards!</p>
                            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-100 rounded-xl p-5 mb-6 shadow-inner">
                                <span className="text-4xl font-extrabold text-yellow-600 drop-shadow-sm">₹1.00</span>
                                <p className="text-xs text-yellow-700 font-bold uppercase mt-1 tracking-wider">Free Bonus</p>
                            </div>
                            <Button onClick={handleClaim} fullWidth isLoading={loading} className="shadow-lg shadow-emerald-200">Claim Reward</Button>
                        </>
                    )}

                    {claimed && (
                        <div className="animate-fade-in-up">
                            <p className="text-green-600 font-bold text-lg mb-2">Reward Added Successfully!</p>
                            <p className="text-gray-500 text-sm mb-6">Come back tomorrow for more.</p>
                            <Button onClick={onClose} variant="outline" fullWidth>Close</Button>
                        </div>
                    )}

                    {error && (
                        <div className="animate-fade-in-up">
                             <p className="text-red-500 font-bold mb-4 bg-red-50 p-3 rounded-lg text-sm">{error}</p>
                             <Button onClick={onClose} variant="outline" fullWidth>Close</Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- MY TEAM MODAL ---
interface TeamModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const TeamModal: React.FC<TeamModalProps> = ({ isOpen, onClose }) => {
    // Fake team data for social proof
    const teamMembers = [
        { id: 1, name: 'Rahul Kumar', income: '₹12,450', level: 'Level 1' },
        { id: 2, name: 'Priya Singh', income: '₹8,320', level: 'Level 1' },
        { id: 3, name: 'Amit Verma', income: '₹5,100', level: 'Level 2' },
        { id: 4, name: 'Vikram J.', income: '₹4,200', level: 'Level 1' },
        { id: 5, name: 'Sneha R.', income: '₹2,800', level: 'Level 3' },
        { id: 6, name: 'Karan D.', income: '₹1,500', level: 'Level 2' },
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up">
            <div className="bg-white rounded-2xl w-full max-w-sm flex flex-col max-h-[80vh] shadow-2xl overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-blue-50 to-white">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-100 p-1.5 rounded-lg"><Users className="w-5 h-5 text-blue-600"/></div>
                        <h3 className="font-bold text-blue-900">My Team</h3>
                    </div>
                    <button onClick={onClose} className="bg-white p-1 rounded-full hover:bg-gray-100"><X className="w-5 h-5 text-gray-400"/></button>
                </div>
                
                <div className="p-6 bg-gradient-to-br from-blue-600 to-blue-800 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    <div className="flex justify-between items-center relative z-10">
                        <div>
                            <p className="text-blue-200 text-xs uppercase font-bold tracking-wider mb-1">Total Commission</p>
                            <h2 className="text-3xl font-extrabold">₹0.00</h2>
                        </div>
                        <div className="text-right bg-white/10 px-3 py-2 rounded-lg border border-white/10 backdrop-blur-sm">
                             <p className="text-blue-100 text-[10px] uppercase font-bold">Team Size</p>
                             <h2 className="text-xl font-bold">0</h2>
                        </div>
                    </div>
                </div>

                <div className="overflow-y-auto p-4 flex-1 bg-gray-50">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Top Performers (Global)</h4>
                    <div className="space-y-3">
                        {teamMembers.map(member => (
                            <div key={member.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center font-bold text-gray-500 text-xs border border-gray-300">
                                        {member.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm">{member.name}</p>
                                        <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-semibold border border-blue-100">{member.level}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-emerald-600 font-black text-sm">{member.income}</p>
                                    <p className="text-[10px] text-gray-400 font-medium">Income</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- SPIN WHEEL MODAL (PREMIUM UI) ---
interface SpinWheelModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Prizes: 10, 30, 50, 70, 100
const PRIZES = [
    { label: '₹10', value: 10, color: '#4c1d95', text: '#e9d5ff' }, // Violet
    { label: '₹30', value: 30, color: '#0f172a', text: '#38bdf8' }, // Slate
    { label: '₹50', value: 50, color: '#be185d', text: '#fbcfe8' }, // Pink
    { label: '₹70', value: 70, color: '#166534', text: '#bbf7d0' }, // Green
    { label: '₹100', value: 100, color: '#b45309', text: '#fcd34d' }, // Gold
];

export const SpinWheelModal: React.FC<SpinWheelModalProps> = ({ isOpen, onClose }) => {
    const { user, spinWheel } = useAuth();
    const [spinning, setSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [winAmount, setWinAmount] = useState<number | null>(null);

    const handleSpin = async () => {
        if (!user || user.spin_balance <= 0 || spinning) return;

        setSpinning(true);
        setWinAmount(null);
        
        try {
            // Call Backend to get result (amount)
            const prizeAmount = await spinWheel();
            
            // Calculate Stop Position
            const prizeIndex = PRIZES.findIndex(p => p.value === prizeAmount);
            
            // Random offset within the slice to look natural (+/- 30deg)
            const randomOffset = Math.floor(Math.random() * 50) - 25; 
            const segmentAngle = 360 / PRIZES.length;
            
            // Calculate total rotation
            // 1800 (5 spins) + Target Angle + Offset
            // We need to invert index logic because wheel rotates clockwise
            const targetRotation = 1800 + (360 - (prizeIndex * segmentAngle)) + randomOffset;
            
            setRotation(targetRotation);
            
            // Wait for animation (3s)
            setTimeout(() => {
                setSpinning(false);
                setWinAmount(prizeAmount);
            }, 3000);

        } catch (e: any) {
            alert(e.message);
            setSpinning(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in-up">
            <div className="bg-slate-950 rounded-[2rem] w-full max-w-sm p-0 overflow-hidden relative shadow-2xl border border-slate-800 flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="bg-slate-900/50 p-4 flex justify-between items-center z-20 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-purple-400" />
                        <h3 className="font-bold text-white tracking-wide">PREMIUM SPIN</h3>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"><X className="w-5 h-5"/></button>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col items-center justify-center relative flex-1 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 to-slate-950">
                    
                    {/* Glowing Pointer */}
                    <div className="absolute top-[15%] z-20">
                         <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[20px] border-t-purple-500 drop-shadow-[0_0_15px_rgba(168,85,247,0.8)]"></div>
                    </div>

                    {/* Wheel Container with Neon Glow */}
                    <div className="relative p-1 rounded-full bg-gradient-to-b from-purple-500 to-pink-600 shadow-[0_0_60px_rgba(168,85,247,0.3)]">
                        <div 
                            className="w-64 h-64 rounded-full border-[8px] border-slate-900 relative overflow-hidden transition-transform duration-[3000ms] cubic-bezier(0.1, 0.7, 0.1, 1)"
                            style={{ 
                                transform: `rotate(${rotation}deg)`,
                                background: `conic-gradient(
                                    ${PRIZES.map((p, i) => `${p.color} ${i * (100/PRIZES.length)}% ${(i+1) * (100/PRIZES.length)}%`).join(', ')}
                                )`
                            }}
                        >
                            {PRIZES.map((prize, index) => {
                                const angle = index * (360 / PRIZES.length) + (360 / PRIZES.length) / 2;
                                return (
                                    <div 
                                        key={index}
                                        className="absolute w-full h-full text-center flex justify-center pt-6"
                                        style={{ 
                                            transform: `rotate(${angle}deg)`,
                                        }}
                                    >
                                        <span 
                                            className="font-black text-lg block drop-shadow-md" 
                                            style={{ color: prize.text, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
                                        >
                                            {prize.label}
                                        </span>
                                    </div>
                                );
                            })}
                            
                            {/* Inner Circle Lines */}
                            <div className="absolute inset-0 rounded-full border-4 border-white/5 pointer-events-none"></div>
                        </div>
                        
                        {/* Center Cap */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-slate-900 rounded-full shadow-lg border-2 border-purple-500/50 z-10 flex items-center justify-center">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                    
                    {/* Spin Button area */}
                    <div className="mt-10 text-center w-full z-20 space-y-4">
                        <div className="flex items-center justify-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                             <Sparkles className="w-3 h-3 text-yellow-400" />
                             <span>Spins Left: <span className="text-white text-base ml-1">{user?.spin_balance || 0}</span></span>
                        </div>

                        <Button 
                            onClick={handleSpin} 
                            disabled={!user || user.spin_balance <= 0 || spinning}
                            fullWidth
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 border-0 shadow-[0_0_30px_rgba(192,38,211,0.4)] py-4 text-lg font-black tracking-widest relative overflow-hidden group"
                        >
                            <span className="relative z-10">{spinning ? 'LUCKY DRAW...' : 'SPIN NOW'}</span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        </Button>
                    </div>

                    {/* Win Popup Overlay */}
                    {winAmount !== null && (
                        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 rounded-[2rem] animate-fade-in-up backdrop-blur-sm">
                            <div className="bg-slate-900 p-8 rounded-3xl text-center w-[90%] shadow-2xl border border-purple-500/30 relative overflow-hidden">
                                <div className="absolute inset-0 bg-purple-500/10 blur-3xl"></div>
                                <div className="relative z-10">
                                    <h4 className="text-2xl font-black text-white mb-2 tracking-tight">
                                        CONGRATULATIONS!
                                    </h4>
                                    
                                    <div className="my-6">
                                        <p className="text-purple-300 text-sm font-bold uppercase mb-1">You won Daily Income</p>
                                        <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500 drop-shadow-lg">
                                            ₹{winAmount}
                                        </p>
                                        <p className="text-slate-400 text-xs mt-2 font-medium">
                                            Paid daily for <b>11 Days!</b><br/>
                                            Go to Account & Claim now.
                                        </p>
                                    </div>

                                    <Button onClick={() => setWinAmount(null)} fullWidth variant="purple">
                                        Claim & Continue
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
