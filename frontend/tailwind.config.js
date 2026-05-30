/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        trae: {
          50: "#f6f2ff",
          100: "#ede6ff",
          500: "#863bff",
          600: "#7e14ff",
          700: "#6a00ff",
        },
        primary: "#863bff",
      }
    },
  },
  plugins: [],
}
