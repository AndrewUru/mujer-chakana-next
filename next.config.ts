// types de Next.js
import type { NextConfig } from "next";
// Importa el wrapper de PWA
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  experimental: {
    serverActions: {},
  },

  images: {
    domains: ["https://onlnbinftmtdbawocixf.supabase.co"], // Reemplaza con tu dominio Supabase si es diferente
  },
};

// Exporta el config envuelto con PWA
export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
})(nextConfig);
