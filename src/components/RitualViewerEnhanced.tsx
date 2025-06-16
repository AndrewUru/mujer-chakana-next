"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

interface RitualProgress {
  audio: { viewed: boolean; duration?: number };
  video: { viewed: boolean; duration?: number };
  pdf: { viewed: boolean; duration?: number };
}

interface RitualNotes {
  audio: string;
  video: string;
  pdf: string;
}

export default function RitualViewerEnhanced({
  pdfUrl,
  audioUrl,
  videoUrl,
  ritualId,
}: {
  pdfUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
  ritualId?: string;
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

  // Nuevas funcionalidades
  const [isFavorite, setIsFavorite] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState<RitualNotes>({
    audio: "",
    video: "",
    pdf: "",
  });
  const [progress, setProgress] = useState<RitualProgress>({
    audio: { viewed: false },
    video: { viewed: false },
    pdf: { viewed: false },
  });
  const [timer, setTimer] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerDuration, setTimerDuration] = useState(15); // minutos por defecto

  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cargar datos guardados al inicializar
  useEffect(() => {
    if (ritualId) {
      const savedProgress = localStorage.getItem(`ritual-progress-${ritualId}`);
      const savedNotes = localStorage.getItem(`ritual-notes-${ritualId}`);
      const savedFavorite = localStorage.getItem(`ritual-favorite-${ritualId}`);

      if (savedProgress) {
        setProgress(JSON.parse(savedProgress));
      }
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      }
      if (savedFavorite) {
        setIsFavorite(JSON.parse(savedFavorite));
      }
    }

    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [ritualId]);

  // Guardar progreso automáticamente
  useEffect(() => {
    if (ritualId) {
      localStorage.setItem(
        `ritual-progress-${ritualId}`,
        JSON.stringify(progress)
      );
    }
  }, [progress, ritualId]);

  // Guardar notas automáticamente
  useEffect(() => {
    if (ritualId) {
      localStorage.setItem(`ritual-notes-${ritualId}`, JSON.stringify(notes));
    }
  }, [notes, ritualId]);

  // Guardar favorito automáticamente
  useEffect(() => {
    if (ritualId) {
      localStorage.setItem(
        `ritual-favorite-${ritualId}`,
        JSON.stringify(isFavorite)
      );
    }
  }, [isFavorite, ritualId]);

  // Timer functionality
  useEffect(() => {
    if (isTimerRunning && timer !== null) {
      timerIntervalRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev !== null && prev > 0) {
            return prev - 1;
          } else {
            setIsTimerRunning(false);
            // Notificación cuando termina el timer
            if (
              "Notification" in window &&
              Notification.permission === "granted"
            ) {
              new Notification("¡Meditación completada!", {
                body: "Has completado tu tiempo de meditación.",
                icon: "/favicon.ico",
              });
            }
            return 0;
          }
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isTimerRunning, timer]);

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
    const container = document.querySelector(".ritual-container");
    if (container) {
      container.classList.add("fade-out");
      setTimeout(() => router.back(), 300);
    } else {
      router.back();
    }
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    // Marcar como visto cuando se cambia de tab
    setProgress((prev) => ({
      ...prev,
      [tabId]: { ...prev[tabId as keyof RitualProgress], viewed: true },
    }));
  };

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
  };

  const handleNotesChange = (tabId: string, value: string) => {
    setNotes((prev) => ({
      ...prev,
      [tabId]: value,
    }));
  };

  const startTimer = () => {
    setTimer(timerDuration * 60); // Convertir minutos a segundos
    setIsTimerRunning(true);

    // Solicitar permisos de notificación
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  };

  const pauseTimer = () => {
    setIsTimerRunning(false);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimer(null);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getProgressPercentage = (): number => {
    const totalTabs = tabs.length;
    const viewedTabs = Object.values(progress).filter((p) => p.viewed).length;
    return totalTabs > 0 ? (viewedTabs / totalTabs) * 100 : 0;
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
        {/* Header mejorado con funcionalidades adicionales */}
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

                {/* Barra de progreso */}
                {tabs.length > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 bg-rose-100 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-rose-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${getProgressPercentage()}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-rose-600/70 font-medium">
                      {Math.round(getProgressPercentage())}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Timer */}
              {activeTab === "audio" && (
                <div className="flex items-center gap-2 bg-blue-100/80 rounded-xl px-3 py-2">
                  {timer !== null ? (
                    <div className="flex items-center gap-2">
                      <span className="text-blue-700 font-mono text-sm">
                        {formatTime(timer)}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={isTimerRunning ? pauseTimer : startTimer}
                          className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-blue-600 transition-colors"
                          aria-label={
                            isTimerRunning ? "Pausar timer" : "Iniciar timer"
                          }
                        >
                          {isTimerRunning ? "⏸️" : "▶️"}
                        </button>
                        <button
                          onClick={resetTimer}
                          className="w-6 h-6 bg-blue-400 text-white rounded-full flex items-center justify-center text-xs hover:bg-blue-500 transition-colors"
                          aria-label="Reiniciar timer"
                        >
                          🔄
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <select
                        value={timerDuration}
                        onChange={(e) =>
                          setTimerDuration(Number(e.target.value))
                        }
                        className="text-xs bg-white/80 rounded px-2 py-1 border border-blue-200"
                      >
                        <option value={5}>5 min</option>
                        <option value={10}>10 min</option>
                        <option value={15}>15 min</option>
                        <option value={20}>20 min</option>
                        <option value={30}>30 min</option>
                      </select>
                      <button
                        onClick={startTimer}
                        className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
                      >
                        Iniciar
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Botón de favoritos */}
              <button
                onClick={handleFavoriteToggle}
                className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-offset-2 ${
                  isFavorite
                    ? "bg-rose-100 text-rose-600 shadow-lg"
                    : "bg-rose-50 text-rose-400 hover:bg-rose-100"
                }`}
                aria-label={
                  isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"
                }
              >
                <svg
                  className="w-5 h-5"
                  fill={isFavorite ? "currentColor" : "none"}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>

              {/* Botón de notas */}
              <button
                onClick={() => setShowNotes(!showNotes)}
                className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-offset-2 ${
                  showNotes
                    ? "bg-amber-100 text-amber-600 shadow-lg"
                    : "bg-amber-50 text-amber-400 hover:bg-amber-100"
                }`}
                aria-label="Mostrar/ocultar notas"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>

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
          </div>

          {/* Tabs de navegación mejorados con indicadores de progreso */}
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
                    onClick={() => handleTabChange(tab.id)}
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    aria-controls={`panel-${tab.id}`}
                    className={`relative flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-offset-2 ${
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

                    {/* Indicador de progreso */}
                    {progress[tab.id as keyof RitualProgress]?.viewed && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
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

                {/* Panel de notas */}
                {showNotes && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-amber-600">📝</span>
                      <h3 className="font-semibold text-amber-800">
                        Notas Personales
                      </h3>
                    </div>
                    <textarea
                      value={notes[activeTab as keyof RitualNotes] || ""}
                      onChange={(e) =>
                        handleNotesChange(activeTab, e.target.value)
                      }
                      placeholder={`Escribe tus reflexiones sobre el ${
                        activeTab === "audio"
                          ? "audio guiado"
                          : activeTab === "video"
                          ? "video ritual"
                          : "ritual"
                      }...`}
                      className="w-full h-24 p-3 border border-amber-300 rounded-lg bg-white/80 resize-none focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                    <p className="text-xs text-amber-600/70 mt-2">
                      Tus notas se guardan automáticamente y son privadas.
                    </p>
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
                        ref={audioRef}
                        controls
                        className="w-full h-14 rounded-xl shadow-lg [&::-webkit-media-controls-panel]:bg-white/90 [&::-webkit-media-controls-panel]:backdrop-blur-sm [&::-webkit-media-controls-play-button]:bg-blue-500 [&::-webkit-media-controls-play-button]:rounded-lg"
                        style={{
                          filter: "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1))",
                        }}
                        onError={() => handleMediaError("audio")}
                        onPlay={() => {
                          setProgress((prev) => ({
                            ...prev,
                            audio: { ...prev.audio, viewed: true },
                          }));
                        }}
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
                          ref={videoRef}
                          controls
                          className="w-full rounded-xl shadow-lg border border-purple-200/30"
                          style={{ maxHeight: "500px" }}
                          onError={() => handleMediaError("video")}
                          onPlay={() => {
                            setProgress((prev) => ({
                              ...prev,
                              video: { ...prev.video, viewed: true },
                            }));
                          }}
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
                          onLoad={() => {
                            setProgress((prev) => ({
                              ...prev,
                              pdf: { ...prev.pdf, viewed: true },
                            }));
                          }}
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
