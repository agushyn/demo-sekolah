import React from 'react';
import { cn } from '../Utils/cn';
import { Loader2 } from 'lucide-react';

export default function LoadingState({
    message = 'Memuat data...',
    type = 'spinner',
    size = 'md',
    className = '',
}) {
    if (type === 'skeleton') {
        return (
            <div className={cn('w-full space-y-4 animate-pulse', className)}>
                <div className="h-6 bg-slate-200 rounded-xl w-1/3" />
                <div className="h-28 bg-slate-200 rounded-2xl w-full" />
                <div className="grid grid-cols-3 gap-4">
                    <div className="h-20 bg-slate-200 rounded-xl" />
                    <div className="h-20 bg-slate-200 rounded-xl" />
                    <div className="h-20 bg-slate-200 rounded-xl" />
                </div>
            </div>
        );
    }

    const sizes = {
        sm: 'w-5 h-5 text-brand-600',
        md: 'w-8 h-8 text-brand-600',
        lg: 'w-12 h-12 text-brand-600',
    };

    return (
        <div
            className={cn(
                'py-12 px-6 flex flex-col items-center justify-center text-center gap-3',
                className
            )}
        >
            <Loader2 className={cn('animate-spin', sizes[size])} />
            {message && <p className="text-xs sm:text-sm font-medium text-slate-500">{message}</p>}
        </div>
    );
}
