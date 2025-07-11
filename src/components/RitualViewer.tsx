"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

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
  const [isLoading, setIsLoading] = useState(true);
  const [mediaError, setMediaError] = useState<string | null>(null);

  // Simular carga inicial
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const tabs = [
    {
      id: "audio",
      label: "Audio Guiado",
      icon: "🎧",
      content: audioUrl,
      type: "audio",
      description: "Meditación y guía sonora",
    },
    {
      id: "video",
      label: "Video Ritual",
      icon: "🎥",
      content: videoUrl,
      type: "video",
      description: "Práctica visual completa",
    },
    {
      id: "pdf",
      label: "Guía Completa",
      icon: "📜",
      content: pdfUrl,
      type: "pdf",
      description: "Documentación detallada",
    },
  ].filter((tab) => tab.content);

  const handleMediaError = (type: string) => {
    setMediaError(
      `No se pudo cargar el ${type}. Por favor, intenta más tarde.`
    );
  };

  const handleBackClick = () => {
    // Agregar animación de salida
    const container = document.querySelector(".ritual-container");
    if (container) {
      container.classList.add("fade-out");
      setTimeout(() => router.back(), 300);
    } else {
      router.back();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-rose-200 to-pink-200 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-3xl">🌕</span>
            </div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-rose-300 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-rose-700">
              Preparando tu ritual...
            </h2>
            <p className="text-rose-600/70">Cargando recursos sagrados</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 flex flex-col items-center justify-center p-4 pb-20 ritual-container transition-all duration-300">
      {/* Patrón decorativo de fondo mejorado */}
      <div className="fixed inset-0 opacity-20 pointer-events-none overflow-hidden">
        <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-bl from-rose-200 to-transparent rounded-full blur-2xl animate-pulse"></div>
        <div
          className="absolute bottom-20 left-10 w-24 h-24 bg-gradient-to-tr from-pink-200 to-transparent rounded-full blur-xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-gradient-to-r from-orange-100 to-transparent rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/4 right-1/4 w-16 h-16 bg-gradient-to-br from-purple-200 to-transparent rounded-full blur-lg animate-pulse"
          style={{ animationDelay: "0.5s" }}
        ></div>
      </div>

      <div className="relative w-full max-w-6xl">
        {/* Header mejorado con mejor accesibilidad */}
        <div className="bg-white/95 backdrop-blur-md rounded-t-3xl border border-rose-200/80 shadow-2xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-6 sm:px-8 py-6 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center shadow-lg ring-2 ring-rose-200/50">
                <span className="text-2xl" role="img" aria-label="Luna llena">
                  🌕
                </span>
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
              onClick={handleBackClick}
              className="group flex items-center gap-2 bg-rose-100/80 hover:bg-rose-200/80 text-rose-700 px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-offset-2"
              aria-label="Volver a la página anterior"
            >
              <svg
                className="w-4 h-4 group-hover:-translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
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

          {/* Tabs de navegación mejorados */}
          {tabs.length > 1 && (
            <div className="px-6 sm:px-8 pb-4">
              <div
                className="flex flex-wrap gap-2"
                role="tablist"
                aria-label="Seleccionar tipo de contenido"
              >
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    aria-controls={`panel-${tab.id}`}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-offset-2 ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg scale-105 ring-2 ring-rose-300/50"
                        : "bg-rose-100/60 text-rose-700 hover:bg-rose-200/80 hover:scale-105 hover:shadow-md"
                    }`}
                  >
                    <span className="text-lg" role="img" aria-hidden="true">
                      {tab.icon}
                    </span>
                    <div className="text-left">
                      <span className="text-sm sm:text-base block">
                        {tab.label}
                      </span>
                      <span className="text-xs opacity-75 hidden sm:block">
                        {tab.description}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Contenido principal */}
        <div className="bg-white/80 backdrop-blur-md rounded-b-3xl border-x border-b border-rose-200/80 shadow-2xl overflow-hidden">
          <div className="p-6 sm:p-8">
            {tabs.length === 0 ? (
              // Estado vacío mejorado
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg ring-2 ring-rose-200/50">
                  <span className="text-4xl" role="img" aria-label="Luna nueva">
                    🌑
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-rose-700 mb-2">
                  Momento de Pausa
                </h3>
                <p className="text-rose-600/70 max-w-md mx-auto mb-6">
                  No hay recursos disponibles para este día. Es un momento
                  perfecto para la reflexión personal y la conexión interior.
                </p>
                <button
                  onClick={handleBackClick}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 px-6 py-3 rounded-xl font-medium hover:from-rose-200 hover:to-pink-200 transition-all duration-300 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-offset-2"
                >
                  <span>Explorar otros rituales</span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </button>
              </div>
            ) : (
              // Contenido de tabs con mejor manejo de errores
              <div className="space-y-6">
                {mediaError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-red-600 text-sm">⚠️</span>
                      </div>
                      <div>
                        <p className="text-red-700 font-medium">{mediaError}</p>
                        <button
                          onClick={() => setMediaError(null)}
                          className="text-red-600 text-sm hover:underline mt-1"
                        >
                          Intentar de nuevo
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Audio mejorado */}
                {activeTab === "audio" && audioUrl && (
                  <div className="space-y-4" role="tabpanel" id="panel-audio">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center ring-2 ring-blue-200/50">
                        <span className="text-xl" role="img" aria-hidden="true">
                          🎧
                        </span>
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

                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200/50 shadow-lg">
                      <audio
                        controls
                        className="w-full h-14 rounded-xl shadow-lg [&::-webkit-media-controls-panel]:bg-white/90 [&::-webkit-media-controls-panel]:backdrop-blur-sm [&::-webkit-media-controls-play-button]:bg-blue-500 [&::-webkit-media-controls-play-button]:rounded-lg"
                        style={{
                          filter: "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1))",
                        }}
                        onError={() => handleMediaError("audio")}
                        preload="metadata"
                      >
                        <source src={audioUrl} type="audio/mpeg" />
                        <source src={audioUrl} type="audio/wav" />
                        <source src={audioUrl} type="audio/ogg" />
                        Tu navegador no soporta audio embebido.
                      </audio>

                      <div className="mt-4 p-3 bg-blue-100/50 rounded-lg">
                        <p className="text-sm text-blue-700/80">
                          💡 <strong>Consejo:</strong> Encuentra un lugar
                          tranquilo y usa auriculares para una experiencia más
                          inmersiva.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Video mejorado */}
                {activeTab === "video" && videoUrl && (
                  <div className="space-y-4" role="tabpanel" id="panel-video">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-violet-100 rounded-full flex items-center justify-center ring-2 ring-purple-200/50">
                        <span className="text-xl" role="img" aria-hidden="true">
                          🎥
                        </span>
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

                    <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl p-4 border border-purple-200/50 shadow-lg">
                      <div className="relative">
                        <video
                          controls
                          className="w-full rounded-xl shadow-lg border border-purple-200/30"
                          style={{ maxHeight: "500px" }}
                          onError={() => handleMediaError("video")}
                          preload="metadata"
                        >
                          <source src={videoUrl} type="video/mp4" />
                          <source src={videoUrl} type="video/webm" />
                          <source src={videoUrl} type="video/ogg" />
                          Tu navegador no soporta video embebido.
                        </video>

                        <div className="absolute top-2 right-2">
                          <button
                            className="bg-black/50 text-white p-2 rounded-lg hover:bg-black/70 transition-colors"
                            onClick={() => {
                              const video = document.querySelector("video");
                              if (video) {
                                video.requestFullscreen();
                              }
                            }}
                            aria-label="Ver en pantalla completa"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 p-3 bg-purple-100/50 rounded-lg">
                        <p className="text-sm text-purple-700/80">
                          💡 <strong>Consejo:</strong> Asegúrate de tener
                          suficiente espacio para seguir los movimientos del
                          ritual.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* PDF mejorado */}
                {activeTab === "pdf" && pdfUrl && (
                  <div className="space-y-4" role="tabpanel" id="panel-pdf">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center ring-2 ring-amber-200/50">
                        <span className="text-xl" role="img" aria-hidden="true">
                          📜
                        </span>
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

                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-200/50 shadow-lg">
                      <div className="relative">
                        <iframe
                          src={pdfUrl}
                          className="w-full h-[70vh] rounded-xl shadow-lg border border-amber-200/30"
                          style={{ border: "none" }}
                          onError={() => handleMediaError("PDF")}
                          title="Guía del ritual en PDF"
                        />

                        <div className="absolute top-2 right-2">
                          <a
                            href={pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-black/50 text-white p-2 rounded-lg hover:bg-black/70 transition-colors inline-flex items-center gap-1"
                            aria-label="Abrir PDF en nueva ventana"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6m4-3h6v6m-11 5L21 4" />
                            </svg>
                          </a>
                        </div>
                      </div>

                      <div className="mt-4 p-3 bg-amber-100/50 rounded-lg">
                        <p className="text-sm text-amber-700/80">
                          💡 <strong>Consejo:</strong> Puedes descargar la guía
                          para consultarla offline cuando lo necesites.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Call to action inspiracional mejorado */}
                <div className="mt-8 pt-6 border-t border-rose-200/50">
                  <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 px-4 py-2 rounded-full text-sm font-medium">
                      <span className="w-2 h-2 bg-rose-400 rounded-full animate-pulse"></span>
                      Momento Sagrado
                    </div>
                    <p className="text-rose-600/80 font-medium italic">
                      Cada ritual es una puerta hacia tu despertar interior
                    </p>

                    {/* Botones de acción adicionales */}
                    <div className="flex flex-wrap justify-center gap-3 mt-4">
                      <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 bg-rose-100/80 text-rose-700 px-4 py-2 rounded-lg hover:bg-rose-200/80 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-offset-2"
                        aria-label="Imprimir ritual"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                          />
                        </svg>
                        <span>Imprimir</span>
                      </button>

                      <button
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({
                              title: "Ritual Sagrado del Día - GINERGETICA",
                              text: "Comparte este momento sagrado contigo mismo",
                              url: window.location.href,
                            });
                          } else {
                            navigator.clipboard.writeText(window.location.href);
                            alert("Enlace copiado al portapapeles");
                          }
                        }}
                        className="flex items-center gap-2 bg-pink-100/80 text-pink-700 px-4 py-2 rounded-lg hover:bg-pink-200/80 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-offset-2"
                        aria-label="Compartir ritual"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                          />
                        </svg>
                        <span>Compartir</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Estilos CSS para animaciones */}
      <style jsx>{`
        .fade-out {
          opacity: 0;
          transform: translateY(-20px);
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-pulse,
          .animate-spin {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
