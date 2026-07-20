import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import ReactDOMServer from 'react-dom/server';
import { route } from '../../vendor/tightenco/ziggy';

const appName = import.meta.env.VITE_APP_NAME || 'Nobu Residences';

createServer((page) =>
    createInertiaApp({
        page,
        render: ReactDOMServer.renderToString,
        // Page titles are already complete (each page includes its own site
        // name) — appending the APP name here stamped "- Nobu Residences"
        // onto every tenant site's title tag.
        title: (title) => title || appName,
        resolve: (name) => {
            const allPages = import.meta.glob(['./Pages/**/*.jsx', './Website/**/*.jsx']);

            // Determine the correct path based on name
            const path = name.startsWith('Website/')
                ? `./${name}.jsx`
                : `./Pages/${name}.jsx`;

            return resolvePageComponent(path, allPages);
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
