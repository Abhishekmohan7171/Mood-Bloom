/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        mood: {
          happy: '#4ade80',
          okay: '#facc15',
          neutral: '#94a3b8',
          sad: '#fb923c',
          verysad: '#f87171'
        }
      }
    },
  },
  plugins: [],
}