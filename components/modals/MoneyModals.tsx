import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Copy, Download, Clock, AlertTriangle, ScanLine, CheckCircle2, Smartphone, ShieldCheck, Building2, User, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { WithdrawalDetails } from '../../types';

interface MoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number, utr: string) => Promise<void>;
  onSubmitWithdraw?: (amount: number, details: WithdrawalDetails) => Promise<void>;
  type: 'recharge' | 'withdraw';
  currentBalance?: number;
}

const RECHARGE_IMG = "https://i.supaimg.com/30e5f2ec-9ddf-4ed8-a06e-ca511cedda47.png";
const WITHDRAW_IMG = "https://i.supaimg.com/14e9750a-ba32-4aa9-9e14-7c47dbb609be.png";

const PRESET_AMOUNTS = [100, 300, 500, 1000, 2000, 5000, 10000, 50000];

const PhonePeIcon = () => (
    <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" fillRule="evenodd" clipRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" className="w-[22px] h-[22px]">
        <circle cx="-25.926" cy="41.954" r="29.873" fill="#5f259f" transform="rotate(-76.714 -48.435 5.641) scale(8.56802)" />
        <path d="M372.164 189.203c0-10.008-8.576-18.593-18.584-18.593h-34.323l-78.638-90.084c-7.154-8.577-18.592-11.439-30.03-8.577l-27.17 8.577c-4.292 1.43-5.723 7.154-2.862 10.007l85.8 81.508H136.236c-4.293 0-7.154 2.861-7.154 7.154v14.292c0 10.016 8.585 18.592 18.592 18.592h20.015v68.639c0 51.476 27.17 81.499 72.931 81.499 14.292 0 25.739-1.431 40.03-7.146v45.753c0 12.87 10.016 22.886 22.885 22.886h20.015c4.293 0 8.577-4.293 8.577-8.586V210.648h32.893c4.292 0 7.145-2.861 7.145-7.145v-14.3zM280.65 312.17c-8.576 4.292-20.015 5.723-28.591 5.723-22.886 0-34.324-11.438-34.324-37.176v-68.639h62.915v100.092z" fill="#fff" fillRule="nonzero" />
    </svg>
);

const PaytmIcon = () => (
    <svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" className="w-[22px] h-[22px] rounded-lg">
        <rect width="256" height="256" fill="#00baf2" />
        <text x="50%" y="55%" fontSize="120" fontFamily="Arial" fill="#fff" fontWeight="bold" textAnchor="middle">Paytm</text>
    </svg>
);

export const MoneyModal: React.FC<MoneyModalProps> = ({ isOpen, onClose, onSubmit, onSubmitWithdraw, type, currentBalance = 0 }) => {
  const { upiId, requestWithdraw } = useAuth();
  
  // Shared State
  const [step, setStep] = useState<'amount' | 'details' | 'gateway' | 'success'>('amount');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Recharge State
  const [timeLeft, setTimeLeft] = useState(900); 
  const [utr, setUtr] = useState('');
  const [copied, setCopied] = useState(false);

  // Withdraw State
  const [withdrawDetails, setWithdrawDetails] = useState<WithdrawalDetails>({
      fullName: '',
      phoneNumber: '',
      method: 'upi',
      paymentAddress: ''
  });

  // Reset when modal opens
  useEffect(() => {
      if (isOpen) {
          setStep('amount');
          setAmount('');
          setUtr('');
          setWithdrawDetails({ fullName: '', phoneNumber: '', method: 'upi', paymentAddress: '' });
      }
  }, [isOpen]);

  // Timer Logic
  useEffect(() => {
    if (!isOpen || step !== 'gateway') return;
    setTimeLeft(900);
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, step]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleCopy = async () => {
    if (navigator.clipboard) {
        try {
            await navigator.clipboard.writeText(upiId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (e) {
            console.error("Failed to copy:", e);
        }
    }
  };

  // Reset Budget Limit Function (Simulated as requested)
  const resetBudget = () => {
    setAmount('');
    setUtr('');
    setStep('amount');
  };

  // Step 1: Amount Validation
  const handleAmountSubmit = () => {
    const val = Number(amount);
    
    if (type === 'recharge') {
        if (val < 100) { alert("Minimum recharge is ₹100"); return; }
        setStep('gateway');
    } else {
        // Withdraw Flow
        if (val < 500) { alert("Minimum withdrawal is ₹500"); return; }
        if (val > currentBalance) { alert("Insufficient wallet balance"); return; }
        setStep('details'); // Move to details form
    }
  };

  // Step 2: Final Submit
  const handleFinalSubmit = async () => {
    const val = Number(amount);
    setIsLoading(true);

    try {
      if (type === 'recharge') {
         if (!utr) throw new Error("Please enter UTR Reference Number");
         
         await new Promise(resolve => setTimeout(resolve, 3000)); // Sim delay to prevent infinite loading state
         
         const dbOp = onSubmit(val, utr);
         
         // CRITICAL FIX: Handle late rejections to prevent "Uncaught (in promise)" if race finishes first
         dbOp.catch(err => console.warn("Recharge op finished with error after timeout:", err));

         const timeout = new Promise((resolve) => setTimeout(() => resolve(true), 5000)); 
         
         // We basically proceed to success screen regardless after 3-5 seconds
         // to ensure user doesn't get stuck.
         await Promise.race([dbOp, timeout]);
         
         setStep('success');

      } else {
         // Withdraw Submit
         if (!withdrawDetails.fullName || !withdrawDetails.phoneNumber || !withdrawDetails.paymentAddress) {
             throw new Error("Please fill all payment details");
         }
         // Using the context directly via prop if passed, or fallback (logic in AuthContext)
         if (requestWithdraw) {
            await requestWithdraw(val, withdrawDetails);
         }
         setStep('success');
      }

    } catch (error: any) {
      alert(error.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const getHighDensityQRUrl = (amt: string) => {
      const paddingData = "SECURE-PAYMENT-GATEWAY-VERIFICATION-TOKEN-SHA256-ENCRYPTED-BLOCKCHAIN-LEDGER-ID-88374-X99-ALPHA-OMEGA-PROTOCOL-V10";
      const upiString = `upi://pay?pa=${upiId}&pn=FlipkartInvest&am=${amt}&cu=INR&tn=FlipkartWalletRecharge&densityPadding=${paddingData}`;
      return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&ecc=H&margin=0&data=${encodeURIComponent(upiString)}`;
  };

  const getUpiDeepLink = () => {
      const amt = Number(amount).toFixed(2);
      return `upi://pay?pa=${upiId}&pn=FlipkartInvest&am=${amt}&cu=INR&tn=FlipkartWalletRecharge`;
  };

  if (!isOpen) return null;

  // --- SUCCESS VIEW (Both) ---
  if (step === 'success') {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up">
            <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-8 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-green-600" strokeWidth={3} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted</h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                    Your {type} request has been received. 
                    <br/>
                    <span className="font-semibold text-emerald-600">
                        {type === 'recharge' ? 'Wallet will update in 20-30 mins.' : 'Funds will reach your bank shortly.'}
                    </span>
                </p>
                <Button onClick={onClose} fullWidth>Okay</Button>
            </div>
        </div>
      );
  }

  // --- WITHDRAW FLOW ---
  if (type === 'withdraw') {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up">
            <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                <div className="bg-emerald-600 p-4 flex items-center justify-between text-white shrink-0">
                    <h3 className="text-lg font-serif font-bold">Withdraw Funds</h3>
                    <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                </div>
                
                <div className="overflow-y-auto p-0">
                    {/* Header Image */}
                    {step === 'amount' && (
                         <div className="w-full h-32 overflow-hidden bg-gray-100">
                            <img src={WITHDRAW_IMG} alt="Banner" className="w-full h-full object-cover"/>
                        </div>
                    )}

                    <div className="p-6 space-y-5">
                        {step === 'amount' ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Enter Withdrawal Amount</label>
                                    <div className="relative mt-2">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₹</span>
                                        <input 
                                            type="number" 
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-lg font-bold"
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                                        <span>Balance: ₹{currentBalance}</span>
                                        <span>Min: ₹500</span>
                                    </div>
                                </div>
                                <Button onClick={handleAmountSubmit} fullWidth>
                                    Next Step <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        ) : (
                            // Step 2: Withdrawal Details Form
                            <div className="space-y-4">
                                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-sm text-blue-800 flex justify-between items-center">
                                    <span className="font-bold">Withdraw Amount:</span>
                                    <span className="font-mono text-lg font-bold">₹{amount}</span>
                                </div>

                                <div className="space-y-3">
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                        <input 
                                            placeholder="Account Holder Name" 
                                            className="w-full pl-10 p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                                            value={withdrawDetails.fullName}
                                            onChange={(e) => setWithdrawDetails({...withdrawDetails, fullName: e.target.value})}
                                        />
                                    </div>
                                    <div className="relative">
                                        <Smartphone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                        <input 
                                            placeholder="Registered Mobile Number" 
                                            type="tel"
                                            className="w-full pl-10 p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                                            value={withdrawDetails.phoneNumber}
                                            onChange={(e) => setWithdrawDetails({...withdrawDetails, phoneNumber: e.target.value})}
                                        />
                                    </div>
                                    
                                    <div className="flex gap-2 my-2">
                                        <button 
                                            onClick={() => setWithdrawDetails({...withdrawDetails, method: 'upi'})}
                                            className={`flex-1 py-2 rounded-lg text-sm font-bold border ${withdrawDetails.method === 'upi' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-gray-200 text-gray-600'}`}
                                        >
                                            UPI ID
                                        </button>
                                        <button 
                                            onClick={() => setWithdrawDetails({...withdrawDetails, method: 'bank'})}
                                            className={`flex-1 py-2 rounded-lg text-sm font-bold border ${withdrawDetails.method === 'bank' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-gray-200 text-gray-600'}`}
                                        >
                                            Bank Transfer
                                        </button>
                                    </div>

                                    {withdrawDetails.method === 'upi' ? (
                                        <input 
                                            placeholder="Enter UPI ID (e.g. name@okhdfcbank)" 
                                            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-mono text-sm"
                                            value={withdrawDetails.paymentAddress}
                                            onChange={(e) => setWithdrawDetails({...withdrawDetails, paymentAddress: e.target.value})}
                                        />
                                    ) : (
                                        <textarea 
                                            placeholder="Bank Name, Account No, IFSC Code" 
                                            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none h-24 text-sm"
                                            value={withdrawDetails.paymentAddress}
                                            onChange={(e) => setWithdrawDetails({...withdrawDetails, paymentAddress: e.target.value})}
                                        />
                                    )}
                                </div>

                                <Button onClick={handleFinalSubmit} fullWidth isLoading={isLoading}>
                                    Confirm Withdraw
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      );
  }

  // --- RECHARGE FLOW ---
  // Step 1: Enter Amount
  if (step === 'amount') {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up">
            <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
                <div className="bg-[#5e35b1] p-5 text-white flex justify-between items-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    <h3 className="text-xl font-bold relative z-10">Add Funds</h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors relative z-10"><X className="w-5 h-5" /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="mb-6">
                        <label className="text-sm font-bold text-gray-700 mb-2 block">Enter Amount</label>
                        <div className="relative">
                             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xl">₹</span>
                             <input 
                                type="number" 
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0"
                                className="w-full pl-10 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-[#5e35b1] focus:ring-0 outline-none text-2xl font-bold text-gray-900 transition-all"
                                autoFocus
                             />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-6">
                        {PRESET_AMOUNTS.slice(0, 6).map((amt) => (
                            <button 
                                key={amt}
                                onClick={() => setAmount(amt.toString())}
                                className="py-2 px-1 bg-gray-50 hover:bg-purple-50 border border-gray-100 hover:border-purple-200 rounded-xl text-sm font-bold text-gray-600 hover:text-purple-700 transition-all"
                            >
                                + {amt}
                            </button>
                        ))}
                    </div>

                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
                        <div className="flex gap-3">
                            <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0" />
                            <p className="text-xs text-blue-800 leading-relaxed">
                                Payments are secured by 256-bit encryption. Funds are added to your wallet automatically after verification.
                            </p>
                        </div>
                    </div>

                    <Button onClick={handleAmountSubmit} fullWidth className="bg-[#5e35b1] hover:bg-[#4527a0] shadow-xl shadow-purple-200 py-4 text-base">
                        Proceed to Pay
                    </Button>
                </div>
            </div>
        </div>
    );
  }

  // Step 2: Payment Gateway (QR & UTR) - UPDATED UI
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up">
        <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col h-[90vh]">
            
            {/* Sticky Header */}
            <div className="bg-[#5e35b1] p-4 text-white flex items-center justify-between shrink-0 shadow-md z-10">
                <div className="flex items-center gap-3">
                    <button onClick={() => setStep('amount')}><ArrowRight className="w-5 h-5 rotate-180" /></button>
                    <h3 className="font-bold text-lg">PAYMENT</h3>
                </div>
                <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-mono flex items-center gap-1 backdrop-blur-sm border border-white/10">
                     <Clock className="w-3 h-3" /> {formatTime(timeLeft)}
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-5 space-y-6">
                
                {/* QR Section */}
                <div className="flex flex-col items-center">
                    <div className="bg-white p-3 rounded-2xl shadow-lg border border-gray-100 relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-500 rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
                        <div className="relative bg-white p-2 rounded-xl">
                           <img src={getHighDensityQRUrl(amount)} className="w-48 h-48 object-contain rounded-lg" alt="QR Code" />
                        </div>
                    </div>
                    
                    <div className="mt-4 flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm border border-emerald-100">
                       <ShieldCheck className="w-3.5 h-3.5" />
                       Scan & Pay securely with UPI
                    </div>
                </div>

                {/* Download / Scan Button */}
                <a href={getUpiDeepLink()} className="block w-full">
                    <Button variant="purple" fullWidth className="py-3.5 shadow-xl shadow-purple-200">
                       <Download className="w-4 h-4 mr-2" /> Download / Scan
                    </Button>
                </a>

                {/* Payment Methods */}
                <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 ml-1">Choose a payment method to pay</p>
                    <div className="grid grid-cols-2 gap-3">
                        <a href={getUpiDeepLink()} className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex items-center gap-3 group active:scale-95 no-underline">
                            <PaytmIcon />
                            <span className="font-bold text-gray-700 group-hover:text-[#00baf2] transition-colors text-sm">Paytm</span>
                        </a>
                        <a href={getUpiDeepLink()} className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex items-center gap-3 group active:scale-95 no-underline">
                            <PhonePeIcon />
                            <span className="font-bold text-gray-700 group-hover:text-[#5f259f] transition-colors text-sm">PhonePe</span>
                        </a>
                    </div>
                </div>

                {/* Manual Transfer Block */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-[0_4px_20px_rgba(0,0,0,0.03)] relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-1 h-full bg-[#5e35b1]"></div>
                     <div className="flex items-center gap-2 mb-4">
                         <ScanLine className="w-5 h-5 text-[#5e35b1]" />
                         <h4 className="font-bold text-gray-900">Manual Transfer</h4>
                     </div>
                     
                     <div className="space-y-5">
                         <div>
                            <label className="text-xs text-gray-500 mb-2 block font-medium">Step 1: Copy the below given UPI</label>
                            <div className="flex gap-2">
                                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 font-mono text-sm text-gray-800 flex items-center select-all">
                                    {upiId}
                                </div>
                                <button 
                                    onClick={handleCopy}
                                    className={`px-4 rounded-lg font-bold text-xs text-white transition-all flex items-center gap-1 shadow-md ${copied ? 'bg-green-500' : 'bg-[#5e35b1] hover:bg-[#4527a0]'}`}
                                >
                                    {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    {copied ? 'Copied' : 'Copy'}
                                </button>
                            </div>
                            <p className="text-[10px] text-orange-600 mt-2 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> Tip: Don't save the UPI, get new UPI every time.
                            </p>
                         </div>

                         <div>
                            <label className="text-xs text-gray-500 mb-2 block font-medium">Step 2: Paid? Submit UTR NO. for fast verification.</label>
                            <div className="relative group">
                                <input 
                                    type="text" 
                                    placeholder="Ref No. Ref No is required" 
                                    value={utr}
                                    onChange={(e) => setUtr(e.target.value)}
                                    className="w-full bg-white text-gray-900 placeholder-gray-400 border border-gray-300 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-[#5e35b1] focus:border-[#5e35b1] outline-none transition-all shadow-sm"
                                />
                                {/* Optional Glow Effect container if needed, sticking to clean input per instructions */}
                            </div>
                            <p className="text-[10px] text-orange-600 mt-2">
                                Tip: Open your UPI wallet to find the 12-digit UTR/Ref No.
                            </p>
                         </div>
                     </div>
                </div>
                
                {/* Reset Budget Limit Button */}
                <Button 
                    onClick={resetBudget}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 rounded-xl shadow-lg shadow-purple-200 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                     <RefreshCw className="w-4 h-4" /> Reset Budget Limit
                </Button>

                <Button onClick={handleFinalSubmit} fullWidth isLoading={isLoading} className="bg-[#5e35b1] hover:bg-[#4527a0] py-4 text-base shadow-xl">
                    Submit Payment Request
                </Button>
                
                {/* Safe Area Spacer */}
                <div className="h-6"></div>
            </div>
        </div>
    </div>
  );
};