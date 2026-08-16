/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0d0d0f',
        surface: '#111113',
        border: '#2a2a2e',
      },
    },
  },
  plugins: [],
}
