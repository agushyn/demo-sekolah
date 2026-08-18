import { useState, useEffect } from 'react';
import { getCurrentTheme, setTheme as applyTheme, THEME_PRESETS } from '../Utils/theme';

export function useTheme() {
    const [theme, setLocalTheme] = useState(getCurrentTheme());

    useEffect(() => {
        const handleThemeChange = (e) => {
            setLocalTheme(e.detail);
        };

        window.addEventListener('schid:theme-changed', handleThemeChange);
        return () => window.removeEventListener('schid:theme-changed', handleThemeChange);
    }, []);

    const changeTheme = (newTheme) => {
        applyTheme(newTheme);
        setLocalTheme(newTheme);
    };

    return {
        theme,
        currentPreset: THEME_PRESETS[theme] || THEME_PRESETS.indigo,
        availableThemes: THEME_PRESETS,
        changeTheme,
    };
}
