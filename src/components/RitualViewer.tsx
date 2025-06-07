"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (audioUrl) return "audio";
    if (videoUrl) return "video";
    if (pdfUrl) return "pdf";
    return "none";
  });

  const tabs = [
    {
      id: "audio",
      label: "Audio Guiado",
      icon: "🎧",
      content: audioUrl,
      type: "audio",
    },
    {
      id: "video",
      label: "Video Ritual",
      icon: "🎥",
      content: videoUrl,
      type: "video",
    },
    {
      id: "pdf",
      label: "Guía Completa",
      icon: "📜",
      content: pdfUrl,
      type: "pdf",
    },
  ].filter((tab) => tab.content);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 flex flex-col items-center justify-center p-4 pb-20">
      {/* Patrón decorativo de fondo */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-bl from-rose-200 to-transparent rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 left-10 w-24 h-24 bg-gradient-to-tr from-pink-200 to-transparent rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-gradient-to-r from-orange-100 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-5xl">
        {/* Header mejorado */}
        <div className="bg-white/90 backdrop-blur-md rounded-t-3xl border border-rose-200/80 shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-6 sm:px-8 py-6 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-2xl">🌕</span>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                  Ritual Sagrado del Día
                </h1>
                <p className="text-rose-600/70 text-sm font-medium">
                  GINERGETICA
                </p>
              </div>
            </div>

            <button
              onClick={() => router.back()}
              className="group flex items-center gap-2 bg-rose-100/80 hover:bg-rose-200/80 text-rose-700 px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <svg
                className="w-4 h-4 group-hover:-translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span>Volver</span>
            </button>
          </div>

          {/* Tabs de navegación */}
          {tabs.length > 1 && (
            <div className="px-6 sm:px-8 pb-4">
              <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg scale-105"
                        : "bg-rose-100/60 text-rose-700 hover:bg-rose-200/80 hover:scale-105"
                    }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span className="text-sm sm:text-base">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Contenido principal */}
        <div className="bg-white/70 backdrop-blur-md rounded-b-3xl border-x border-b border-rose-200/80 shadow-xl overflow-hidden">
          <div className="p-6 sm:p-8">
            {tabs.length === 0 ? (
              // Estado vacío mejorado
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-4xl">🌑</span>
                </div>
                <h3 className="text-xl font-semibold text-rose-700 mb-2">
                  Momento de Pausa
                </h3>
                <p className="text-rose-600/70 max-w-md mx-auto">
                  No hay recursos disponibles para este día. Es un momento
                  perfecto para la reflexión personal y la conexión interior.
                </p>
              </div>
            ) : (
              // Contenido de tabs
              <div className="space-y-6">
                {/* Audio */}
                {activeTab === "audio" && audioUrl && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-xl">🎧</span>
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                          Audio Guiado
                        </h2>
                        <p className="text-sm text-rose-600/70">
                          Déjate llevar por la experiencia sonora
                        </p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200/50">
                      <audio
                        controls
                        className="w-full h-12 rounded-xl shadow-lg [&::-webkit-media-controls-panel]:bg-white/90 [&::-webkit-media-controls-panel]:backdrop-blur-sm"
                        style={{
                          filter: "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1))",
                        }}
                      >
                        <source src={audioUrl} type="audio/mpeg" />
                        Tu navegador no soporta audio embebido.
                      </audio>
                    </div>
                  </div>
                )}

                {/* Video */}
                {activeTab === "video" && videoUrl && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-violet-100 rounded-full flex items-center justify-center">
                        <span className="text-xl">🎥</span>
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                          Video del Ritual
                        </h2>
                        <p className="text-sm text-rose-600/70">
                          Práctica visual paso a paso
                        </p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl p-4 border border-purple-200/50">
                      <video
                        controls
                        className="w-full rounded-xl shadow-lg border border-purple-200/30"
                        style={{ maxHeight: "500px" }}
                      >
                        <source src={videoUrl} type="video/mp4" />
                        Tu navegador no soporta video embebido.
                      </video>
                    </div>
                  </div>
                )}

                {/* PDF */}
                {activeTab === "pdf" && pdfUrl && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-xl">📜</span>
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                          Guía Completa
                        </h2>
                        <p className="text-sm text-rose-600/70">
                          Documentación detallada del ritual
                        </p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-200/50">
                      <iframe
                        src={pdfUrl}
                        className="w-full h-[70vh] rounded-xl shadow-lg border border-amber-200/30"
                        style={{ border: "none" }}
                      />
                    </div>
                  </div>
                )}

                {/* Call to action inspiracional */}
                <div className="mt-8 pt-6 border-t border-rose-200/50">
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                      <span className="w-2 h-2 bg-rose-400 rounded-full animate-pulse"></span>
                      Momento Sagrado
                    </div>
                    <p className="text-rose-600/80 font-medium italic">
                      Cada ritual es una puerta hacia tu despertar interior
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
