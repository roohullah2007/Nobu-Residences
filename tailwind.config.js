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
                // Headings + body share a Helvetica-style neue/Inter stack so
                // the building detail page reads as one clean sans-serif
                // family. Existing class names (font-space-grotesk,
                // font-red-hat, etc.) are kept as aliases pointing at the
                // same stack to avoid touching dozens of JSX files.
                sans: ['Inter', 'Helvetica Neue', 'Helvetica', 'Arial', ...defaultTheme.fontFamily.sans],
                'work-sans': ['Inter', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
                'space-grotesk': ['Inter', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
                'red-hat': ['Inter', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
                'inter': ['Inter', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
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
