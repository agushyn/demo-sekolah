import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../Utils/cn';

/**
 * Robust, accessible, Portal-based Dropdown component with automatic viewport collision & flipping.
 * Avoids any parent container `overflow-hidden` or stacking context clipping issues.
 */
export default function Dropdown({
    isOpen: controlledIsOpen,
    onOpenChange,
    trigger,
    children,
    align = 'end', // 'start' | 'center' | 'end'
    side = 'bottom', // 'bottom' | 'top'
    sideOffset = 8,
    collisionPadding = 12,
    className = '',
    closeOnSelect = true,
}) {
    const [uncontrolledIsOpen, setUncontrolledIsOpen] = useState(false);
    const isControlled = controlledIsOpen !== undefined;
    const isOpen = isControlled ? controlledIsOpen : uncontrolledIsOpen;

    const setIsOpen = useCallback(
        (value) => {
            if (!isControlled) {
                setUncontrolledIsOpen(value);
            }
            onOpenChange?.(value);
        },
        [isControlled, onOpenChange]
    );

    const triggerRef = useRef(null);
    const menuRef = useRef(null);
    const [coords, setCoords] = useState({ top: 0, left: 0, actualSide: side });

    const updatePosition = useCallback(() => {
        if (!triggerRef.current) return;

        const rect = triggerRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const menuEl = menuRef.current;
        const menuWidth = menuEl ? menuEl.offsetWidth : 240;
        const menuHeight = menuEl ? menuEl.offsetHeight : 140;

        // Vertical collision check: determine whether to flip side
        let effectiveSide = side;
        const spaceBelow = viewportHeight - rect.bottom - sideOffset - collisionPadding;
        const spaceAbove = rect.top - sideOffset - collisionPadding;

        if (side === 'bottom' && spaceBelow < menuHeight && spaceAbove > spaceBelow) {
            effectiveSide = 'top';
        } else if (side === 'top' && spaceAbove < menuHeight && spaceBelow > spaceAbove) {
            effectiveSide = 'bottom';
        }

        // Compute Top position
        let top = 0;
        if (effectiveSide === 'bottom') {
            top = rect.bottom + sideOffset;
        } else {
            top = rect.top - menuHeight - sideOffset;
        }

        // Compute Left position based on alignment
        let left = 0;
        if (align === 'start') {
            left = rect.left;
        } else if (align === 'center') {
            left = rect.left + (rect.width - menuWidth) / 2;
        } else {
            // align === 'end'
            left = rect.right - menuWidth;
        }

        // Horizontal collision clamping
        if (left + menuWidth > viewportWidth - collisionPadding) {
            left = viewportWidth - menuWidth - collisionPadding;
        }
        if (left < collisionPadding) {
            left = collisionPadding;
        }

        setCoords({ top, left, actualSide: effectiveSide });
    }, [side, align, sideOffset, collisionPadding]);

    // Update position whenever opened, resized, or scrolled
    useEffect(() => {
        if (!isOpen) return;

        updatePosition();

        const handleResize = () => updatePosition();
        const handleScroll = () => updatePosition();

        window.addEventListener('resize', handleResize);
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleScroll);
        };
    }, [isOpen, updatePosition]);

    // Close on click outside
    useEffect(() => {
        if (!isOpen) return;

        const handleMouseDown = (e) => {
            if (
                triggerRef.current?.contains(e.target) ||
                menuRef.current?.contains(e.target)
            ) {
                return;
            }
            setIsOpen(false);
        };

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
                triggerRef.current?.focus();
            }
        };

        document.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, setIsOpen]);

    const handleItemClick = (e) => {
        if (closeOnSelect) {
            setIsOpen(false);
        }
    };

    return (
        <div className="inline-block">
            {/* Trigger element wrapper */}
            <div
                ref={triggerRef}
                onClick={() => setIsOpen(!isOpen)}
                aria-haspopup="true"
                aria-expanded={isOpen}
                className="cursor-pointer"
            >
                {typeof trigger === 'function' ? trigger({ isOpen }) : trigger}
            </div>

            {/* Portal Menu rendered in document.body */}
            {isOpen &&
                typeof document !== 'undefined' &&
                createPortal(
                    <div
                        ref={menuRef}
                        style={{
                            position: 'fixed',
                            top: `${coords.top}px`,
                            left: `${coords.left}px`,
                            zIndex: 100,
                        }}
                        onClick={handleItemClick}
                        role="menu"
                        aria-orientation="vertical"
                        className={cn(
                            'min-w-[14rem] bg-white rounded-2xl shadow-2xl border border-slate-200/90 py-2 text-slate-800 animate-in fade-in zoom-in-95 duration-150 focus:outline-hidden',
                            coords.actualSide === 'bottom'
                                ? 'slide-in-from-top-2'
                                : 'slide-in-from-bottom-2',
                            className
                        )}
                    >
                        {children}
                    </div>,
                    document.body
                )}
        </div>
    );
}

/**
 * Dropdown Item Component
 */
Dropdown.Item = function DropdownItem({
    children,
    onClick,
    icon: Icon,
    iconColor = 'text-indigo-600 bg-indigo-50',
    className = '',
    title,
    description,
    danger = false,
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            role="menuitem"
            className={cn(
                'w-full text-left flex items-start gap-3 px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer',
                danger
                    ? 'text-rose-700 hover:bg-rose-50'
                    : 'text-slate-800 hover:bg-slate-50',
                className
            )}
        >
            {Icon && (
                <div
                    className={cn(
                        'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
                        danger ? 'bg-rose-100 text-rose-600' : iconColor
                    )}
                >
                    <Icon className="w-4 h-4" />
                </div>
            )}
            <div className="space-y-0.5 min-w-0">
                {title && (
                    <p
                        className={cn(
                            'font-bold truncate',
                            danger ? 'text-rose-700' : 'text-slate-900'
                        )}
                    >
                        {title}
                    </p>
                )}
                {description && (
                    <p className="text-[10px] text-slate-400 font-normal leading-tight">
                        {description}
                    </p>
                )}
                {!title && !description && children}
            </div>
        </button>
    );
};

/**
 * Dropdown Divider Component
 */
Dropdown.Divider = function DropdownDivider() {
    return <div className="h-px bg-slate-100 my-1.5" role="separator" />;
};
