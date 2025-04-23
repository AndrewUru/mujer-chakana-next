/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // 🌙 Habilita modo oscuro basado en clase
  content: ["./src/**/*.{js,ts,jsx,tsx}", "./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // 🎨 Paleta Mujer Chakana
        pink: {
          50: "#ffe4f0",
          100: "#ffb8d2",
          200: "#f48bb1",
          300: "#e56a9c",
          400: "#d84b8a",
          500: "#c42c77",
          600: "#aa1e67",
          700: "#8f1555",
          800: "#740c43",
          900: "#5c0531",
        },
      },
    },
  },
  plugins: [],
};
