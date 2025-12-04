import React, { useState } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { AuthView } from '../types';
import { getFriendlyErrorMessage } from '../utils/formatError';

interface ForgotPasswordFormProps {
  onViewChange: (view: AuthView) => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onViewChange }) => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    if (!email) {
       setError("Please enter your email address.");
       setIsLoading(false);
       return;
    }

    try {
      await resetPassword(email);
      setMessage("Success! Check your email for password reset instructions.");
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center lg:text-left mb-2">
         <p className="text-gray-600">
            Enter the email associated with your account and we'll send you a link to reset your password.
         </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Email Address"
          type="email"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail className="w-5 h-5" />}
          required
        />

        {message && (
             <div className="p-3 bg-green-50 border border-green-100 rounded-lg text-sm text-green-600 animate-fade-in-up">
                {message}
             </div>
        )}

        {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2 text-sm text-red-600 animate-fade-in-up">
                <span className="font-bold flex-shrink-0 mt-0.5">!</span> 
                <span className="break-words flex-1">{error}</span>
            </div>
        )}

        <Button type="submit" fullWidth isLoading={isLoading}>
          Send Reset Link
        </Button>
      </form>

      <div className="text-center pt-2">
        <button 
          onClick={() => onViewChange(AuthView.LOGIN)} 
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-emerald-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Login
        </button>
      </div>
    </div>
  );
};