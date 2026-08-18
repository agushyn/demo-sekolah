import React, { useState } from 'react';
import { cn } from '../Utils/cn';
import { Info, CheckCircle2, AlertTriangle, AlertCircle, X } from 'lucide-react';

export default function Alert({
    title,
    children,
    variant = 'info',
    dismissible = false,
    onDismiss,
    className = '',
    icon: CustomIcon,
}) {
    const [dismissed, setDismissed] = useState(false);

    if (dismissed) return null;

    const handleDismiss = () => {
        setDismissed(true);
        onDismiss?.();
    };

    const variants = {
        info: {
            container: 'bg-brand-50/80 border-brand-200 text-brand-900',
            iconColor: 'text-brand-600',
            Icon: Info,
        },
        success: {
            container: 'bg-emerald-50/80 border-emerald-200 text-emerald-900',
            iconColor: 'text-emerald-600',
            Icon: CheckCircle2,
        },
        warning: {
            container: 'bg-amber-50/80 border-amber-200 text-amber-900',
            iconColor: 'text-amber-600',
            Icon: AlertTriangle,
        },
        danger: {
            container: 'bg-rose-50/80 border-rose-200 text-rose-900',
            iconColor: 'text-rose-600',
            Icon: AlertCircle,
        },
    };

    const currentVariant = variants[variant] || variants.info;
    const IconComponent = CustomIcon || currentVariant.Icon;

    return (
        <div
            className={cn(
                'rounded-2xl border p-4 flex items-start gap-3.5 transition-all shadow-xs',
                currentVariant.container,
                className
            )}
            role="alert"
        >
            <div className={cn('shrink-0 mt-0.5', currentVariant.iconColor)}>
                <IconComponent className="w-5 h-5" />
            </div>

            <div className="flex-1 text-sm">
                {title && <h4 className="font-semibold text-slate-900 mb-0.5">{title}</h4>}
                <div className="text-slate-700 leading-relaxed text-xs sm:text-sm">{children}</div>
            </div>

            {dismissible && (
                <button
                    type="button"
                    onClick={handleDismiss}
                    className="shrink-0 p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-black/5 transition-colors cursor-pointer"
                    aria-label="Tutup pemberitahuan"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}
