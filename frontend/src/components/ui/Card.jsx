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
      className={`relative rounded-2xl bg-white border border-slate-200/90 shadow-sm shadow-slate-100 p-6 overflow-hidden transition-all duration-200 ${
        glow ? 'border-blue-400/40 shadow-md shadow-blue-500/10' : ''
      } ${hover ? 'hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5' : ''} ${className}`}
      {...props}
    >
      {/* Subtle top reflection line */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-blue-400/20 to-transparent" />
      {children}
    </div>
  );
};

export const CardHeader = ({ title, subtitle, action, className = '' }) => (
  <div className={`flex items-start justify-between mb-5 ${className}`}>
    <div>
      <h3 className="text-lg font-bold tracking-tight text-slate-900">{title}</h3>
      {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
    </div>
    {action && <div className="shrink-0 ml-4">{action}</div>}
  </div>
);

export default Card;
