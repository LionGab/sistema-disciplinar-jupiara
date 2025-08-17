/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        military: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0891b2',
          600: '#0e7490',
          700: '#0f766e',
          800: '#155e75',
          900: '#164e63',
        }
      }
    },
  },
  plugins: [],
}