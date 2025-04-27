const config = {
  plugins: {
    "postcss-nesting": {}, // primero nesting
    "@tailwindcss/postcss": {}, // ahora el nuevo puente oficial
    autoprefixer: {}, // luego autoprefixer
  },
};

export default config;
