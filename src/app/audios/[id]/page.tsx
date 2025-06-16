"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  Download,
  Heart,
  Share2,
  Check,
  X,
} from "lucide-react";

import { supabase } from "@/lib/supabaseClient";

interface Recurso {
  id: string;
  tipo: string;
  titulo: string;
  url: string;
  descripcion: string;
  tipo_suscripcion: "gratuito" | "mensual" | "anual";
  imagen_url?: string;
  fase?: string;
  arquetipo?: string;
  elemento?: string;
}

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

export default function AudioPage() {
  const params = useParams();
  const router = useRouter();
  const id =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
      ? params.id[0]
      : null;

  const [recurso, setRecurso] = useState<Recurso | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("recursos")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          setError("No se pudo cargar el recurso. Inténtalo de nuevo.");
          console.error("Error al obtener el recurso:", error.message);
        } else {
          setRecurso(data);
        }
      } catch {
        setError("Error inesperado. Inténtalo de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const addToast = (message: string, type: "success" | "error" | "info") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  };

  const handleAudioLoad = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    const audio = e.target as HTMLAudioElement;
    setDuration(audio.duration);
  };

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    const audio = e.target as HTMLAudioElement;
    setCurrentTime(audio.currentTime);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = document.querySelector("audio") as HTMLAudioElement;
    if (audio) {
      const newTime = (parseFloat(e.target.value) / 100) * duration;
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    const audio = document.querySelector("audio") as HTMLAudioElement;
    if (audio) {
      audio.volume = newVolume;
    }
  };

  const togglePlay = () => {
    const audio = document.querySelector("audio") as HTMLAudioElement;
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    addToast(
      isLiked ? "Removido de favoritos" : "Agregado a favoritos",
      "success"
    );
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: recurso?.titulo,
          text: recurso?.descripcion,
          url: window.location.href,
        });
        addToast("¡Compartido exitosamente!", "success");
      } else {
        await navigator.clipboard.writeText(window.location.href);
        addToast("Enlace copiado al portapapeles", "success");
      }
    } catch {
      addToast("Error al compartir", "error");
    }
  };

  const handleDownload = () => {
    if (recurso?.url) {
      const link = document.createElement("a");
      link.href = recurso.url;
      link.download = `${recurso.titulo}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addToast("Descarga iniciada", "success");
    } else {
      addToast("Error al descargar", "error");
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const getElementoIcon = (elemento?: string) => {
    switch (elemento?.toLowerCase()) {
      case "tierra":
        return "🌍";
      case "agua":
        return "💧";
      case "fuego":
        return "🔥";
      case "aire":
        return "💨";
      default:
        return "✨";
    }
  };

  const getFaseIcon = (fase?: string) => {
    switch (fase?.toLowerCase()) {
      case "luna nueva":
        return "🌑";
      case "cuarto creciente":
        return "🌓";
      case "luna llena":
        return "🌕";
      case "cuarto menguante":
        return "🌗";
      default:
        return "🌙";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-rose-600 mx-auto mb-4"></div>
          <p className="text-rose-700 text-lg font-medium">
            Cargando tu audio...
          </p>
        </div>
      </div>
    );
  }

  if (error || !recurso) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops...</h2>
          <p className="text-gray-600 mb-6">
            {error || "No se encontró el recurso"}
          </p>
          <button
            onClick={() => router.back()}
            className="bg-rose-600 text-white px-6 py-3 rounded-full hover:bg-rose-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <ArrowLeft size={20} />
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50">
      {/* Toast notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 p-4 rounded-lg shadow-lg text-white transform transition-all duration-300 ${
              toast.type === "success"
                ? "bg-green-500"
                : toast.type === "error"
                ? "bg-red-500"
                : "bg-blue-500"
            }`}
          >
            {toast.type === "success" ? <Check size={20} /> : <X size={20} />}
            <span className="font-medium">{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-rose-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-rose-700 hover:text-rose-800 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Volver</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Card principal */}
        <div className="bg-white rounded-3xl shadow-xl border border-rose-200 overflow-hidden">
          {/* Header del audio */}
          <div className="bg-gradient-to-r from-rose-500 to-purple-600 p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white/20 rounded-full p-2">
                  {getElementoIcon(recurso.elemento)}
                </div>
                <div className="bg-white/20 rounded-full p-2">
                  {getFaseIcon(recurso.fase)}
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {recurso.titulo}
              </h1>
              <p className="text-rose-100 text-lg opacity-90">
                ✨ {recurso.descripcion}
              </p>
            </div>
          </div>

          {/* Reproductor personalizado */}
          <div className="p-8">
            <div className="bg-gradient-to-r from-rose-50 to-purple-50 rounded-2xl p-6 border border-rose-200">
              {/* Controles principales */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={togglePlay}
                  className="bg-rose-600 hover:bg-rose-700 text-white rounded-full p-4 transition-all transform hover:scale-105 shadow-lg"
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>

                <div className="flex items-center gap-4">
                  <button
                    onClick={handleLike}
                    className={`p-3 rounded-full transition-colors ${
                      isLiked
                        ? "bg-rose-100 text-rose-600"
                        : "bg-gray-100 text-gray-600 hover:bg-rose-50"
                    }`}
                  >
                    <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
                  </button>

                  <button
                    onClick={handleShare}
                    className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    <Share2 size={20} />
                  </button>

                  <button
                    onClick={handleDownload}
                    className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    <Download size={20} />
                  </button>
                </div>
              </div>

              {/* Barra de progreso */}
              <div className="mb-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={duration ? (currentTime / duration) * 100 : 0}
                  onChange={handleSeek}
                  className="w-full h-2 slider"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Control de volumen */}
              <div className="flex items-center gap-3">
                <Volume2 size={16} className="text-gray-600" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-24 h-1 slider"
                />
              </div>

              {/* Audio element oculto */}
              <audio
                src={recurso.url}
                onLoadedMetadata={handleAudioLoad}
                onTimeUpdate={handleTimeUpdate}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className="hidden"
              />
            </div>

            {/* Información adicional */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl p-4 border border-rose-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{getFaseIcon(recurso.fase)}</span>
                  <h3 className="font-semibold text-rose-800">Fase Lunar</h3>
                </div>
                <p className="text-rose-700">
                  {recurso.fase || "No especificada"}
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">
                    {getElementoIcon(recurso.elemento)}
                  </span>
                  <h3 className="font-semibold text-purple-800">Elemento</h3>
                </div>
                <p className="text-purple-700">
                  {recurso.elemento || "No especificado"}
                </p>
              </div>

              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">👁️</span>
                  <h3 className="font-semibold text-indigo-800">Arquetipo</h3>
                </div>
                <p className="text-indigo-700">
                  {recurso.arquetipo || "No especificado"}
                </p>
              </div>
            </div>

            {/* Tipo de suscripción */}
            <div className="mt-6 text-center">
              <span
                className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                  recurso.tipo_suscripcion === "gratuito"
                    ? "bg-green-100 text-green-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {recurso.tipo_suscripcion === "gratuito"
                  ? "🆓 Gratuito"
                  : "⭐ Premium"}
              </span>
            </div>
          </div>
        </div>

        {/* Footer decorativo */}
        <div className="text-center mt-8 text-gray-500">
          <p className="text-sm">🌙 Guía visual del ciclo lunar • Chakana</p>
        </div>
      </div>
    </div>
  );
}
