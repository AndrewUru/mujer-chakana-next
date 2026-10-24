"use client";

import { Suspense } from "react";
import { RitualLoading } from "@/components/RitualViewer";
import RitualViewerWrapper from "@/components/RitualViewerWrapper";

export default function RitualPage() {
  return (
    <Suspense fallback={<RitualLoading />}>
      <RitualViewerWrapper />
    </Suspense>
  );
}
