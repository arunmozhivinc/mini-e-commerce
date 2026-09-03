import React from 'react';

const LoadingSpinner = ({ size = 'md', message = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[200px]">
      <div
        className={`animate-spin rounded-full border-brand-200 border-t-brand-600 ${sizeClasses[size]}`}
      />
      {message && <p className="mt-3 text-sm text-slate-500 font-medium">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
