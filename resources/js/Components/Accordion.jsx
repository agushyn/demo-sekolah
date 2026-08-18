import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';

export default function Accordion({
    items = [],
    allowMultiple = false,
    className = '',
}) {
    const [openIndices, setOpenIndices] = useState([0]); // Open first by default

    const toggleIndex = (index) => {
        if (allowMultiple) {
            if (openIndices.includes(index)) {
                setOpenIndices(openIndices.filter((i) => i !== index));
            } else {
                setOpenIndices([...openIndices, index]);
            }
        } else {
            setOpenIndices(openIndices.includes(index) ? [] : [index]);
        }
    };

    return (
        <div className={clsx('space-y-3', className)}>
            {items.map((item, index) => {
                const isOpen = openIndices.includes(index);
                return (
                    <div
                        key={index}
                        className={clsx(
                            'rounded-2xl border transition-all duration-200 overflow-hidden bg-white',
                            isOpen
                                ? 'border-brand-200/90 shadow-sm ring-1 ring-brand-500/10'
                                : 'border-slate-200/80 hover:border-slate-300'
                        )}
                    >
                        <button
                            type="button"
                            onClick={() => toggleIndex(index)}
                            className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 cursor-pointer select-none"
                            aria-expanded={isOpen}
                        >
                            <span
                                className={clsx(
                                    'text-sm font-bold transition-colors',
                                    isOpen ? 'text-brand-700' : 'text-slate-900 hover:text-brand-600'
                                )}
                            >
                                {item.q || item.title}
                            </span>
                            <div
                                className={clsx(
                                    'w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200',
                                    isOpen
                                        ? 'bg-brand-50 text-brand-600 rotate-180'
                                        : 'bg-slate-100 text-slate-500'
                                )}
                            >
                                <ChevronDown className="w-4 h-4" />
                            </div>
                        </button>

                        {isOpen && (
                            <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 animate-in fade-in duration-150">
                                {item.a || item.content}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
