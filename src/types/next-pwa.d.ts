declare module "next-pwa" {
  import type { NextConfig } from "next";
  const withPWA: (config: NextConfig) => NextConfig;
  export default withPWA;
}
