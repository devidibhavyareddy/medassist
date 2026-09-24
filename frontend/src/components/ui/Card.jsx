import React from 'react';

const Card = ({
  children,
  className = '',
  glow = false,
  hover = true,
  onClick,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={`relative rounded-2xl glass-card p-6 overflow-hidden ${
        glow ? 'border-cyan-500/40 shadow-lg shadow-cyan-500/10' : ''
      } ${hover ? 'hover:-translate-y-0.5' : ''} ${className}`}
      {...props}
    >
      {/* Subtle top reflection line */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />
      {children}
    </div>
  );
};

export const CardHeader = ({ title, subtitle, action, className = '' }) => (
  <div className={`flex items-start justify-between mb-5 ${className}`}>
    <div>
      <h3 className="text-lg font-semibold tracking-tight text-white">{title}</h3>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </div>
    {action && <div className="shrink-0 ml-4">{action}</div>}
  </div>
);

export default Card;
