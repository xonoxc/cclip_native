/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,jsx,ts,tsx}",
        "./components/**/*.{ts,tsx}",
        "./node_modules/@rnr/**/*.{ts,tsx}",
    ],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {},
    },
    plugins: [require("tailwindcss-animate")],
}
