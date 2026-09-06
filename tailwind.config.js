/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        maroon: "#6E1E3A",
        "maroon-dark": "#4A1327",
        gold: "#A9782F",
        cream: "#FBF6EF",
        blush: "#F1DCD6",
        ink: "#2B211F",
        "ink-soft": "#6E5F5A",
      },
    },
  },
  plugins: [],
};
