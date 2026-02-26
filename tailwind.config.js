/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        neon: {
          sky: '#38bdf8',
          amber: '#fbbf24',
          fuchsia: '#e879f9',
          pink: '#f4258c',
          cyan: '#0ea5e9',
        },
        zinc: {
          950: '#09090b',
        },
      },
    },
  },
  plugins: [],
};
