/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        clinical: {
          50: '#f8fafb',
          100: '#f0f4f8',
          200: '#dce5f0',
          300: '#c8d5e8',
          400: '#a0b5d8',
          500: '#7895c8',
          600: '#4f75b8',
          700: '#3d5a99',
          800: '#2d437a',
          900: '#1f2d5c',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
