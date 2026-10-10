"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const AmbientChakanaScene = dynamic(
  () => import("@/components/AmbientChakanaScene"),
  { ssr: false, loading: () => null }
);

export default function AmbientSceneLazy() {
  const pathname = usePathname();
  if (pathname === "/dashboard" || pathname === "/manual" || pathname === "/recursos" || pathname.startsWith("/recursos/")) return null;
  return <AmbientChakanaScene />;
}
