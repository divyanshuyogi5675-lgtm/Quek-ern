
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Investment } from '../../types';
import { Clock, CheckCircle, XCircle, Calendar, Zap, TrendingUp, AlertCircle } from 'lucide-react';

// Countdown Timer Component
const CountdownTimer = () => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const updateTimer = () => {
            const now = new Date();
            const midnight = new Date();
            midnight.setHours(24, 0, 0, 0); // Next Midnight
            const diff = midnight.getTime() - now.getTime();

            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / 1000 / 60) % 60);
            const seconds = Math.floor((diff / 1000) % 60);

            setTimeLeft(
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            );
        };

        const timerId = setInterval(updateTimer, 1000);
        updateTimer(); // initial call
        return () => clearInterval(timerId);
    }, []);

    return (
        <span className="font-mono text-emerald-600 font-bold">{timeLeft}</span>
    );
};

export const InvestView: React.FC = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<'active' | 'completed' | 'cancelled'>('active');

  const investments = (Object.values(user?.investments || {}) as Investment[]).sort((a, b) => b.startDate - a.startDate);
  
  const filteredInvestments = investments.filter((inv) => inv.status === tab);

  return (
    <div className="pb-24">
      <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-serif font-bold text-gray-900">My Portfolio</h2>
          <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
             <Zap className="w-3 h-3" fill="currentColor" /> {investments.filter(i => i.status === 'active').length} Active
          </div>
      </div>
      
      {/* Tabs */}
      <div className="flex p-1 bg-gray-100 rounded-xl mb-6">
        {['active', 'completed', 'cancelled'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t as any)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg capitalize transition-all ${
              tab === t 
                ? 'bg-white text-emerald-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-4">
        {filteredInvestments.length === 0 ? (
           <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-900 font-bold">No {tab} investments</p>
              <p className="text-gray-400 text-sm mt-1">Start investing to see your plans here.</p>
           </div>
        ) : (
          filteredInvestments.map((inv: Investment) => (
            <div key={inv.id} className="bg-white border border-gray-100 rounded-[1.5rem] p-5 shadow-sm relative overflow-hidden group">
               {/* Premium Decoration */}
               <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl -mr-8 -mt-8"></div>
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                 <div>
                    <h4 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                        {inv.planName}
                    </h4>
                    <p className="text-[10px] text-gray-400 font-mono mt-1">ID: {inv.id.slice(-8).toUpperCase()}</p>
                 </div>
                 <div className={`px-3 py-1 text-[10px] uppercase tracking-wider rounded-full font-bold border ${
                    inv.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                    inv.status === 'completed' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                    'bg-red-50 text-red-700 border-red-100'
                 }`}>
                    {inv.status}
                 </div>
              </div>

              {/* Countdown for Active Plans */}
              {inv.status === 'active' && (
                  <div className="bg-slate-900 rounded-xl p-3 mb-4 flex items-center justify-between shadow-md">
                      <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-emerald-400 animate-pulse" />
                          <span className="text-xs text-slate-300 font-medium">Next Payout In</span>
                      </div>
                      <CountdownTimer />
                  </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm mb-4 relative z-10">
                 <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1">Invested</p>
                    <p className="font-extrabold text-gray-900 text-lg">₹{inv.investedAmount}</p>
                 </div>
                 <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                    <p className="text-emerald-600 text-[10px] uppercase font-bold tracking-wider mb-1">Daily Profit</p>
                    <p className="font-extrabold text-emerald-700 text-lg">₹{inv.dailyIncome}</p>
                 </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-50 pt-3">
                 <div className="flex items-center gap-1.5">
                     <Calendar className="w-3.5 h-3.5" />
                     <span>Ends: {new Date(inv.endDate).toLocaleDateString()}</span>
                 </div>
                 <div className="flex items-center gap-1.5 font-bold text-emerald-600">
                     <TrendingUp className="w-3.5 h-3.5" />
                     <span>ROI: {((inv.totalIncome / inv.investedAmount) * 100).toFixed(0)}%</span>
                 </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
