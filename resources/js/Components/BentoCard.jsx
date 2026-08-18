import React from 'react';
import { cn } from '../Utils/cn';

export default function BentoCard({
    children,
    colSpan = 'col-span-12 md:col-span-6 lg:col-span-4',
    rowSpan = '',
    variant = 'default',
    title,
    description,
    badge,
    icon: Icon,
    iconColor = 'text-brand-600 bg-brand-50 border-brand-100',
    className = '',
    contentClassName = '',
    headerAction,
    glow = false,
    ...props
}) {
    const variants = {
        default: 'bg-white border-slate-200/80 hover:border-slate-300 text-slate-800',
        glass: 'bg-white/80 backdrop-blur-md border-white/60 hover:bg-white text-slate-800',
        brand: 'bg-gradient-to-br from-brand-600 to-brand-800 text-white border-brand-500 shadow-brand-500/10',
        softBrand: 'bg-brand-50/60 border-brand-100 text-slate-800',
        dark: 'bg-slate-900 border-slate-800 text-white shadow-xl',
        gradient: 'bg-gradient-to-br from-white via-slate-50 to-brand-50/30 border-slate-200/80 text-slate-800',
    };

    return (
        <div
            className={cn(
                'bento-card group rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 relative',
                colSpan,
                rowSpan,
                variants[variant],
                glow && 'before:absolute before:-inset-px before:rounded-2xl before:bg-gradient-to-r before:from-brand-500/20 before:to-emerald-500/20 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:-z-10',
                className
            )}
            {...props}
        >
            {/* Header / Meta */}
            {(Icon || badge || title || headerAction) && (
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                        {Icon && (
                            <div
                                className={cn(
                                    'w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 transition-transform duration-300 group-hover:scale-105',
                                    variant === 'brand' || variant === 'dark'
                                        ? 'bg-white/10 text-white border-white/10'
                                        : iconColor
                                )}
                            >
                                <Icon className="w-5 h-5" />
                            </div>
                        )}
                        <div>
                            {badge && (
                                <span
                                    className={cn(
                                        'inline-block text-[11px] font-semibold tracking-wide uppercase px-2.5 py-0.5 rounded-full mb-1 border',
                                        variant === 'brand'
                                            ? 'bg-white/20 text-white border-white/20'
                                            : 'bg-brand-50 text-brand-700 border-brand-200/60'
                                    )}
                                >
                                    {badge}
                                </span>
                            )}
                            {title && (
                                <h3
                                    className={cn(
                                        'text-base sm:text-lg font-bold tracking-tight',
                                        variant === 'brand' || variant === 'dark' ? 'text-white' : 'text-slate-900'
                                    )}
                                >
                                    {title}
                                </h3>
                            )}
                        </div>
                    </div>
                    {headerAction && <div>{headerAction}</div>}
                </div>
            )}

            {/* Description if provided */}
            {description && (
                <p
                    className={cn(
                        'text-xs sm:text-sm mb-4 leading-relaxed',
                        variant === 'brand' || variant === 'dark' ? 'text-slate-200' : 'text-slate-600'
                    )}
                >
                    {description}
                </p>
            )}

            {/* Main content slot */}
            {children && <div className={cn('w-full flex-1', contentClassName)}>{children}</div>}
        </div>
    );
}
