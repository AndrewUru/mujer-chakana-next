"use client";

import dynamic from "next/dynamic";

const AmbientChakanaScene = dynamic(
  () => import("@/components/AmbientChakanaScene"),
  { ssr: false, loading: () => null }
);

export default function AmbientSceneLazy() {
  return <AmbientChakanaScene />;
}
