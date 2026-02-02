/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                brand: {
                    orange: '#f35b04',
                    'orange-light': '#f18701',
                    yellow: '#f7b801',
                    purple: '#7678ed',
                    'purple-dark': '#3d348b',
                },
                primary: {
                    DEFAULT: '#8B5CF6', // Vibrant Violet
                    hover: '#7C3AED',
                    light: '#A78BFA',
                },
                secondary: {
                    DEFAULT: '#4C1D95', // Deep Indigo
                    light: '#5B21B6',
                },
                accent: {
                    DEFAULT: '#06B6D4', // Electric Cyan
                    hover: '#0891B2',
                },
                bkg: {
                    DEFAULT: '#F9FAFB', // Ghost White
                    darker: '#F3F4F6',
                },
                'text-main': {
                    DEFAULT: '#1F2937', // Slate Gray
                    light: '#4B5563',
                    lighter: '#9CA3AF',
                },
                custom: {
                    celadon: '#b8d8ba',
                    beige: '#d9dbbc',
                    'soft-apricot': '#fcddbc',
                    'cotton-candy': '#ef959d',
                    'taupe-grey': '#69585f',
                },
                dark: {
                    surface: '#1F2937', // gray-800
                    bg: '#111827',      // gray-900
                    border: '#374151',  // gray-700
                }
            }
        },
    },
    plugins: [],
}
