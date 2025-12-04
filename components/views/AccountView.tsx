
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, LogOut, ChevronRight, Share2, MapPin, Globe, ShieldCheck, Copy, Wallet, UploadCloud, Download, LayoutDashboard, Camera, X, Timer, Gift, Trophy } from 'lucide-react';
import { Button } from '../ui/Button';
import { SpinWheelModal } from '../modals/GameModals';

interface AccountViewProps {
  onRecharge?: () => void;
  onWithdraw?: () => void;
  onAdminClick?: () => void;
}

const DEFAULT_AVATAR = "https://i.supaimg.com/5e1ad129-fdd4-43a2-9dd3-e687b9304eda.png";
const ADMIN_EMAIL = "divyanshuyogi265@gmail.com";

export const AccountView: React.FC<AccountViewProps> = ({ onRecharge, onWithdraw, onAdminClick }) => {
  const { user, logout, uploadProfilePicture, updateUserAddress, websiteUrl, claimRewardIncome } = useAuth();
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

  const getInviteLink = () => {
     let base = websiteUrl || window.location.origin;
     
     // Robust Fix: Ensure we only use the origin (https://site.com) and strip any paths (like /register)
     // This prevents 404 errors on static hosting platforms like Netlify
     try {
         const urlObj = new URL(base);
         base = urlObj.origin; 
     } catch (e) {
         // Fallback clean if URL parsing fails
         base = base.replace(/\/$/, "").replace(/\/register\/?$/, "");
     }
     
     // Use query parameter routing which is safe for static hosting
     return `${base}/?view=register&ref=${user?.inviteCode || ''}`;
  };

  const handleCopyCode = () => {
    if (user?.inviteCode) {
        navigator.clipboard.writeText(user.inviteCode);
        alert('Invite code copied!');
    }
  };
  
  const handleCopyLink = () => {
      const link = getInviteLink();
      navigator.clipboard.writeText(link);
      alert('Referral link copied!');
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

      {/* --- 👑 VIP DAILY INCOME CARD --- */}
      {user?.rewardDailyRate && user.rewardDailyRate > 0 && (
          <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-2xl p-5 mb-6 text-white shadow-xl shadow-purple-900/20 border border-purple-500/30 relative overflow-hidden animate-fade-in-up">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl -mr-10 -mt-10 animate-pulse"></div>
              
              <div className="flex justify-between items-center relative z-10">
                  <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20">
                          <Gift className="w-6 h-6 text-yellow-300 animate-bounce" />
                      </div>
                      <div>
                          <p className="text-[10px] text-purple-200 font-bold uppercase tracking-wider mb-0.5">VIP Daily Income</p>
                          <h3 className="text-2xl font-black">₹{user.rewardDailyRate} <span className="text-xs font-normal text-purple-300">/ day</span></h3>
                      </div>
                  </div>

                  <div className="text-right">
                      <div className="flex items-center justify-end gap-1 text-[10px] font-mono text-purple-200 mb-2 bg-black/20 px-2 py-1 rounded-lg">
                          <Timer className="w-3 h-3" />
                          <span>{timeLeft}</span>
                      </div>
                      <Button 
                        onClick={handleClaimReward} 
                        disabled={timeLeft !== 'Ready to Claim' || claimLoading}
                        className={`py-2 px-4 text-xs h-auto shadow-lg shadow-purple-900/40 ${timeLeft === 'Ready to Claim' ? 'bg-yellow-400 hover:bg-yellow-500 text-black border-yellow-300' : 'bg-white/10 text-white cursor-not-allowed border-transparent'}`}
                      >
                          {claimLoading ? 'Processing...' : 'Claim Now'}
                      </Button>
                  </div>
              </div>
          </div>
      )}

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
              <MenuItem icon={Share2} label="Invite Friends" onClick={() => setShowInvite(true)} subLabel="Win ₹50" />
              <MenuItem icon={Globe} label="Language" subLabel="English" onClick={() => {}} /> 
              <MenuItem icon={ShieldCheck} label="Privacy Policy" onClick={() => {}} />
          </div>
          
          <button onClick={logout} className="w-full bg-white text-red-600 p-4 rounded-2xl border border-red-50 flex items-center justify-center gap-2 font-bold hover:bg-red-50 transition-colors">
              <LogOut className="w-5 h-5" /> Logout
          </button>
      </div>

      {/* Version Info */}
      <div className="text-center mt-8 text-gray-400 text-xs">
          <p>App Version 2.4.2</p>
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

      {/* Invite Modal (HINDI & Spin Model) */}
      {showInvite && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up">
              <div className="bg-white rounded-3xl w-full max-w-sm p-0 overflow-hidden relative shadow-2xl">
                  {/* Header Section */}
                  <div className="bg-[#5e35b1] p-6 text-center relative">
                       <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
                           <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-10 -mb-10 blur-xl"></div>
                       </div>
                       <button onClick={() => setShowInvite(false)} className="absolute top-4 right-4 text-white/70 hover:text-white z-20"><X className="w-6 h-6"/></button>
                       
                       <div className="relative z-10 flex flex-col items-center">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3 border border-white/30 backdrop-blur-sm shadow-lg">
                                <Share2 className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-black text-white leading-tight">दोस्तों को Invite करें <br/>और ₹50 तक जीतें!</h3>
                       </div>
                  </div>
                  
                  <div className="p-6">
                      
                      {/* Spin Button Card */}
                      <div className="bg-gradient-to-r from-purple-100 to-pink-50 p-4 rounded-2xl mb-6 border border-purple-100 shadow-inner flex items-center justify-between">
                         <div>
                             <p className="text-xs font-bold text-purple-700 uppercase">Available Spins</p>
                             <p className="text-2xl font-black text-purple-900">{user?.spin_balance || 0}</p>
                         </div>
                         <Button onClick={() => setShowSpin(true)} className="bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-300">
                             <Trophy className="w-4 h-4 mr-1"/> Play Lucky Spin
                         </Button>
                      </div>

                      {/* Steps Visualization */}
                      <div className="space-y-4 mb-6">
                          <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-600 text-sm">1</div>
                              <p className="text-sm font-medium text-gray-700">अपना लिंक दोस्तों को शेयर करें।</p>
                          </div>
                          <div className="h-4 border-l-2 border-dashed border-gray-200 ml-4"></div>
                          <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-sm">2</div>
                              <p className="text-sm font-medium text-gray-700">दोस्त रजिस्टर करके अपना <b className="text-blue-600">पहला रिचार्ज</b> करेगा।</p>
                          </div>
                          <div className="h-4 border-l-2 border-dashed border-gray-200 ml-4"></div>
                          <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-600 text-sm">3</div>
                              <p className="text-sm font-medium text-gray-700">आपको <b className="text-green-600">Lucky Spin</b> मिलेगा जिसमे आप <b className="text-green-600">₹50</b> तक जीत सकते हैं!</p>
                          </div>
                      </div>

                      {/* Referral Code Box */}
                      <div className="bg-gray-50 rounded-xl p-3 mb-4 border border-dashed border-gray-300 flex justify-between items-center">
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase font-bold">Your Referral Code</p>
                            <span className="text-xl font-mono font-bold text-gray-800 tracking-wider">{user?.inviteCode}</span>
                          </div>
                          <button onClick={handleCopyCode} className="p-2 hover:bg-gray-200 rounded-lg text-emerald-600 transition-colors"><Copy className="w-5 h-5"/></button>
                      </div>

                      <div className="space-y-3">
                          <Button onClick={handleCopyLink} fullWidth className="bg-[#5e35b1] hover:bg-[#4527a0] text-lg font-bold shadow-lg shadow-purple-200">लिंक कॉपी करें</Button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* SPIN MODAL COMPONENT */}
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
