/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        spotify: {
          green: "#1DB954",
          black: "#191414",
          gray: "#282828",
          lightgray: "#B3B3B3",
        },
      },
    },
  },
  plugins: [],
};