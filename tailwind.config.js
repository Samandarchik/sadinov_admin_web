/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#D4A857',
          light: '#EFC774',
        },
        bg: '#0E0E10',
        panel: '#16161A',
        card: '#1B1B20',
        cardHi: '#22222A',
        border: '#2A2A33',
        sub: '#A0A0AB',
        muted: '#6D6D78',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.25), 0 1px 2px rgba(0,0,0,0.18)',
      },
    },
  },
  plugins: [],
};
