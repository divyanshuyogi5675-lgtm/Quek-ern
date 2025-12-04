
import React, { useState } from 'react';
import { X, ShieldCheck, Zap, TrendingUp, Calendar, Wallet, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Product } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, onClose }) => {
  const { user, buyProduct } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'details' | 'success'>('details');

  if (!isOpen || !product) return null;

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await buyProduct(product);
      setStep('success');
    } catch (error: any) {
      alert(error.message); // Simple alert for error, keeping UI clean
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep('details');
    onClose();
  };

  if (step === 'success') {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in-up">
            <div className="bg-white rounded-2xl w-full max-w-sm p-8 text-center shadow-2xl">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Investment Successful!</h2>
                <p className="text-gray-500 mb-6">
                    You have successfully purchased <b>{product.name}</b>. <br/>
                    Your daily income tracking has started.
                </p>
                <Button onClick={handleClose} fullWidth>Go to My Plans</Button>
            </div>
        </div>
      );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 p-5 text-white flex justify-between items-start relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <div className="relative z-10">
                <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1 block">Selected Plan</span>
                <h3 className="text-2xl font-bold leading-tight">{product.name}</h3>
            </div>
            <button onClick={onClose} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors relative z-10">
                <X className="w-5 h-5" />
            </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                    <p className="text-xs text-emerald-600 font-bold uppercase mb-1">Daily Income</p>
                    <p className="text-xl font-extrabold text-emerald-700">₹{product.dailyIncome}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                    <p className="text-xs text-blue-600 font-bold uppercase mb-1">Total Return</p>
                    <p className="text-xl font-extrabold text-blue-700">₹{product.totalRevenue}</p>
                </div>
            </div>

            {/* Details List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-3 text-gray-600">
                        <Wallet className="w-5 h-5 text-gray-400" />
                        <span className="text-sm font-medium">Investment Price</span>
                    </div>
                    <span className="font-bold text-gray-900">₹{product.price}</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-3 text-gray-600">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <span className="text-sm font-medium">Duration</span>
                    </div>
                    <span className="font-bold text-gray-900">{product.duration} Days</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-3 text-gray-600">
                        <TrendingUp className="w-5 h-5 text-gray-400" />
                        <span className="text-sm font-medium">Net Profit</span>
                    </div>
                    <span className="font-bold text-green-600">+₹{product.totalRevenue - product.price}</span>
                </div>
            </div>

            {/* Note */}
            <div className="bg-yellow-50 p-3 rounded-xl flex gap-3 items-start">
                <ShieldCheck className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-800 leading-relaxed">
                    <b>Principal Security:</b> Capital is automatically released after {product.duration} days. Daily income is credited every 24 hours at midnight.
                </p>
            </div>
        </div>

        {/* Footer Action */}
        <div className="p-5 border-t border-gray-100 bg-gray-50">
            <div className="flex justify-between items-center mb-4 text-sm">
                <span className="text-gray-500">Wallet Balance:</span>
                <span className={`font-bold ${user?.balance && user.balance >= product.price ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{user?.balance || 0}
                </span>
            </div>
            <Button 
                onClick={handleConfirm} 
                fullWidth 
                isLoading={isLoading}
                disabled={user?.balance !== undefined && user.balance < product.price}
                className={user?.balance !== undefined && user.balance < product.price ? 'opacity-50' : ''}
            >
                {user?.balance !== undefined && user.balance < product.price ? 'Insufficient Balance' : 'Confirm & Invest'}
                {user?.balance !== undefined && user.balance >= product.price && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
        </div>
      </div>
    </div>
  );
};
