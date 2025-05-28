"use client";

import { useSearchParams } from "next/navigation";
import RitualViewer from "./RitualViewer";

export default function RitualViewerWrapper() {
  const params = useSearchParams();
  const audioUrl = params.get("audio") || undefined;
  const pdfUrl = params.get("pdf") || undefined;
  const videoUrl = params.get("video") || undefined;

  return (
    <RitualViewer audioUrl={audioUrl} pdfUrl={pdfUrl} videoUrl={videoUrl} />
  );
}
