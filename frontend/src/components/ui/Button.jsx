import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  icon: Icon,
  type = 'button',
  onClick,
  ...props
}) => {
  const baseStyles =
    'relative inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#060913] disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] cursor-pointer';

  const variants = {
    primary:
      'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 border border-cyan-400/30 focus:ring-cyan-400',
    secondary:
      'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/60 hover:border-slate-600 focus:ring-slate-500 backdrop-blur-md',
    danger:
      'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-lg shadow-rose-600/25 border border-rose-500/30 focus:ring-rose-400',
    outline:
      'bg-transparent hover:bg-cyan-500/10 text-cyan-400 border border-cyan-500/40 hover:border-cyan-400 focus:ring-cyan-400',
    ghost:
      'bg-transparent hover:bg-slate-800/60 text-slate-300 hover:text-white focus:ring-slate-500',
    ai:
      'bg-gradient-to-r from-teal-400 via-cyan-500 to-indigo-600 hover:from-teal-300 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/30 border border-teal-300/40 focus:ring-teal-400',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-6 py-3 gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-current" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4 shrink-0" />}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
