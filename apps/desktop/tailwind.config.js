/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'irish-cream': {
          bg: '#E8DFD1',
          accent: '#8B735B',
          dark: '#5D4D3F',
          light: '#F5F1EA',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
