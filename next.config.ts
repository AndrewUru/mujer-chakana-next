// types de Next.js
import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  experimental: {
    serverActions: {},
  },

  images: {
    domains: ["onlnbinftmtdbawocixf.supabase.co"], // ✅ aquí el dominio correcto
  },
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
})(nextConfig);
