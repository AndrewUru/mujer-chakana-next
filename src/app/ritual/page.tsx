"use client";

import { Suspense } from "react";
import RitualViewerWrapper from "@/components/RitualViewerWrapper";

export default function RitualPage() {
  return (
    <Suspense
      fallback={<div className="p-6 text-center">Cargando ritual...</div>}
    >
      <RitualViewerWrapper />
    </Suspense>
  );
}
