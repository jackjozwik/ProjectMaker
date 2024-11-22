// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        gray: {
          // Text colors
          50: '#ffffff',
          100: '#fafafa',
          200: '#ececec',    // Your primary text color
          300: '#9b9b9b',    // Your secondary text (155, 155, 155)
          400: '#737373',
          500: '#525252',
          600: '#404040',
          700: '#2f2f2f',    // Your input background
          800: '#212121',    // Your main content background
          900: '#171717',    // Your sidepanel background
        },
      },
    },
  },
  plugins: [],
}