import React, { forwardRef } from 'react';
import { cn } from '../Utils/cn';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(({
    label,
    error,
    helperText,
    options = [],
    placeholder = 'Pilih salah satu...',
    className = '',
    containerClassName = '',
    required = false,
    id,
    children,
    ...props
}, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
        <div className={cn('w-full flex flex-col gap-1.5', containerClassName)}>
            {label && (
                <label
                    htmlFor={selectId}
                    className="text-xs font-semibold text-slate-700 flex items-center gap-1"
                >
                    {label}
                    {required && <span className="text-rose-500">*</span>}
                </label>
            )}
            <div className="relative flex items-center">
                <select
                    ref={ref}
                    id={selectId}
                    required={required}
                    className={cn(
                        'w-full appearance-none rounded-xl border bg-white px-3.5 py-2.5 pr-10 text-sm text-slate-800 transition-all duration-200 shadow-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 disabled:bg-slate-50 disabled:text-slate-400 cursor-pointer',
                        error ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 hover:border-slate-300',
                        className
                    )}
                    {...props}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {options.length > 0
                        ? options.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                  {opt.label}
                              </option>
                          ))
                        : children}
                </select>
                <div className="absolute right-3.5 pointer-events-none text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                </div>
            </div>
            {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
            {!error && helperText && <p className="text-xs text-slate-500">{helperText}</p>}
        </div>
    );
});

Select.displayName = 'Select';

export default Select;
