/** @type {import('tailwindcss').Config} */

module.exports = {
  darkMode: "class",
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
        background: "#fefefe",
        foreground: "#171717",
        primary: "#8f1555",
        accent: "#264653",
        muted: "#a1a1aa",
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
        soft: "0 4px 12px rgba(0, 0, 0, 0.08)",
      },
      keyframes: {
        "fade-out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "fade-out": "fade-out 1s ease-out forwards",
        "scale-in": "scale-in 1s ease-out",
      },

      keyframes: {
        "fade-out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        pulseRuby: {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.05)", opacity: "0.9" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-out": "fade-out 1s ease-out forwards",
        "scale-in": "scale-in 1s ease-out",
        "pulse-ruby": "pulseRuby 2s ease-in-out infinite",
        "fade-in-up": "fade-in-up 1.5s ease-out forwards",
      },
    },
  },
  plugins: [],
};
