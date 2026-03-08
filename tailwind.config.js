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
          cyan: '#0ea5e9',
          mint: '#00FFAA',
          yellow: '#FFD60A',
          crimson: '#FF2A55',
        },
        zinc: {
          950: '#09090b',
        },
      },
    },
  },
  plugins: [],
};
