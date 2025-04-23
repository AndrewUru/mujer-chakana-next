declare module "next-pwa" {
  import type { NextConfig } from "next";

  type PWAOptions = {
    dest: string;
    register?: boolean;
    skipWaiting?: boolean;
    disable?: boolean;
    scope?: string;
    sw?: string;
  };

  const withPWA: (options: PWAOptions) => (config: NextConfig) => NextConfig;
  export default withPWA;
}
