import React, { forwardRef } from 'react';
import { cn } from '../Utils/cn';

const Input = forwardRef(({
    label,
    error,
    helperText,
    type = 'text',
    className = '',
    containerClassName = '',
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    required = false,
    id,
    ...props
}, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
        <div className={cn('w-full flex flex-col gap-1.5', containerClassName)}>
            {label && (
                <label
                    htmlFor={inputId}
                    className="text-xs font-semibold text-slate-700 flex items-center gap-1"
                >
                    {label}
                    {required && <span className="text-rose-500">*</span>}
                </label>
            )}
            <div className="relative flex items-center">
                {LeftIcon && (
                    <div className="absolute left-3.5 pointer-events-none text-slate-400">
                        <LeftIcon className="w-4 h-4" />
                    </div>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    type={type}
                    required={required}
                    className={cn(
                        'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200 shadow-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 disabled:bg-slate-50 disabled:text-slate-400',
                        LeftIcon ? 'pl-10' : 'pl-3.5',
                        RightIcon ? 'pr-10' : 'pr-3.5',
                        error ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20 text-rose-900' : 'border-slate-200 hover:border-slate-300',
                        className
                    )}
                    {...props}
                />
                {RightIcon && (
                    <div className="absolute right-3.5 pointer-events-none text-slate-400">
                        <RightIcon className="w-4 h-4" />
                    </div>
                )}
            </div>
            {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
            {!error && helperText && <p className="text-xs text-slate-500">{helperText}</p>}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
