import './bootstrap';
import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './Utils/theme';

// Initialize school branding theme on startup
if (typeof window !== 'undefined') {
    initializeTheme();
}

const appName = import.meta.env.VITE_APP_NAME || 'Portal Sekolah';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => {
        const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true });
        const page = pages[`./Pages/${name}.jsx`];
        if (!page) {
            throw new Error(`Page "./Pages/${name}.jsx" not found in import.meta.glob`);
        }
        return page;
    },
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#4f46e5',
        showSpinner: true,
    },
});
