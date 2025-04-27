/** @type {import('tailwindcss').Config} */

// Configure Tailwind to scan your files for class usage
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}", // Adjust paths to match your project structure
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

module.exports = {
  darkMode: "class", // 🌙 Activamos modo oscuro
  content: ["./src/**/*.{js,ts,jsx,tsx}", "./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
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
        background: "#fefefe", // Fondo claro
        foreground: "#171717", // Texto principal
        primary: "#8f1555", // Color principal para acciones (ej: botones)
        accent: "#264653", // Color para detalles o énfasis
        muted: "#a1a1aa", // Textos secundarios o apagados
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
        serif: ['"Playfair Display"', "serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 4px 12px rgba(0, 0, 0, 0.08)", // Sombras suaves
      },
    },
  },
  plugins: [],
};
