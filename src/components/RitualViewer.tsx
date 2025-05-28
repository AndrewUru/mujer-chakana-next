"use client";

import { useRouter } from "next/navigation";

export default function RitualViewer({
  pdfUrl,
  audioUrl,
  videoUrl,
}: {
  pdfUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
}) {
  const router = useRouter();

  return (
    <div className="min-h-screen  flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-pink-300">
        <div className="flex justify-between items-center px-6 py-4 bg-pink-200">
          <h1 className="text-xl font-bold text-pink-800">
            🌕 Ritual del Día Chakana
          </h1>
          <button
            onClick={() => router.back()}
            className="text-sm text-pink-800 underline hover:text-pink-600"
          >
            ← Volver
          </button>
        </div>

        <div className="p-6 space-y-6">
          {audioUrl && (
            <div>
              <h2 className="text-lg font-semibold text-pink-700 mb-2">
                🎧 Audio del Día
              </h2>
              <audio controls className="w-full rounded-xl shadow-inner">
                <source src={audioUrl} type="audio/mpeg" />
                Tu navegador no soporta audio embebido.
              </audio>
            </div>
          )}

          {videoUrl && (
            <div>
              <h2 className="text-lg font-semibold text-pink-700 mb-2">
                🎥 Video del Ritual
              </h2>
              <video
                controls
                className="w-full rounded-xl shadow-inner border"
                style={{ maxHeight: "500px" }}
              >
                <source src={videoUrl} type="video/mp4" />
                Tu navegador no soporta video embebido.
              </video>
            </div>
          )}

          {pdfUrl && (
            <div>
              <h2 className="text-lg font-semibold text-pink-700 mb-2">
                📜 Ritual en PDF
              </h2>
              <iframe
                src={pdfUrl}
                className="w-full h-[70vh] rounded-xl shadow-inner border"
                style={{ border: "none" }}
              />
            </div>
          )}

          {!audioUrl && !videoUrl && !pdfUrl && (
            <p className="text-center text-gray-500 italic">
              No se encontró ningún recurso para este día 🌑
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
