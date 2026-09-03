import React, { forwardRef } from 'react';

const Input = forwardRef(
  ({ label, error, helperText, icon: Icon, className = '', id, ...props }, ref) => {
    const inputId = id || props.name || Math.random().toString(36).substring(7);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative rounded-xl shadow-sm">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Icon size={18} />
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full bg-white border text-sm rounded-xl py-2.5 px-3.5 transition-colors duration-150 outline-none
              ${Icon ? 'pl-10' : ''}
              ${
                error
                  ? 'border-rose-400 text-rose-900 focus:ring-2 focus:ring-rose-200 focus:border-rose-500'
                  : 'border-slate-200 text-slate-900 focus:ring-2 focus:ring-brand-100 focus:border-brand-500'
              }
              ${className}
            `}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>}
        {helperText && !error && <p className="mt-1 text-xs text-slate-500">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
