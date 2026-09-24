import React from 'react';

export const Skeleton = ({ className = '', variant = 'text' }) => {
  const baseClasses = 'animate-pulse bg-slate-800/60 rounded-xl';

  if (variant === 'circle') {
    return <div className={`${baseClasses} rounded-full ${className}`} />;
  }

  if (variant === 'card') {
    return (
      <div className={`p-6 rounded-2xl border border-slate-800 bg-slate-900/40 ${className}`}>
        <div className="h-4 bg-slate-800 rounded w-1/3 mb-4 animate-pulse" />
        <div className="h-8 bg-slate-800/80 rounded w-1/2 mb-3 animate-pulse" />
        <div className="h-3 bg-slate-800/60 rounded w-2/3 animate-pulse" />
      </div>
    );
  }

  return <div className={`${baseClasses} ${className}`} />;
};

export const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      <Skeleton variant="card" />
      <Skeleton variant="card" />
      <Skeleton variant="card" />
      <Skeleton variant="card" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 h-72 rounded-2xl bg-slate-900/40 border border-slate-800 animate-pulse p-6" />
      <div className="h-72 rounded-2xl bg-slate-900/40 border border-slate-800 animate-pulse p-6" />
    </div>
  </div>
);

export default Skeleton;
