// next.config.js (o .ts/.mjs según tu setup)
import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  experimental: {
    serverActions: {},
  },

  images: {
    domains: [
      "onlnbinftmtdbawocixf.supabase.co",
      "elsaltoweb.es", // 👈 agrega este dominio
    ],
  },
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development", // 👈 ¡esto evita errores en modo dev!
})(nextConfig);
