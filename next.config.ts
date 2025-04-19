// types de Next.js
import type { NextConfig } from "next";
// Importa el wrapper de PWA
import withPWA from "next-pwa";

// Config principal de Next.js
const nextConfig: NextConfig = {
  reactStrictMode: true,

  // ⚠️ Corrige el error de tipo con `serverActions`
  // En lugar de true, pasamos un objeto vacío (si no vas a usar nada aún)
  experimental: {
    serverActions: {},
  },
};

// Exporta el config envuelto con PWA
export default withPWA({
  dest: "public", // Dónde se generará el sw.js
  register: true, // Registrar el SW automáticamente
  skipWaiting: true, // Reemplazar inmediatamente el SW anterior
})(nextConfig);
