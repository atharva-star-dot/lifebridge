/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        critical: {
          light: '#FEE2E2',
          DEFAULT: '#DC2626',
          dark: '#991B1B'
        },
        urgent: {
          light: '#FEF3C7',
          DEFAULT: '#D97706',
          dark: '#92400E'
        },
        routine: {
          light: '#E0F2FE',
          DEFAULT: '#0284C7',
          dark: '#0369A1'
        }
      }
    },
  },
  plugins: [],
}
