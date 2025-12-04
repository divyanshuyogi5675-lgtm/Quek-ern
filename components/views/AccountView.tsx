
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, LogOut, ChevronRight, Share2, MapPin, Globe, ShieldCheck, Copy, Wallet, UploadCloud, Download, LayoutDashboard, Camera, X, Timer, Gift, Trophy, Sparkles, Zap } from 'lucide-react';
import { Button } from '../ui/Button';
import { SpinWheelModal } from '../modals/GameModals';
import { InviteModal } from '../modals/InviteModal';

interface AccountViewProps {
  onRecharge?: () => void;
  onWithdraw?: () => void;
  onAdminClick?: () => void;
}

const DEFAULT_AVATAR = "https://i.supaimg.com/5e1ad129-fdd4-43a2-9dd3-e687b9304eda.png";
const ADMIN_EMAIL = "divyanshuyogi265@gmail.com";

export const AccountView: React.FC<AccountViewProps> = ({ onRecharge, onWithdraw, onAdminClick }) => {
  const { user, logout, uploadProfilePicture, updateUserAddress, claimRewardIncome } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Modal States
  const [showAddress, setShowAddress] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showSpin, setShowSpin] = useState(false);
  const [addressInput, setAddressInput] = useState(user?.address || '');

  // Claim State
  const [claimLoading, setClaimLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  // Update Countdown Timer for Daily Claim
  useEffect(() => {
    const updateTimer = () => {
        if (!user?.rewardEndDate || user.rewardEndDate < Date.now()) {
            setTimeLeft('Expired');
            return;
        }

        const lastClaim = user.lastRewardClaim || 0;
        const nextClaim = lastClaim + (24 * 60 * 60 * 1000);
        const now = Date.now();

        if (now >= nextClaim) {
            setTimeLeft('Ready to Claim');
        } else {
            const diff = nextClaim - now;
            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff / (1000 * 60)) % 60);
            const s = Math.floor((diff / 1000) % 60);
            setTimeLeft(`${h}h ${m}m ${s}s`);
        }
    };

    const timer = setInterval(updateTimer, 1000);
    updateTimer();
    return () => clearInterval(timer);
  }, [user?.lastRewardClaim, user?.rewardEndDate]);

  const handleClaimReward = async () => {
      setClaimLoading(true);
      try {
          const res = await claimRewardIncome();
          if (res === "Success") alert("Reward Claimed Successfully!");
          else alert(res);
      } catch (e) {
          alert("Error claiming reward");
      } finally {
          setClaimLoading(false);
      }
  };

  const handleSaveAddress = async () => {
      await updateUserAddress(addressInput);
      setShowAddress(false);
      alert("Address saved successfully!");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        try {
            await uploadProfilePicture(e.target.files[0]);
        } catch (error) {
            alert("Failed to upload image");
        }
    }
  };

  const triggerFileInput = () => {
      fileInputRef.current?.click();
  };

  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  return (
    <div className="pb-24 animate-fade-in-up">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-10 -mt-10 blur-2xl"></div>
          
          <div className="flex items-center gap-4 relative z-10">
              <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-emerald-50 shadow-md overflow-hidden bg-gray-100">
                      <img src={user?.avatar || DEFAULT_AVATAR} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  <button 
                    onClick={triggerFileInput}
                    className="absolute bottom-0 right-0 bg-emerald-600 text-white p-1.5 rounded-full border-2 border-white shadow-sm hover:bg-emerald-700 transition-colors"
                  >
                      <Camera className="w-3 h-3" />
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              </div>
              <div>
                  <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
                  <p className="text-sm text-gray-500 font-medium mb-1">{user?.phoneNumber || user?.email}</p>
                  <div className="flex items-center gap-2">
                      <span className="bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                          Member
                      </span>
                      {isAdmin && (
                          <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                              Admin
                          </span>
                      )}
                  </div>
              </div>
          </div>

          <div className="mt-6 flex gap-3">
              <button onClick={onRecharge} className="flex-1 bg-emerald-600 text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2">
                  <UploadCloud className="w-4 h-4" /> Recharge
              </button>
              <button onClick={onWithdraw} className="flex-1 bg-white text-gray-900 border border-gray-200 py-3 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 transition-all active:scale-95 flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" /> Withdraw
              </button>
          </div>
      </div>

      {/* --- SPIN & EARN CARD (NEW) --- */}
      <div className="bg-[#1e1b4b] rounded-3xl p-6 mb-6 relative overflow-hidden shadow-xl shadow-indigo-900/30 border border-indigo-500/30">
          <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl -mr-12 -mt-12"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-600/20 rounded-full blur-3xl -ml-10 -mb-10"></div>
          
          <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                  <div>
                      <h3 className="text-white text-xl font-black italic tracking-wide">LUCKY SPIN</h3>
                      <p className="text-indigo-200 text-xs font-medium">Win Daily Income up to ₹100</p>
                  </div>
                  <div className="bg-indigo-500/30 backdrop-blur-sm border border-indigo-400/30 rounded-lg px-3 py-1 text-center">
                      <p className="text-[10px] text-indigo-200 uppercase font-bold">Spins Left</p>
                      <p className="text-xl font-black text-white">{user?.spin_balance || 0}</p>
                  </div>
              </div>

              <div className="flex gap-3 items-center">
                   <div className="flex-1 bg-white/5 rounded-xl p-3 border border-white/10">
                       <Gift className="w-6 h-6 text-yellow-400 mb-1" />
                       <p className="text-white text-xs font-bold">Guaranteed</p>
                       <p className="text-indigo-200 text-[10px]">Prizes</p>
                   </div>
                   <button 
                      onClick={() => setShowSpin(true)}
                      className="flex-[2] bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-4 rounded-xl font-black text-sm uppercase tracking-wider shadow-lg shadow-purple-900/40 active:scale-95 transition-all flex items-center justify-center gap-2 group"
                    >
                       <Sparkles className="w-4 h-4 text-yellow-200 animate-pulse" /> Play Now
                   </button>
              </div>

              {/* HINDI INSTRUCTIONS */}
              <div className="mt-5 pt-4 border-t border-white/10">
                   <p className="text-indigo-300 text-[10px] font-bold uppercase tracking-widest mb-3">How it works (कैसे काम करता है):</p>
                   <div className="space-y-2.5">
                       <div className="flex items-start gap-3">
                           <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-300 mt-0.5 border border-indigo-500/30">1</div>
                           <p className="text-xs text-gray-300">
                               <span className="text-white font-bold">Invite Friends:</span> अपने दोस्तों को लिंक शेयर करें।
                           </p>
                       </div>
                       <div className="flex items-start gap-3">
                           <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-300 mt-0.5 border border-indigo-500/30">2</div>
                           <p className="text-xs text-gray-300">
                               <span className="text-white font-bold">1st Recharge = 1 Spin:</span> जब दोस्त पहला रिचार्ज करेगा, आपको Spin मिलेगा।
                           </p>
                       </div>
                       <div className="flex items-start gap-3">
                           <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-300 mt-0.5 border border-indigo-500/30">3</div>
                           <p className="text-xs text-gray-300">
                               <span className="text-white font-bold">Win Daily Income:</span> Spin में जीती राशि (e.g. ₹50) आपको <span className="text-yellow-400 font-bold">11 दिनों तक रोज</span> मिलेगी।
                           </p>
                       </div>
                   </div>
              </div>
          </div>
      </div>

      {/* --- 👑 VIP DAILY INCOME CARD --- */}
      <div className="bg-gradient-to-r from-gray-900 to-slate-800 rounded-2xl p-5 mb-6 text-white shadow-xl border border-slate-700/50 relative overflow-hidden animate-fade-in-up">
          <div className="flex justify-between items-center relative z-10">
              <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center backdrop-blur-md border border-emerald-500/30">
                      <Zap className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                      <p className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider mb-0.5">Your Daily Income</p>
                      {user?.rewardDailyRate && user.rewardDailyRate > 0 ? (
                         <h3 className="text-2xl font-black">₹{user.rewardDailyRate} <span className="text-xs font-normal text-slate-400">/ day</span></h3>
                      ) : (
                         <h3 className="text-xl font-bold text-gray-400">Not Active</h3>
                      )}
                  </div>
              </div>

              <div className="text-right">
                  {user?.rewardDailyRate && user.rewardDailyRate > 0 ? (
                      <>
                        <div className="flex items-center justify-end gap-1 text-[10px] font-mono text-slate-300 mb-2 bg-black/30 px-2 py-1 rounded-lg">
                            <Timer className="w-3 h-3" />
                            <span>{timeLeft}</span>
                        </div>
                        <Button 
                            onClick={handleClaimReward} 
                            disabled={timeLeft !== 'Ready to Claim' || claimLoading}
                            className={`py-2 px-4 text-xs h-auto shadow-lg ${timeLeft === 'Ready to Claim' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-gray-700 text-gray-400 cursor-not-allowed border-transparent'}`}
                        >
                            {claimLoading ? 'Processing...' : 'Claim Now'}
                        </Button>
                      </>
                  ) : (
                      <div className="bg-white/5 px-3 py-2 rounded-lg text-center">
                          <p className="text-[10px] text-gray-400">Start inviting to earn</p>
                          <p className="text-xs font-bold text-emerald-400">Spin & Win</p>
                      </div>
                  )}
              </div>
          </div>
      </div>

      {/* Menu Options */}
      <div className="space-y-3">
          {isAdmin && (
              <button onClick={onAdminClick} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-2xl flex items-center justify-between shadow-lg shadow-purple-200 hover:shadow-xl transition-all active:scale-95 group">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                          <LayoutDashboard className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-bold">Admin Dashboard</span>
                  </div>
                  <ChevronRight className="w-5 h-5 opacity-70 group-hover:translate-x-1 transition-transform" />
              </button>
          )}

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <MenuItem icon={MapPin} label="My Address" onClick={() => setShowAddress(true)} />
              <MenuItem icon={Share2} label="Invite Friends" onClick={() => setShowInvite(true)} subLabel="Win Spin" />
              <MenuItem icon={Globe} label="Language" subLabel="English" onClick={() => {}} /> 
              <MenuItem icon={ShieldCheck} label="Privacy Policy" onClick={() => {}} />
          </div>
          
          <button onClick={logout} className="w-full bg-white text-red-600 p-4 rounded-2xl border border-red-50 flex items-center justify-center gap-2 font-bold hover:bg-red-50 transition-colors">
              <LogOut className="w-5 h-5" /> Logout
          </button>
      </div>

      {/* Version Info */}
      <div className="text-center mt-8 text-gray-400 text-xs">
          <p>App Version 2.5.0</p>
          <p>Secure Connection</p>
      </div>

      {/* Address Modal */}
      {showAddress && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up">
              <div className="bg-white rounded-2xl w-full max-w-sm p-6 relative">
                  <button onClick={() => setShowAddress(false)} className="absolute top-4 right-4 text-gray-400"><X className="w-5 h-5"/></button>
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><MapPin className="text-emerald-600"/> Update Address</h3>
                  <textarea 
                      className="w-full border rounded-xl p-3 h-32 focus:ring-2 focus:ring-emerald-500 outline-none mb-4 resize-none"
                      placeholder="Enter your full delivery address..."
                      value={addressInput}
                      onChange={(e) => setAddressInput(e.target.value)}
                  />
                  <Button onClick={handleSaveAddress} fullWidth>Save Address</Button>
              </div>
          </div>
      )}

      {/* MODALS */}
      <InviteModal isOpen={showInvite} onClose={() => setShowInvite(false)} />
      <SpinWheelModal isOpen={showSpin} onClose={() => setShowSpin(false)} />

    </div>
  );
};

const MenuItem = ({ icon: Icon, label, onClick, subLabel }: any) => (
    <button onClick={onClick} className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 group">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                <Icon className="w-4 h-4 text-gray-500 group-hover:text-emerald-600" />
            </div>
            <span className="font-medium text-gray-700 group-hover:text-gray-900">{label}</span>
        </div>
        <div className="flex items-center gap-2">
            {subLabel && <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{subLabel}</span>}
            <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
    </button>
);
