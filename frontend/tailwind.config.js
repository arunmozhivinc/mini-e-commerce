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
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          900: '#0c4a6e',
        },
        fk: {
          blue: '#2874f0',
          'blue-dark': '#1a56db',
          'blue-deep': '#0c2340',
          'blue-light': '#f0f5ff',
          yellow: '#ff9f00',
          'yellow-hover': '#f39700',
          orange: '#fb641b',
          'orange-hover': '#e65100',
          green: '#388e3c',
          'green-light': '#e8f5e9',
          'green-dark': '#2e7d32',
          gray: '#878787',
          'gray-light': '#f1f3f6',
          'gray-border': '#e0e0e0',
          bg: '#f1f3f6',
        }
      }
    },
  },
  plugins: [],
}
