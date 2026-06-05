/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.json"
  ],
  safelist: ['phishing-link'],
  theme: {
    extend: {
      colors: {
        gmail: {
          sidebar: '#f6f8fc',
          active: '#d3e3fd',
          border: '#eaf1fb'
        }
      }
    },
  },
  plugins: [],
}