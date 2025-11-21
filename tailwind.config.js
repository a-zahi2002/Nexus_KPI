/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        maroon: {
          50: '#fdf2f2',
          100: '#fce4e4',
          200: '#f9caca',
          300: '#f4a4a4',
          400: '#ec7171',
          500: '#e04444',
          600: '#b80000',
          700: '#9a0000',
          800: '#800000',
          900: '#6b0000',
        },
        gold: {
          50: '#fffef0',
          100: '#fffacd',
          200: '#fff59b',
          300: '#fff069',
          400: '#ffe737',
          500: '#ffd700',
          600: '#ccac00',
          700: '#998100',
          800: '#665600',
          900: '#332b00',
        },
        neon: {
          blue: '#00f3ff',
          purple: '#bc13fe',
          pink: '#ff00ff',
        },
        dark: {
          bg: '#0a0a0f',
          surface: '#13131f',
          border: '#2a2a35',
        }
      },
    },
  },
  plugins: [],
};
