import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    // The site has no dark theme. The Breeze-scaffold components
    // (TextInput, PrimaryButton, SecondaryButton, Modal, ...) ship with
    // dark: variants, and Tailwind's default darkMode ('media') was
    // activating them whenever the visitor's OS was in dark mode —
    // black inputs on the light admin pages. 'class' gates all dark:
    // variants behind a `.dark` class that is never added anywhere,
    // so they compile but never apply.
    darkMode: 'class',

    theme: {
        extend: {
            colors: {
                // Home-page accent scale. Named "gold" for historical reasons,
                // but remapped to the brand navy blue used in the site header
                // (#041B52) so the home page accents match the header instead of
                // using yellow/gold.
                gold: {
                    50: '#EAF1FB',
                    200: '#AEC4EC',
                    300: '#7E9EDC',
                    400: '#4E72C0',
                    500: '#274C92',
                    600: '#15336B',
                    700: '#041B52',
                },
            },
            fontFamily: {
                'playfair': ['"Playfair Display"', 'Georgia', 'serif'],
                // Single Helvetica stack across the whole app. Arial is
                // the canonical fallback for systems missing Helvetica
                // (Windows/Linux). The legacy class names below are kept
                // as aliases pointing at the same stack so the existing
                // JSX doesn't need touching.
                sans: ['Helvetica', 'Arial', ...defaultTheme.fontFamily.sans],
                'work-sans': ['Helvetica', 'Arial', 'sans-serif'],
                'space-grotesk': ['Helvetica', 'Arial', 'sans-serif'],
                'red-hat': ['Helvetica', 'Arial', 'sans-serif'],
                'inter': ['Helvetica', 'Arial', 'sans-serif'],
            },
        },
    },

    plugins: [
        forms,
        function({ addUtilities }) {
            addUtilities({
                '.scrollbar-hide': {
                    /* IE and Edge */
                    '-ms-overflow-style': 'none',
                    /* Firefox */
                    'scrollbar-width': 'none',
                    /* Safari and Chrome */
                    '&::-webkit-scrollbar': {
                        display: 'none'
                    }
                }
            })
        }
    ],
};
