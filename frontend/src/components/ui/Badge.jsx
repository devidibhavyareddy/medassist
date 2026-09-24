import React from 'react';

const Badge = ({ children, status, variant, className = '' }) => {
  // Determine variant based on status string if status is passed
  const key = (status || children || '').toString().toLowerCase();

  let style = 'bg-slate-100 text-slate-700 border-slate-200';

  if (
    key === 'completed' ||
    key === 'verified' ||
    key === 'released' ||
    key === 'paid' ||
    key === 'active' ||
    variant === 'success'
  ) {
    style = 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold';
  } else if (
    key === 'urgent' ||
    key === 'cancelled' ||
    key === 'noshow' ||
    key === 'inactive' ||
    variant === 'danger'
  ) {
    style = 'bg-rose-50 text-rose-700 border-rose-200 font-semibold';
  } else if (
    key === 'scheduled' ||
    key === 'processing' ||
    key === 'checkedin' ||
    key === 'inconsultation' ||
    key === 'partiallypaid' ||
    variant === 'warning'
  ) {
    style = 'bg-amber-50 text-amber-800 border-amber-200 font-semibold';
  } else if (
    key === 'requested' ||
    key === 'ordered' ||
    key === 'samplepending' ||
    key === 'samplecollected' ||
    key === 'pending' ||
    variant === 'info'
  ) {
    style = 'bg-sky-50 text-sky-700 border-sky-200 font-semibold';
  } else if (key === 'doctor' || key === 'admin') {
    style = 'bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold';
  } else if (key === 'receptionist' || key === 'labtechnician') {
    style = 'bg-teal-50 text-teal-700 border-teal-200 font-semibold';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border tracking-wide uppercase shadow-2xs ${style} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 shrink-0" />
      {children || status}
    </span>
  );
};

export default Badge;
