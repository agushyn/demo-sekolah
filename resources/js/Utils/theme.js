/**
 * School Branding & Theme Configuration Engine
 * Allows effortless customization of the primary school colors.
 */

export const THEME_PRESETS = {
    indigo: {
        id: 'indigo',
        name: 'Nusantara Indigo',
        description: 'Modern, berwibawa & prestisius',
        primaryHex: '#4f46e5',
        colors: {
            '--brand-50': '#eef2ff',
            '--brand-100': '#e0e7ff',
            '--brand-200': '#c7d2fe',
            '--brand-300': '#a5b4fc',
            '--brand-400': '#818cf8',
            '--brand-500': '#6366f1',
            '--brand-600': '#4f46e5',
            '--brand-700': '#4338ca',
            '--brand-800': '#3730a3',
            '--brand-900': '#312e81',
            '--brand-950': '#1e1b4b',
        },
    },
    emerald: {
        id: 'emerald',
        name: 'Emerald Academic',
        description: 'Segar, islami & berkarakter lingkungan',
        primaryHex: '#059669',
        colors: {
            '--brand-50': '#ecfdf5',
            '--brand-100': '#d1fae5',
            '--brand-200': '#a7f3d0',
            '--brand-300': '#6ee7b7',
            '--brand-400': '#34d399',
            '--brand-500': '#10b981',
            '--brand-600': '#059669',
            '--brand-700': '#047857',
            '--brand-800': '#065f46',
            '--brand-900': '#064e3b',
            '--brand-950': '#022c22',
        },
    },
    sapphire: {
        id: 'sapphire',
        name: 'Sapphire Blue',
        description: 'Klasik, terpercaya & profesional',
        primaryHex: '#0284c7',
        colors: {
            '--brand-50': '#f0f9ff',
            '--brand-100': '#e0f2fe',
            '--brand-200': '#bae6fd',
            '--brand-300': '#7dd3fc',
            '--brand-400': '#38bdf8',
            '--brand-500': '#0ea5e9',
            '--brand-600': '#0284c7',
            '--brand-700': '#0369a1',
            '--brand-800': '#075985',
            '--brand-900': '#0c4a6e',
            '--brand-950': '#082f49',
        },
    },
    violet: {
        id: 'violet',
        name: 'Royal Violet',
        description: 'Kreatif, inovatif & visioner',
        primaryHex: '#7c3aed',
        colors: {
            '--brand-50': '#f5f3ff',
            '--brand-100': '#ede9fe',
            '--brand-200': '#ddd6fe',
            '--brand-300': '#c4b5fd',
            '--brand-400': '#a78bfa',
            '--brand-500': '#8b5cf6',
            '--brand-600': '#7c3aed',
            '--brand-700': '#6d28d9',
            '--brand-800': '#5b21b6',
            '--brand-900': '#4c1d95',
            '--brand-950': '#2e1065',
        },
    },
    amber: {
        id: 'amber',
        name: 'Golden Amber',
        description: 'Hangat, dinamis & penuh semangat',
        primaryHex: '#d97706',
        colors: {
            '--brand-50': '#fffbeb',
            '--brand-100': '#fef3c7',
            '--brand-200': '#fde68a',
            '--brand-300': '#fcd34d',
            '--brand-400': '#fbbf24',
            '--brand-500': '#f59e0b',
            '--brand-600': '#d97706',
            '--brand-700': '#b45309',
            '--brand-800': '#92400e',
            '--brand-900': '#78350f',
            '--brand-950': '#451a03',
        },
    },
    ruby: {
        id: 'ruby',
        name: 'Crimson Ruby',
        description: 'Tegas, berani & berprestasi tinggi',
        primaryHex: '#e11d48',
        colors: {
            '--brand-50': '#fff1f2',
            '--brand-100': '#ffe4e6',
            '--brand-200': '#fecdd3',
            '--brand-300': '#fda4af',
            '--brand-400': '#fb7185',
            '--brand-500': '#f43f5e',
            '--brand-600': '#e11d48',
            '--brand-700': '#be123c',
            '--brand-800': '#9f1239',
            '--brand-900': '#881337',
            '--brand-950': '#4c0519',
        },
    },
};

const STORAGE_KEY = 'schid_brand_theme';

export function getCurrentTheme() {
    if (typeof window === 'undefined') return 'indigo';
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved && THEME_PRESETS[saved] ? saved : 'indigo';
}

export function setTheme(themeKey) {
    if (typeof window === 'undefined') return;
    const theme = THEME_PRESETS[themeKey] || THEME_PRESETS.indigo;
    const root = document.documentElement;

    Object.entries(theme.colors).forEach(([property, value]) => {
        root.style.setProperty(property, value);
    });

    localStorage.setItem(STORAGE_KEY, theme.id);
    window.dispatchEvent(new CustomEvent('schid:theme-changed', { detail: theme.id }));
}

export function initializeTheme() {
    const current = getCurrentTheme();
    setTheme(current);
}
