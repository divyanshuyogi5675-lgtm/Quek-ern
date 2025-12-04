import React, { useState, useEffect } from 'react';
import { Mail, Lock } from 'lucide-react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { AuthView } from '../types';
import { getFriendlyErrorMessage } from '../utils/formatError';

interface LoginFormProps {
  onViewChange: (view: AuthView) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onViewChange }) => {
  const { login, loginWithGoogle, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Safety: If user is logged in, loading should be true (waiting for redirect)
  useEffect(() => {
    if (user) setIsLoading(true);
  }, [user]);

  // Safety Timeout: If loading is true for too long without a user change (stuck state), reset it
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isLoading && !user) {
        timer = setTimeout(() => {
            setIsLoading(false);
            // Optional: setError("Login timed out. Please check connection.");
        }, 8000); // 8 seconds safety valve
    }
    return () => clearTimeout(timer);
  }, [isLoading, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    if (!email || !password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    try {
      await login(email, password);
      // Success! We keep isLoading=true and wait for AuthContext to update 'user', 
      // which triggers App.tsx to unmount this component.
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err));
      setIsLoading(false); // Stop loading immediately on error
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
    } catch (error: any) {
      console.error(error);
      setError(getFriendlyErrorMessage(error));
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Email Address"
          type="email"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail className="w-5 h-5" />}
          error={error && error.toLowerCase().includes('email') ? error : undefined}
          required
        />
        
        <div>
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="w-5 h-5" />}
            required
          />
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-500">
                Remember me
              </label>
            </div>
            <button
              type="button"
              className="text-sm font-medium text-emerald-600 hover:text-emerald-500 transition-colors"
              onClick={() => onViewChange(AuthView.FORGOT_PASSWORD)}
            >
              Forgot password?
            </button>
          </div>
        </div>

        {error && (
            <div className="p-4 bg-red-100 border border-red-200 rounded-xl flex items-start gap-3 text-sm text-red-700 animate-fade-in-up shadow-sm">
                <div className="bg-red-200 rounded-full p-1 flex-shrink-0">
                    <span className="font-bold w-4 h-4 flex items-center justify-center">!</span> 
                </div>
                <span className="break-words flex-1 font-medium">{error}</span>
            </div>
        )}

        <Button type="submit" fullWidth isLoading={isLoading}>
          Sign in with Email
        </Button>
      </form>

      <div className="space-y-3">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <Button variant="google" fullWidth onClick={handleGoogleLogin} isLoading={isLoading}>
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Sign in with Google
        </Button>
      </div>

      <p className="text-center text-sm text-gray-500">
        Don't have an account?{' '}
        <button 
          onClick={() => onViewChange(AuthView.REGISTER)} 
          className="font-semibold text-emerald-600 hover:text-emerald-500 transition-colors"
        >
          Create free account
        </button>
      </p>
    </div>
  );
};