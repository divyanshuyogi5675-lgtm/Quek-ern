import React from 'react';
import { ShoppingBag } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen w-full flex bg-white overflow-hidden">
      {/* Left Side - Green Branding Area (Still Green as per previous request, but Flipkart content) */}
      <div className="hidden lg:flex lg:w-1/2 bg-emerald-600 relative overflow-hidden items-center justify-center p-12">
        {/* Abstract Background Patterns */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
           <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
             <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
             <circle cx="20" cy="20" r="30" fill="white" />
           </svg>
        </div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        <div className="relative z-10 text-white max-w-lg">
          <img 
            src="https://i.supaimg.com/561279ed-81a8-46f7-b250-30c7844aec75.png" 
            alt="Flipkart Logo" 
            className="w-40 h-auto mb-8 drop-shadow-2xl"
          />
          <h1 className="font-serif text-5xl font-bold mb-6 leading-tight">
            Flipkart <br/> Marketplace
          </h1>
          <p className="text-emerald-100 text-lg leading-relaxed mb-8">
            Access your account securely. Shop, track orders, and manage your wishlist with the best in the business.
          </p>
          
          <div className="flex items-center gap-4 text-sm font-medium text-emerald-100">
             <div className="flex -space-x-3">
               {[1,2,3,4].map(i => (
                 <img key={i} src={`https://picsum.photos/40?random=${i}`} className="w-10 h-10 rounded-full border-2 border-emerald-600" alt="User" />
               ))}
             </div>
             <span>Trusted by 10,000+ shoppers</span>
          </div>
        </div>
      </div>

      {/* Right Side - Form Area */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-24 bg-white relative">
        <div className="w-full max-w-md space-y-8 animate-fade-in-up">
          <div className="text-center lg:text-left">
            <div className="lg:hidden mx-auto mb-6 flex justify-center">
               <img 
                  src="https://i.supaimg.com/561279ed-81a8-46f7-b250-30c7844aec75.png" 
                  alt="Flipkart Logo" 
                  className="h-20 w-auto object-contain"
               />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 font-serif">
              {title}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              {subtitle}
            </p>
          </div>
          
          {children}
          
        </div>
        
        {/* Footer */}
        <div className="absolute bottom-6 w-full text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Flipkart Inc. All rights reserved.
        </div>
      </div>
      
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};