/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    orange: '#f35b04',
                    'orange-light': '#f18701',
                    yellow: '#f7b801',
                    purple: '#7678ed',
                    'purple-dark': '#3d348b',
                }
            }
        },
    },
    plugins: [],
}
