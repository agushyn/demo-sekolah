import React, { useState } from 'react';
import { useTheme } from '../Hooks/useTheme';
import { Palette, Check, X } from 'lucide-react';
import { cn } from '../Utils/cn';

export default function ThemeCustomizer() {
    const [isOpen, setIsOpen] = useState(false);
    const { theme, availableThemes, changeTheme } = useTheme();

    return (
        <div className="fixed bottom-5 right-5 z-40">
            {/* Toggle Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-white text-slate-800 border border-slate-200/90 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 text-xs font-semibold backdrop-blur-md cursor-pointer"
                title="Sesuaikan Warna Branding Sekolah"
            >
                <div className="w-3.5 h-3.5 rounded-full bg-brand-600 ring-2 ring-brand-200" />
                <span className="hidden sm:inline">Tema</span>
                <Palette className="w-4 h-4 text-slate-500" />
            </button>

            {/* Floating Popover Panel */}
            {isOpen && (
                <div className="absolute bottom-12 right-0 w-72 sm:w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 animate-in zoom-in-95 duration-200 z-50">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                        <div className="flex items-center gap-2">
                            <Palette className="w-4 h-4 text-brand-600" />
                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                Pilih Warna Tema
                            </h4>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <p className="text-[11px] text-slate-500 mb-3">
                        Pilih palet warna kesukaan Anda. Tema langsung diaplikasikan ke seluruh antarmuka.
                    </p>

                    <div className="space-y-1.5">
                        {Object.values(availableThemes).map((preset) => {
                            const isSelected = theme === preset.id;
                            return (
                                <button
                                    key={preset.id}
                                    type="button"
                                    onClick={() => {
                                        changeTheme(preset.id);
                                    }}
                                    className={cn(
                                        'w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer',
                                        isSelected
                                            ? 'border-brand-500 bg-brand-50/60 shadow-2xs'
                                            : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-5 h-5 rounded-full border border-white shadow-xs shrink-0"
                                            style={{ backgroundColor: preset.primaryHex }}
                                        />
                                        <div>
                                            <p className="text-xs font-bold text-slate-800 leading-tight">
                                                {preset.name}
                                            </p>
                                            <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                                                {preset.description}
                                            </p>
                                        </div>
                                    </div>
                                    {isSelected && <Check className="w-4 h-4 text-brand-600 shrink-0" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
