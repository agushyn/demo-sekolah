import React, { useEffect } from 'react';
import { cn } from '../Utils/cn';
import { X } from 'lucide-react';

export default function Modal({
    isOpen,
    onClose,
    title,
    description,
    children,
    footer,
    size = 'md',
    className = '',
}) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose?.();
            }
        };

        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizes = {
        sm: 'max-w-sm',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-6xl',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal Dialog Card */}
            <div
                className={cn(
                    'relative w-full bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xl z-10 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200',
                    sizes[size],
                    className
                )}
                role="dialog"
                aria-modal="true"
            >
                {/* Header */}
                {(title || description) && (
                    <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between gap-4">
                        <div>
                            {title && (
                                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                                    {title}
                                </h3>
                            )}
                            {description && (
                                <p className="text-xs text-slate-500 mt-1">{description}</p>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                            aria-label="Tutup modal"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Body Content */}
                <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">{children}</div>

                {/* Footer */}
                {footer && (
                    <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-end gap-3 rounded-b-2xl sm:rounded-b-3xl">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
