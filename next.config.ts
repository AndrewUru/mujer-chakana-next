// next.config.js (o .ts/.mjs según tu setup)
import type { NextConfig } from "next";
import withPWA from "next-pwa";
import { SHOP_ENABLED } from "./src/lib/shop/config";

const supabaseImageHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : null;

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Resolve metadata before sending headers, including notFound() status codes.
  htmlLimitedBots: /.*/,

  async redirects() {
    return [
      { source: "/register", destination: "/auth/register", permanent: true },
      // Temporal a propósito: un 301 quedaría cacheado y seguiría activo al abrir la tienda.
      ...(SHOP_ENABLED
        ? []
        : ["/tienda/:path*", "/carrito"].map((source) => ({ source, destination: "/", permanent: false }))),
      {
        source: "/:path*",
        has: [{ type: "host", value: "ginergetica.com" }],
        destination: "https://www.ginergetica.com/:path*",
        permanent: true,
      },
    ];
  },

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
