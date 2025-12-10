import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import ReactDOMServer from 'react-dom/server';
import { route } from '../../vendor/tightenco/ziggy';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createServer((page) =>
    createInertiaApp({
        page,
        render: ReactDOMServer.renderToString,
        title: (title) => `${title} - ${appName}`,
        resolve: (name) => {
            const allPages = import.meta.glob(['./Pages/**/*.jsx', './Website/**/*.jsx']);

            // If name starts with 'Website/', use it directly
            if (name.startsWith('Website/')) {
                const path = `./${name}.jsx`;
                if (allPages[path]) {
                    return resolvePageComponent(path, allPages);
                }
            }

            // Try the Pages path
            let path = `./Pages/${name}.jsx`;
            if (allPages[path]) {
                return resolvePageComponent(path, allPages);
            }

            // Fallback to default resolution
            return resolvePageComponent(`./Pages/${name}.jsx`, allPages);
        },
        setup: ({ App, props }) => {
            global.route = (name, params, absolute) =>
                route(name, params, absolute, {
                    ...page.props.ziggy,
                    location: new URL(page.props.ziggy.location),
                });

            return <App {...props} />;
        },
    }),
);
