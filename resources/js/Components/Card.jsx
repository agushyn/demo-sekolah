import React from 'react';
import { cn } from '../Utils/cn';

export function Card({ children, className = '', hover = true, ...props }) {
    return (
        <div
            className={cn(
                'bg-white rounded-2xl border border-slate-200/80 shadow-xs transition-all duration-200 overflow-hidden',
                hover && 'hover:shadow-md hover:border-slate-300',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({ children, className = '', ...props }) {
    return (
        <div
            className={cn('px-6 py-5 border-b border-slate-100 flex flex-col gap-1', className)}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardTitle({ children, className = '', as: Component = 'h3', ...props }) {
    return (
        <Component
            className={cn('text-base sm:text-lg font-bold text-slate-900 tracking-tight', className)}
            {...props}
        >
            {children}
        </Component>
    );
}

export function CardDescription({ children, className = '', ...props }) {
    return (
        <p className={cn('text-xs sm:text-sm text-slate-500', className)} {...props}>
            {children}
        </p>
    );
}

export function CardContent({ children, className = '', ...props }) {
    return (
        <div className={cn('px-6 py-5', className)} {...props}>
            {children}
        </div>
    );
}

export function CardFooter({ children, className = '', ...props }) {
    return (
        <div
            className={cn(
                'px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between gap-4',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export default Card;
