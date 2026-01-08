/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                unisa: {
                    'blue': '#08C2EF',
                    'blue-dark': '#0DB1E3',
                    'green': '#76BB21',
                }
            }
        },
    },
    plugins: [],
}
