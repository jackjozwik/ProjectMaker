/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gray: {
          50: '#ffffff',
          100: '#fafafa',
          200: '#ececec',
          300: '#9b9b9b',
          400: '#737373',
          500: '#525252',
          600: '#404040',
          700: '#2f2f2f',
          800: '#212121',
          900: '#171717',
        },
      },
    },
  },
  plugins: [],
};