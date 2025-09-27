import '../css/app.css';
import './bootstrap';
import './utils/suppressMapErrors';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot, hydrateRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => {
        const allPages = import.meta.glob(['./Pages/**/*.jsx', './Website/**/*.jsx']);
        
        // First try the exact path
        let path = `./Pages/${name}.jsx`;
        if (allPages[path]) {
            return resolvePageComponent(path, allPages);
        }
        
        // Try as a direct Website path  
        path = `./${name}.jsx`;
        if (allPages[path]) {
            return resolvePageComponent(path, allPages);
        }
        
        // Fallback to default resolution
        return resolvePageComponent(`./Pages/${name}.jsx`, allPages);
    },
    setup({ el, App, props }) {
        if (import.meta.env.SSR) {
            hydrateRoot(el, <App {...props} />);
            return;
        }

        createRoot(el).render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});
