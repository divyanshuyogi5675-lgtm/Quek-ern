
import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'google' | 'purple';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  fullWidth, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "relative inline-flex items-center justify-center px-6 py-2.5 sm:py-3 text-sm font-semibold transition-all duration-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group";
  
  const variants = {
    primary: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30 focus:ring-emerald-600",
    outline: "border-2 border-gray-200 hover:border-emerald-600 hover:text-emerald-600 text-gray-600 bg-transparent focus:ring-emerald-600",
    ghost: "text-emerald-600 hover:bg-emerald-50 focus:ring-emerald-600",
    google: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm focus:ring-gray-200",
    purple: "bg-[#5e35b1] hover:bg-[#4527a0] text-white shadow-lg shadow-purple-600/30 focus:ring-purple-600"
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${widthClass} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {/* Shine Effect Layer */}
      {!isLoading && !props.disabled && (variant === 'primary' || variant === 'purple') && (
        <div className="absolute inset-0 -translate-x-full group-hover:animate-[shine_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-10"></div>
      )}
      
      <span className="relative z-20 flex items-center justify-center">
        {isLoading ? (
            <>
            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
            </>
        ) : children}
      </span>
      
      <style>{`
        @keyframes shine {
            100% { transform: translateX(100%); }
        }
      `}</style>
    </button>
  );
};