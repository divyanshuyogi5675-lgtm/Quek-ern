
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { PRODUCTS } from '../../data/products';
import { Button } from '../ui/Button';
import { TrendingUp, Download, UploadCloud, Crown, Bell, Volume2, AlertOctagon, Lock, Trophy } from 'lucide-react';
import { Product, Investment } from '../../types';
import { DailyBonusModal, TeamModal, SpinWheelModal } from '../modals/GameModals';
import { ProductModal } from '../modals/ProductModal';

interface HomeViewProps {
  onRecharge: () => void;
  onWithdraw: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onRecharge, onWithdraw }) => {
  const { user, supportSettings } = useAuth();
  
  // Game Modals State
  const [showBonus, setShowBonus] = useState(false);
  const [showTeam, setShowTeam] = useState(false);
  const [showSpin, setShowSpin] = useState(false);
  
  // Invest Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Fake Withdrawals Data for Ticker
  const withdrawals = [
      "Amit K. withdrew ₹500", "Rahul S. withdrew ₹1200", "Priya M. withdrew ₹5000",
      "Vikram J. withdrew ₹800", "Sneha R. withdrew ₹2500", "Karan D. withdrew ₹10000"
  ];

  const handleBuyClick = (product: Product, isRestricted: boolean) => {
      if (isRestricted) return; // Block click
      setSelectedProduct(product);
  };

  const openTelegram = () => {
      window.open(supportSettings.telegram, '_blank');
  };

  const getVipLevel = () => {
      const bal = user?.balance || 0;
      if (bal > 50000) return "VIP 3";
      if (bal > 10000) return "VIP 2";
      if (bal > 1000) return "VIP 1";
      return "MEMBER";
  };

  // Format WhatsApp Link
  const waLink = `https://wa.me/${supportSettings.whatsapp.replace(/\D/g, '')}`;

  return (
    <div className="space-y-6 pb-24 bg-[#F8F9FA] min-h-screen relative animate-fade-in-up">
      
      {/* 1. Glassmorphism Balance Card - Fixed Top Spacing (-mt-2) */}
      <div className="-mt-2 relative w-full h-auto bg-gray-900 rounded-[2rem] p-6 text-white shadow-2xl overflow-hidden group transition-all">
        
        {/* Background Video */}
        <div className="absolute inset-0 z-0 overflow-hidden">
             <video 
                autoPlay 
                loop 
                muted 
                playsInline
                className="w-full h-full object-cover opacity-40 blur-[2px] scale-110"
             >
                 {/* High quality abstract finance loop */}
                 <source src="https://cdn.pixabay.com/video/2022/11/23/140117-774656461_large.mp4" type="video/mp4" />
             </video>
             {/* Gradient Overlay to ensure text readability */}
             <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/80 via-gray-900/60 to-gray-900/90 mix-blend-multiply"></div>
        </div>
        
        {/* Shine Animation Layer */}
        <div className="absolute inset-0 z-0 pointer-events-none">
             <div className="absolute top-0 left-[-100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-25deg] animate-shine"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                 <p className="text-gray-300 text-[10px] font-bold tracking-[0.2em] uppercase">Total Balance</p>
                 <span className="bg-gradient-to-r from-yellow-300 to-yellow-500 text-black text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg shadow-yellow-500/20">
                    <Crown className="w-3 h-3" fill="black" /> {getVipLevel()}
                 </span>
              </div>
              <h2 className="text-5xl font-black tracking-tight drop-shadow-md bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-300">₹{user?.balance || 0}</h2>
            </div>
            <div className="text-right">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg text-xs font-mono tracking-widest text-gray-300 shadow-inner">
                ID: {user?.inviteCode || '----'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-white/5 rounded-2xl p-3 backdrop-blur-sm border border-white/5 flex items-center gap-3 transition-colors hover:bg-white/10">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                  <TrendingUp className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Today</p>
                  <p className="text-lg font-bold text-emerald-300">₹{user?.todayEarning || 0}</p>
              </div>
            </div>
            <div className="bg-white/5 rounded-2xl p-3 backdrop-blur-sm border border-white/5 flex items-center gap-3 transition-colors hover:bg-white/10">
              <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500/30">
                  <Trophy className="w-5 h-5 text-yellow-300" />
              </div>
              <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Total</p>
                  <p className="text-lg font-bold text-yellow-300">₹{user?.totalEarning || 0}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={onWithdraw} className="flex-1 bg-white text-gray-900 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-100 transition-all shadow-lg shadow-white/10 active:scale-95">
              <Download className="w-4 h-4" strokeWidth={3} /> Withdraw
            </button>
            <button onClick={onRecharge} className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:from-emerald-500 hover:to-emerald-400 transition-all shadow-lg shadow-emerald-900/40 border border-emerald-400/20 active:scale-95">
              <UploadCloud className="w-4 h-4" strokeWidth={3} /> Recharge
            </button>
          </div>
        </div>
      </div>

      {/* ANNOUNCEMENT & TICKERS */}
      <div className="space-y-3">
        {/* Marquee */}
        <div className="bg-gradient-to-r from-orange-50 to-white border border-orange-100 rounded-lg text-orange-900 text-xs py-2.5 px-3 flex items-center gap-3 overflow-hidden shadow-sm">
            <Volume2 className="w-4 h-4 text-orange-600 flex-shrink-0 animate-pulse" />
            <div className="flex-1 overflow-hidden relative h-4">
               <div className="animate-marquee whitespace-nowrap absolute font-medium">
                   Welcome to Flipkart Invest! 🚀 New "Diamond VIP" plan launched with 200% returns. Withdrawals are active 24/7. Invite friends to earn huge commissions!
               </div>
           </div>
        </div>

        {/* Live Withdrawal Ticker */}
        <div className="bg-slate-900 text-white text-xs py-2.5 px-4 rounded-full flex items-center gap-3 overflow-hidden shadow-lg border border-slate-700">
           <Bell className="w-3 h-3 text-yellow-400 animate-swing" />
           <div className="flex-1 overflow-hidden relative h-4">
               <div className="animate-marquee whitespace-nowrap absolute">
                   {withdrawals.map((w, i) => (
                       <span key={i} className="inline-block mr-8 font-medium text-slate-300">
                          <span className="text-emerald-400 text-[10px]">●</span> {w}
                       </span>
                   ))}
               </div>
           </div>
        </div>
      </div>

      {/* 3. Quick Actions Grid - UPDATED WITH SPIN BUTTON */}
      <div className="grid grid-cols-4 gap-3">
          {[
              { label: 'Lucky Spin', img: 'https://cdn-icons-png.flaticon.com/512/3658/3658959.png', action: () => setShowSpin(true), highlight: true },
              { label: 'Bonus', img: 'https://i.supaimg.com/8d59dc3d-98f0-4a17-b2d6-11b2af73293c.png', action: () => setShowBonus(true) },
              { label: 'My Team', img: 'https://i.supaimg.com/433481a9-67f6-4067-8d0f-6888e2e3c8a6.png', action: () => setShowTeam(true) },
              { label: 'Telegram', img: 'https://i.supaimg.com/3ead3f9d-3681-4c76-928d-62a0f4fb01c7.png', action: openTelegram }
          ].map((item, idx) => (
             <button key={idx} onClick={item.action} className={`flex flex-col items-center gap-2 p-2 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] border active:scale-95 transition-all hover:shadow-md hover:-translate-y-1 ${item.highlight ? 'bg-gradient-to-b from-purple-50 to-white border-purple-200' : 'bg-white border-gray-100'}`}>
                <div className="w-10 h-10 flex items-center justify-center relative">
                    <img src={item.img} alt={item.label} className="w-full h-full object-contain drop-shadow-sm" />
                </div>
                <span className={`text-[10px] font-bold whitespace-nowrap tracking-tight ${item.highlight ? 'text-purple-700' : 'text-gray-600'}`}>{item.label}</span>
            </button>
          ))}
      </div>

      {/* 4. Promotional Banner */}
      <div className="relative w-full h-36 rounded-2xl overflow-hidden shadow-lg shadow-gray-200 group cursor-pointer transition-transform hover:scale-[1.02]">
          <img src="https://picsum.photos/seed/finance/800/300" className="w-full h-full object-cover" alt="Promo" />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/40 to-transparent flex flex-col justify-center px-6">
              <span className="bg-yellow-400 text-black text-[9px] font-black px-2 py-1 rounded w-fit mb-2 animate-pulse uppercase tracking-wider">Limited Offer</span>
              <h3 className="text-white font-bold text-xl leading-tight drop-shadow-lg">Double Your <br/>First Deposit</h3>
              <p className="text-gray-200 text-xs mt-2 font-medium">Terms apply. Valid till Sunday.</p>
          </div>
      </div>

      {/* Products Section */}
      <div>
        <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-xl font-black text-slate-800 flex items-center tracking-tight gap-2">
                <div className="bg-slate-100 p-1.5 rounded-lg border border-slate-200">
                    <TrendingUp className="w-5 h-5 text-slate-700" />
                </div>
                Advance Plans
            </h3>
            <span className="text-[10px] font-black text-white bg-gradient-to-r from-emerald-500 to-emerald-600 px-3 py-1.5 rounded-full uppercase tracking-wide shadow-md shadow-emerald-500/20">
                High Return 🔥
            </span>
        </div>
        
        {/* COMPACT PRODUCT LIST */}
        <div className="grid grid-cols-1 gap-4">
          {PRODUCTS.map((product) => {
            // CHECK RESTRICTION (Price 299 or 499)
            const isRestricted = 
                (product.price === 299 || product.price === 499) && 
                (Object.values(user?.investments || {}) as Investment[]).some(
                    inv => inv.productId === product.id && inv.status === 'active'
                );

            return (
                <div 
                    key={product.id} 
                    className={`bg-white rounded-2xl p-3 border border-gray-100 shadow-[0_2px_15px_rgba(0,0,0,0.03)] transition-all flex items-center gap-4 cursor-pointer group ${isRestricted ? 'opacity-80 grayscale-[0.5]' : 'hover:shadow-[0_8px_25px_rgba(0,0,0,0.06)]'}`}
                    onClick={() => handleBuyClick(product, !!isRestricted)}
                >
                    {/* Left: Product Image */}
                    <div className="w-24 h-24 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden relative shadow-inner">
                         <img 
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            loading="lazy"
                         />
                         <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] font-bold text-center py-0.5">
                            {product.duration} Days
                         </div>
                    </div>

                    {/* Right: Details */}
                    <div className="flex-1 flex flex-col justify-between h-full">
                        <div className="mb-2">
                            <h4 className="font-bold text-gray-900 leading-tight mb-1 group-hover:text-emerald-700 transition-colors line-clamp-2">{product.name}</h4>
                            <div className="flex items-center gap-2 text-xs">
                                 <span className="text-gray-400 font-medium">Price:</span>
                                 <span className="font-bold text-slate-800">₹{product.price}</span>
                            </div>
                        </div>
                        
                        <div className="flex items-end justify-between">
                             <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Daily Income</p>
                                <p className="text-lg font-extrabold text-emerald-600">₹{product.dailyIncome}</p>
                             </div>
                             
                             {/* DYNAMIC BUTTON */}
                             {isRestricted ? (
                                 <Button 
                                    disabled
                                    className="bg-gray-200 text-gray-500 text-[9px] font-bold py-2 px-3 rounded-lg shadow-none uppercase tracking-widest cursor-not-allowed flex items-center gap-1"
                                 >
                                    <AlertOctagon className="w-3 h-3" /> Limit Reached
                                 </Button>
                             ) : (
                                 <Button 
                                    className="bg-slate-900 hover:bg-emerald-600 text-white text-[10px] font-bold py-2 px-4 rounded-lg shadow-lg shadow-slate-900/20 uppercase tracking-widest transition-all active:scale-95"
                                 >
                                    Invest
                                 </Button>
                             )}
                        </div>
                    </div>
                </div>
            );
          })}
        </div>
      </div>

      {/* FOOTER - TRUST LOGOS */}
      <div className="mt-8 border-t border-gray-200 pt-8 px-4 text-center">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-6">Trusted By Millions</h4>
        
        {/* Payment Partners */}
        <div className="flex flex-wrap justify-center gap-3 mb-6 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {['VISA', 'UPI', 'RuPay', 'Paytm', 'PhonePe'].map(brand => (
                <div key={brand} className="h-8 bg-gray-200/50 border border-gray-200 rounded w-14 flex items-center justify-center text-[10px] font-bold text-gray-500">{brand}</div>
            ))}
        </div>

        {/* Security Badge */}
        <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-full shadow-sm">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-xs font-bold text-emerald-700">256-Bit SSL Secured</span>
            </div>
            <p className="text-[10px] text-gray-400 max-w-xs mt-1 leading-relaxed">
                Flipkart Invest is a registered financial entity. <br/>All investments are subject to market risk.
            </p>
        </div>
      </div>
      
      {/* Game Modals */}
      <DailyBonusModal isOpen={showBonus} onClose={() => setShowBonus(false)} />
      <TeamModal isOpen={showTeam} onClose={() => setShowTeam(false)} />
      <SpinWheelModal isOpen={showSpin} onClose={() => setShowSpin(false)} />
      
      {/* Investment Confirmation Modal */}
      <ProductModal 
        product={selectedProduct} 
        isOpen={!!selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
      />

      {/* --- FLOATING WHATSAPP BUTTON (MOVED TO BOTTOM FOR SPACING) --- */}
      <a 
        href={waLink}
        target="_blank" 
        rel="noreferrer"
        className="fixed bottom-20 right-4 z-40 transition-all hover:scale-110 active:scale-95 flex items-center justify-center animate-bounce-slow"
      >
          <img 
            src="https://i.supaimg.com/6bf5738d-e91a-434f-a390-61e4860958f5.png" 
            alt="WhatsApp Support" 
            className="w-14 h-14 drop-shadow-xl"
          />
      </a>

      {/* Global Animations Style Block */}
      <style>{`
        @keyframes shine {
            100% { left: 125%; }
        }
        .animate-shine {
            animation: shine 1.5s;
        }
        @keyframes marquee {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
        }
        .animate-marquee {
            animation: marquee 25s linear infinite;
        }
        .animate-swing {
            animation: swing 2s ease-in-out infinite;
        }
        .animate-bounce-slow {
             animation: bounce 3s infinite;
        }
      `}</style>
    </div>
  );
};
