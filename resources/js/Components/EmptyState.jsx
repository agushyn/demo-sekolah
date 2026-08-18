import React from 'react';
import { cn } from '../Utils/cn';
import { Inbox } from 'lucide-react';

export default function EmptyState({
    icon: Icon = Inbox,
    title = 'Belum ada data',
    description = 'Data atau aktivitas belum tersedia saat ini.',
    action,
    className = '',
}) {
    return (
        <div
            className={cn(
                'rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-8 sm:p-12 text-center flex flex-col items-center justify-center',
                className
            )}
        >
            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-400 mb-4">
                <Icon className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">{title}</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mb-5">{description}</p>
            {action && <div>{action}</div>}
        </div>
    );
}
