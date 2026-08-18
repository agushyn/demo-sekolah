import React from 'react';
import { cn } from '../Utils/cn';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
    currentPage = 1,
    totalPages = 1,
    onPageChange,
    className = '',
}) {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, '...', totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }
        return pages;
    };

    return (
        <nav
            className={cn('flex items-center justify-center gap-1.5 select-none', className)}
            aria-label="Pagination Navigation"
        >
            {/* Prev Button */}
            <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => onPageChange?.(currentPage - 1)}
                className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:pointer-events-none transition-colors shadow-2xs cursor-pointer"
                aria-label="Halaman Sebelumnya"
            >
                <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Numbers */}
            {getPageNumbers().map((page, idx) => {
                if (page === '...') {
                    return (
                        <span
                            key={`ellipsis-${idx}`}
                            className="w-9 h-9 flex items-center justify-center text-slate-400 text-sm"
                        >
                            ...
                        </span>
                    );
                }

                const isActive = page === currentPage;
                return (
                    <button
                        key={`page-${page}`}
                        type="button"
                        onClick={() => onPageChange?.(page)}
                        className={cn(
                            'inline-flex items-center justify-center w-9 h-9 text-sm font-semibold rounded-xl transition-all cursor-pointer',
                            isActive
                                ? 'bg-brand-600 text-white shadow-xs'
                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs'
                        )}
                        aria-current={isActive ? 'page' : undefined}
                    >
                        {page}
                    </button>
                );
            })}

            {/* Next Button */}
            <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => onPageChange?.(currentPage + 1)}
                className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:pointer-events-none transition-colors shadow-2xs cursor-pointer"
                aria-label="Halaman Selanjutnya"
            >
                <ChevronRight className="w-4 h-4" />
            </button>
        </nav>
    );
}
