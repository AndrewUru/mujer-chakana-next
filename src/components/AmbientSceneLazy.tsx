"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const AmbientChakanaScene = dynamic(
  () => import("@/components/AmbientChakanaScene"),
  { ssr: false, loading: () => null }
);

export default function AmbientSceneLazy() {
  const pathname = usePathname();
  if (pathname === "/dashboard" || pathname === "/moonboard" || pathname === "/manual" || pathname === "/recursos" || pathname.startsWith("/recursos/") || pathname.startsWith("/tienda") || pathname === "/carrito" || pathname.startsWith("/admin/tienda")) return null;
  return <AmbientChakanaScene />;
}
