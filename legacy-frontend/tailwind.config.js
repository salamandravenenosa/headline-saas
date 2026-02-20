/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            boxShadow: {
                'vibe': '0 10px 40px rgba(37, 99, 235, 0.4)',
            }
        },
    },
    plugins: [],
}
