// next.config.js (o .ts/.mjs según tu setup)
import type { NextConfig } from "next";
import withPWA from "next-pwa";

const supabaseImageHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : null;

const nextConfig: NextConfig = {
  reactStrictMode: true,

  experimental: {
    serverActions: {},
  },

  images: {
    remotePatterns: [
      ...(supabaseImageHost
        ? [{
            protocol: "https" as const,
            hostname: supabaseImageHost,
            pathname: "/storage/v1/object/public/**",
          }]
        : []),
      {
        protocol: "https",
        hostname: "onlnbinftmtdbawocixf.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "elsaltoweb.es",
        pathname: "/**",
      },
    ],
  },
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development", // 👈 ¡esto evita errores en modo dev!
})(nextConfig);
