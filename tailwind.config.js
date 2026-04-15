/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        orange:    { rwc: '#E8401C', light: '#FF6B45', dark: '#9E2A0E' },
        teal:      { rwc: '#00B4A0', light: '#00D4BC' },
        lime:      { rwc: '#C8D430' },
        creme:     { DEFAULT: '#F5EDD8', light: '#FAF5EC', mid: '#EDE3CC' },
        warm:      { gray: '#7A6E65', black: '#1A1208' },
        phase: {
          poules:    '#00B4A0',
          huitiemes: '#6A1B9A',
          quarts:    '#E8401C',
          demis:     '#9E2A0E',
          finale:    '#C8D430',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
