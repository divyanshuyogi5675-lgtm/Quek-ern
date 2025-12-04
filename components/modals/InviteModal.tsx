
import React, { useState } from 'react';
import { X, Share2, Copy, Trophy, Link as LinkIcon, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InviteModal: React.FC<InviteModalProps> = ({ isOpen, onClose }) => {
  const { user, websiteUrl } = useAuth();
  const [isCopiedCode, setIsCopiedCode] = useState(false);
  const [isCopiedLink, setIsCopiedLink] = useState(false);

  if (!isOpen) return null;

  // 1. Generate robust link with Query Params to avoid 404s
  const getInviteLink = () => {
    const base = websiteUrl || (typeof window !== 'undefined' ? window.location.origin : '');
    // Format: /?view=register&ref=CODE
    return `${base}/?view=register&ref=${user?.inviteCode || ''}`;
  };

  // 2. Viral Message Template (Hindi + Emojis)
  const getViralMessage = () => {
    const link = getInviteLink();
    return `🔥 *धमाकेदार लूट!* 🔥
भाई, मैंने अभी ₹50 जीते हैं! 🤑
सिर्फ रजिस्टर करो और अपना पहला रिचार्ज करके **Lucky Spin** घुमाओ।

🎁 *Win up to ₹100 Daily for 11 Days!*
(Daily Income सीधा बैंक में 🏦)

👇 *Link से अभी ज्वाइन करो:*
${link}

⚠️ *Note:* पहला रिचार्ज करने पर ही Spin मिलेगा!`;
  };

  // 3. Handle WhatsApp Share
  const handleShare = async () => {
    const message = getViralMessage();
    
    // On mobile, try native share
    if (navigator.share) {
      try {
        await navigator.share({
          text: message,
        });
      } catch (error) {
        console.log("Share skipped", error);
      }
    } else {
      // Desktop fallback: Open WhatsApp Web
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  // 4. Handle Copy Link Only
  const handleCopyLink = async () => {
      const link = getInviteLink();
      if (navigator.clipboard) {
          try {
              await navigator.clipboard.writeText(link);
              setIsCopiedLink(true);
              setTimeout(() => setIsCopiedLink(false), 2000);
          } catch (err) {
              console.error("Failed to copy link:", err);
          }
      }
  };

  // 5. Handle Copy Code Only
  const handleCopyCode = async () => {
    if (user?.inviteCode && navigator.clipboard) {
        try {
            await navigator.clipboard.writeText(user.inviteCode);
            setIsCopiedCode(true);
            setTimeout(() => setIsCopiedCode(false), 2000);
        } catch (err) {
            console.error("Failed to copy code:", err);
        }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up">
      <div className="bg-white rounded-[1.25rem] w-full max-w-sm overflow-hidden relative shadow-2xl flex flex-col transform transition-all">
        
        {/* Sleek Header */}
        <div className="bg-[#5e35b1] px-5 py-4 flex justify-between items-center relative shadow-md z-10">
            <div className="flex items-center gap-3">
                <div className="bg-white/10 p-1.5 rounded-lg backdrop-blur-sm border border-white/20">
                    <Trophy className="w-5 h-5 text-yellow-300" />
                </div>
                <div>
                    <h3 className="text-base font-bold text-white tracking-wide leading-tight">Refer & Earn</h3>
                    <p className="text-purple-200 text-[10px] font-medium">Win rewards together</p>
                </div>
            </div>
            <button 
                onClick={onClose} 
                className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-1.5 transition-colors"
            >
                <X className="w-4 h-4"/>
            </button>
        </div>
        
        <div className="p-5 bg-white flex-1">
            
            {/* Value Prop Card */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-100 mb-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-2xl border border-purple-100">
                    🎁
                </div>
                <div>
                    <p className="text-gray-900 font-bold text-sm">Earn ₹50 Commission</p>
                    <p className="text-[11px] text-gray-500 font-medium leading-tight mt-0.5">
                        Plus get <span className="text-purple-700 font-bold">11 Days Income</span> when friends join & invest!
                    </p>
                </div>
            </div>

            {/* Invite Code Section */}
            <div className="mb-6">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5 block ml-1">Your Referral Code</label>
                <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 font-mono text-sm font-bold text-gray-800 tracking-wider flex items-center justify-between">
                        {user?.inviteCode}
                    </div>
                    <button 
                        onClick={handleCopyCode}
                        className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 border shadow-sm ${
                            isCopiedCode 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        {isCopiedCode ? 'Copied' : <><Copy className="w-3.5 h-3.5"/> Copy</>}
                    </button>
                </div>
            </div>

            {/* Two Buttons: Copy Link & WhatsApp */}
            <div className="grid grid-cols-2 gap-3 mb-2">
                <button 
                    onClick={handleCopyLink} 
                    className={`w-full border-2 border-gray-100 hover:border-gray-300 text-gray-700 active:scale-[0.98] transition-all py-3 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 ${isCopiedLink ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50'}`}
                >
                    {isCopiedLink ? <CheckCircle2 className="w-5 h-5"/> : <LinkIcon className="w-5 h-5" />}
                    {isCopiedLink ? 'Link Copied!' : 'Copy Link'}
                </button>

                <button 
                    onClick={handleShare} 
                    className="w-full bg-[#25D366] hover:bg-[#20bd5a] active:scale-[0.98] transition-all text-white py-3 rounded-xl text-xs font-bold shadow-lg shadow-green-200/50 flex flex-col items-center justify-center gap-1"
                >
                    <Share2 className="w-5 h-5" />
                    WhatsApp
                </button>
            </div>

            <div className="text-center">
                <p className="text-[10px] text-gray-400 font-medium mt-3">
                    Invite friends to unlock your Lucky Spin.
                </p>
            </div>

        </div>
      </div>
    </div>
  );
};
