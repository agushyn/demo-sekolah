import React from 'react';
import { cn } from '../Utils/cn';
import { Loader2 } from 'lucide-react';

export default function Button({
    children,
    type = 'button',
    variant = 'primary',
    size = 'md',
    className = '',
    disabled = false,
    loading = false,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    onClick,
    ...props
}) {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none cursor-pointer';

    const variants = {
        primary: 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm shadow-brand-500/20 hover:shadow-md hover:shadow-brand-500/30 focus-visible:ring-brand-500 rounded-xl',
        secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200/80 focus-visible:ring-slate-400 rounded-xl',
        outline: 'bg-transparent hover:bg-brand-50 text-brand-600 border border-brand-300 hover:border-brand-500 focus-visible:ring-brand-500 rounded-xl',
        ghost: 'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 focus-visible:ring-slate-400 rounded-xl',
        danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-500/20 focus-visible:ring-rose-500 rounded-xl',
        glass: 'bg-white/80 hover:bg-white text-slate-800 backdrop-blur-md border border-white/60 shadow-sm hover:shadow-md focus-visible:ring-brand-500 rounded-xl',
    };

    const sizes = {
        sm: 'text-xs px-3 py-1.5 gap-1.5 rounded-lg',
        md: 'text-sm px-4 py-2.5 gap-2 rounded-xl',
        lg: 'text-base px-6 py-3.5 gap-2.5 rounded-2xl font-semibold',
        icon: 'p-2 rounded-xl',
    };

    return (
        <button
            type={type}
            disabled={disabled || loading}
            onClick={onClick}
            className={cn(baseStyles, variants[variant], sizes[size], className)}
            {...props}
        >
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
            ) : LeftIcon ? (
                <LeftIcon className="w-4 h-4 shrink-0" />
            ) : null}
            <span>{children}</span>
            {!loading && RightIcon && <RightIcon className="w-4 h-4 shrink-0" />}
        </button>
    );
}
