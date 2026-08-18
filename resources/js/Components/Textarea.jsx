import React, { forwardRef } from 'react';
import { cn } from '../Utils/cn';

const Textarea = forwardRef(({
    label,
    error,
    helperText,
    rows = 4,
    className = '',
    containerClassName = '',
    required = false,
    id,
    ...props
}, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
        <div className={cn('w-full flex flex-col gap-1.5', containerClassName)}>
            {label && (
                <label
                    htmlFor={textareaId}
                    className="text-xs font-semibold text-slate-700 flex items-center gap-1"
                >
                    {label}
                    {required && <span className="text-rose-500">*</span>}
                </label>
            )}
            <textarea
                ref={ref}
                id={textareaId}
                rows={rows}
                required={required}
                className={cn(
                    'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200 shadow-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 disabled:bg-slate-50 disabled:text-slate-400 resize-y',
                    error ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20 text-rose-900' : 'border-slate-200 hover:border-slate-300',
                    className
                )}
                {...props}
            />
            {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
            {!error && helperText && <p className="text-xs text-slate-500">{helperText}</p>}
        </div>
    );
});

Textarea.displayName = 'Textarea';

export default Textarea;
