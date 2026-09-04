import React from 'react';

const Badge = ({ status = 'pending', children, className = '' }) => {
  const normalized = (status || '').toLowerCase();

  const styles = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
    processing: 'bg-purple-50 text-purple-700 border-purple-200',
    shipped: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
    failed: 'bg-rose-50 text-rose-700 border-rose-200',
    admin: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    customer: 'bg-slate-50 text-slate-700 border-slate-200',
    rating: 'bg-[#388e3c] text-white border-transparent font-bold',
    discount: 'bg-emerald-50 text-[#388e3c] border-emerald-200 font-bold',
    deal: 'bg-amber-500 text-white border-transparent font-bold',
    assured: 'bg-blue-50 text-[#2874f0] border-blue-200 font-semibold',
  };

  const currentStyle = styles[normalized] || 'bg-slate-50 text-slate-700 border-slate-200';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border capitalize ${currentStyle} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70" />
      {children || status}
    </span>
  );
};

export default Badge;
