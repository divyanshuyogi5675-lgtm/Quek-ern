import React, { useState, useEffect, useRef } from 'react';
import { Mail, Lock, User as UserIcon, Phone, Ticket } from 'lucide-react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { AuthView } from '../types';
import { getFriendlyErrorMessage } from '../utils/formatError';

interface RegisterFormProps {
  onViewChange: (view: AuthView) => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onViewChange }) => {
  const { register, loginWithGoogle } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  
  // Initialize Invite Code from URL Query Parameter (?ref=CODE)
  const [inviteCode, setInviteCode] = useState(() => {
    if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        return params.get('ref') || '';
    }
    return '';
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  // Turnstile Rendering for Production
  useEffect(() => {
    const intervalId = setInterval(() => {
        if (window.turnstile && turnstileRef.current && !widgetId.current) {
            try {
                widgetId.current = window.turnstile.render(turnstileRef.current, {
                    sitekey: '0x4AAAAAACExbvDVlqq5k643',
                    callback: (token: string) => setCaptchaToken(token),
                    'expired-callback': () => setCaptchaToken(null),
                });
                clearInterval(intervalId);
            } catch (e) {
                console.error("Turnstile render error", e);
            }
        }
    }, 100);

    return () => {
        clearInterval(intervalId);
        if (window.turnstile && widgetId.current) {
            try {
                window.turnstile.remove(widgetId.current);
            } catch(e) {}
            widgetId.current = null;
        }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!captchaToken) {
        setError("Please verify you are human.");
        setIsLoading(false);
        return;
    }

    // Password Validation
    if (password.length < 8) {
        setError("Password must be at least 8 characters long.");
        setIsLoading(false);
        return;
    }
    if (!/\d/.test(password)) {
        setError("Password must contain at least one number.");
        setIsLoading(false);
        return;
    }

    if (!phone) {
        setError("Phone number is required");
        setIsLoading(false);
        return;
    }
    
    try {
      await register(name, email, password, phone, inviteCode);
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err));
      // Reset CAPTCHA on error
      if (window.turnstile && widgetId.current) {
          try {
             window.turnstile.reset(widgetId.current);
          } catch(e) {}
          setCaptchaToken(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Pass invite code to Google Login so referral is tracked
      await loginWithGoogle(inviteCode);
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name / Username"
          type="text"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          icon={<UserIcon className="w-5 h-5" />}
          required
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail className="w-5 h-5" />}
          required
        />
        
        <Input
          label="Phone Number"
          type="tel"
          placeholder="+91 1234567890"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          icon={<Phone className="w-5 h-5" />}
          required
        />

        <Input
          label="Password"
          type="password"
          placeholder="Min 8 chars with numbers"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<Lock className="w-5 h-5" />}
          required
        />

        <Input
          label="Invite Code (Optional)"
          type="text"
          placeholder="INVITE-123"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          icon={<Ticket className="w-5 h-5" />}
        />

        {/* Cloudflare Turnstile Widget */}
        <div className="flex justify-center my-4 min-h-[65px]">
             <div ref={turnstileRef}></div>
        </div>

        <div className="text-xs text-gray-500 mt-2">
            By creating an account, you agree to our <span className="text-emerald-600 cursor-pointer hover:underline">Terms of Service</span> and <span className="text-emerald-600 cursor-pointer hover:underline">Privacy Policy</span>.
        </div>

        {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2 text-sm text-red-600 animate-fade-in-up">
                <span className="font-bold flex-shrink-0 mt-0.5">!</span> 
                <span className="break-words flex-1">{error}</span>
            </div>
        )}

        <Button type="submit" fullWidth isLoading={isLoading} className="mt-2" disabled={!captchaToken}>
          Create Account
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or register with</span>
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
        Sign up with Google
      </Button>

      <p className="text-center text-sm text-gray-500">
        Already have an account?{' '}
        <button 
          onClick={() => onViewChange(AuthView.LOGIN)} 
          className="font-semibold text-emerald-600 hover:text-emerald-500 transition-colors"
        >
          Sign in
        </button>
      </p>
    </div>
  );
};