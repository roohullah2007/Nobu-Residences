import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
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
