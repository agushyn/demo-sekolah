import React from 'react';
import { cn } from '../Utils/cn';

export default function Badge({
    children,
    variant = 'brand',
    size = 'md',
    dot = false,
    className = '',
    ...props
}) {
    const variants = {
        brand: 'bg-brand-50 text-brand-700 border-brand-200/80',
        success: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
        warning: 'bg-amber-50 text-amber-700 border-amber-200/80',
        danger: 'bg-rose-50 text-rose-700 border-rose-200/80',
        neutral: 'bg-slate-100 text-slate-700 border-slate-200',
        purple: 'bg-purple-50 text-purple-700 border-purple-200/80',
        outline: 'bg-transparent text-slate-700 border-slate-300',
    };

    const dotColors = {
        brand: 'bg-brand-500',
        success: 'bg-emerald-500',
        warning: 'bg-amber-500',
        danger: 'bg-rose-500',
        neutral: 'bg-slate-400',
        purple: 'bg-purple-500',
        outline: 'bg-slate-500',
    };

    const sizes = {
        sm: 'text-[11px] px-2 py-0.5 gap-1.5',
        md: 'text-xs px-2.5 py-1 gap-1.5',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center font-medium rounded-full border transition-colors select-none',
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0 animate-pulse', dotColors[variant])} />}
            <span>{children}</span>
        </span>
    );
}
