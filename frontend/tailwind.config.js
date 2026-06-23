/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        petrol: {
          50:  '#f0f7f9',
          100: '#d9eef3',
          200: '#b1dce6',
          300: '#7cc2d3',
          400: '#45a0b8',
          500: '#2a849e',
          600: '#1e4d5c', // azul-petróleo principal
          700: '#1a3f4c',
          800: '#173340',
          900: '#0f2029',
        },
        areia: {
          50:  '#fdfcf8',
          100: '#f9f5ea',
          200: '#f2e9d0',
          300: '#e8d8af',
          400: '#d4b87a',
          500: '#c09a50',
          600: '#a8823a',
        },
      },
    },
  },
  plugins: [],
};
