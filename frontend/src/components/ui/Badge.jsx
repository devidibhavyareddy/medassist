import React from 'react';

const Badge = ({ children, status, variant, className = '' }) => {
  // Determine variant based on status string if status is passed
  const key = (status || children || '').toString().toLowerCase();

  let style = 'bg-slate-800 text-slate-300 border-slate-700/60';

  if (
    key === 'completed' ||
    key === 'verified' ||
    key === 'released' ||
    key === 'paid' ||
    key === 'active' ||
    variant === 'success'
  ) {
    style = 'bg-emerald-950/50 text-emerald-300 border-emerald-500/30';
  } else if (
    key === 'urgent' ||
    key === 'cancelled' ||
    key === 'noshow' ||
    key === 'inactive' ||
    variant === 'danger'
  ) {
    style = 'bg-rose-950/50 text-rose-300 border-rose-500/30';
  } else if (
    key === 'scheduled' ||
    key === 'processing' ||
    key === 'checkedin' ||
    key === 'inconsultation' ||
    key === 'partiallypaid' ||
    variant === 'warning'
  ) {
    style = 'bg-amber-950/50 text-amber-300 border-amber-500/30';
  } else if (
    key === 'requested' ||
    key === 'ordered' ||
    key === 'samplepending' ||
    key === 'samplecollected' ||
    key === 'pending' ||
    variant === 'info'
  ) {
    style = 'bg-cyan-950/50 text-cyan-300 border-cyan-500/30';
  } else if (key === 'doctor' || key === 'admin') {
    style = 'bg-indigo-950/50 text-indigo-300 border-indigo-500/30';
  } else if (key === 'receptionist' || key === 'labtechnician') {
    style = 'bg-teal-950/50 text-teal-300 border-teal-500/30';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border tracking-wide uppercase ${style} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75 shrink-0" />
      {children || status}
    </span>
  );
};

export default Badge;
