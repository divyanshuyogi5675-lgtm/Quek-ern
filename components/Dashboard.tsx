import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Home, PieChart, User, Headphones } from 'lucide-react';
import { HomeView } from './views/HomeView';
import { InvestView } from './views/InvestView';
import { AccountView } from './views/AccountView';
import { SupportView } from './views/SupportView';
import { AdminView } from './views/AdminView';
import { MoneyModal } from './modals/MoneyModals';

type ViewType = 'home' | 'invest' | 'account' | 'support' | 'admin';

// Default Avatar URL provided
const DEFAULT_AVATAR = "https://i.supaimg.com/5e1ad129-fdd4-43a2-9dd3-e687b9304eda.png";

export const Dashboard: React.FC = () => {
  const { user, requestRecharge, requestWithdraw } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [showRecharge, setShowRecharge] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  const renderView = () => {
    switch(currentView) {
        case 'home': return <HomeView onRecharge={() => setShowRecharge(true)} onWithdraw={() => setShowWithdraw(true)} />;
        case 'invest': return <InvestView />;
        case 'account': return <AccountView onRecharge={() => setShowRecharge(true)} onWithdraw={() => setShowWithdraw(true)} onAdminClick={() => setCurrentView('admin')} />;
        case 'support': return <SupportView />;
        case 'admin': return <AdminView />;
        default: return <HomeView onRecharge={() => setShowRecharge(true)} onWithdraw={() => setShowWithdraw(true)} />;
    }
  };

  const NavItem = ({ view, icon: Icon, label }: { view: ViewType, icon: any, label: string }) => {
      // Admin view keeps 'Account' tab active
      const isActive = currentView === view || (view === 'account' && currentView === 'admin');
      
      return (
        <button 
            onClick={() => setCurrentView(view)}
            className="group relative flex flex-col items-center justify-center w-full h-full transition-transform duration-300 active:scale-90"
        >
            {/* Active Glow Background (Subtle) */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-emerald-400/10 blur-xl transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`}></div>

            {/* Icon Container with pop effect */}
            <div className={`relative z-10 transition-all duration-500 ease-out ${isActive ? '-translate-y-1' : 'translate-y-1'}`}>
                <Icon 
                    className={`w-6 h-6 transition-all duration-300 ${
                        isActive 
                        ? 'text-emerald-600 fill-emerald-600/20 stroke-[2.5px] drop-shadow-sm scale-110' 
                        : 'text-slate-400 stroke-[1.5px] group-hover:text-slate-600'
                    }`} 
                />
            </div>

            {/* Label - Slides up and fades in */}
            <span className={`absolute bottom-3 text-[10px] font-bold tracking-wide transition-all duration-500 ${
                isActive 
                ? 'text-emerald-700 opacity-100 translate-y-0' 
                : 'text-slate-400 opacity-0 translate-y-2'
            }`}>
                {label}
            </span>

            {/* Glowing Active Dot Indicator - Centered below label */}
            <div className={`absolute bottom-1 w-8 h-1 bg-emerald-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,1)] transition-all duration-500 ${
                isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
            }`}></div>
        </button>
      );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-lg bg-gray-50 min-h-screen relative shadow-2xl">
        
        {/* Top Header (Mobile App Style) */}
        <div className="bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm/50 backdrop-blur-md bg-white/90">
            {currentView === 'admin' ? (
                <h1 className="font-serif text-xl font-bold text-emerald-900 tracking-tight">System Admin</h1>
            ) : (
                <img 
                   src="https://i.supaimg.com/561279ed-81a8-46f7-b250-30c7844aec75.png" 
                   alt="Flipkart Invest" 
                   className="h-12 w-auto object-contain"
                />
            )}
            <div className="w-10 h-10 rounded-full border-2 border-white shadow-md overflow-hidden bg-gray-50 ring-2 ring-emerald-50">
                <img 
                    src={user?.avatar || DEFAULT_AVATAR} 
                    className="w-full h-full object-cover" 
                    alt="profile" 
                />
            </div>
        </div>

        {/* Main Scrollable Content */}
        <main className="p-4 sm:p-6 overflow-y-auto pb-32 no-scrollbar">
            {renderView()}
        </main>

        {/* Fixed Bottom Dock Navigation */}
        <div className="fixed bottom-0 left-0 right-0 z-30 flex justify-center pointer-events-none">
            {/* Constrain width to app container max-width */}
            <div className="w-full max-w-lg pointer-events-auto">
                <nav className="bg-white/90 backdrop-blur-xl border-t border-white/60 rounded-t-[2rem] shadow-[0_-8px_30px_rgba(0,0,0,0.08)] flex justify-around items-center h-[5.5rem] pb-2 px-2 relative ring-1 ring-black/5">
                    <NavItem view="home" icon={Home} label="Home" />
                    <NavItem view="invest" icon={PieChart} label="Invest" />
                    <NavItem view="account" icon={User} label="Account" />
                    <NavItem view="support" icon={Headphones} label="Support" />
                </nav>
            </div>
        </div>

        {/* Modals */}
        <MoneyModal 
            isOpen={showRecharge} 
            onClose={() => setShowRecharge(false)} 
            type="recharge"
            onSubmit={requestRecharge}
        />
        
        <MoneyModal 
            isOpen={showWithdraw} 
            onClose={() => setShowWithdraw(false)} 
            type="withdraw"
            currentBalance={user?.balance || 0}
            onSubmit={async () => {}}
        />

      </div>
      
      {/* Global Styles for Scrollbar Hiding if needed */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};