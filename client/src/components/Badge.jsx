import React from 'react';

export default function Badge({ status, className = '' }) {
  const styles = {
    Available: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    Borrowed: 'bg-amber-50 text-amber-700 border-amber-200/60',
    Pending: 'bg-amber-50 text-amber-700 border-amber-200/60',
    Approved: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
    Rejected: 'bg-rose-50 text-rose-700 border-rose-200/60',
    Returned: 'bg-slate-100 text-slate-700 border-slate-200/60',
    Overdue: 'bg-rose-100 text-rose-800 border-rose-300 font-semibold animate-pulse',
  };

  const currentStyle = styles[status] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${currentStyle} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {status}
    </span>
  );
}
