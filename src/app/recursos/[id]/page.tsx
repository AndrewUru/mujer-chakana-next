"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

interface Recurso {
  id: string;
  tipo: "audio" | "pdf" | string;
  titulo: string;
  url: string;
  descripcion: string;
  tipo_suscripcion: "gratuito" | "mensual" | "anual";
  imagen_url?: string;
  fase?: string;
  arquetipo?: string;
  elemento?: string;
}

export default function RecursoPage() {
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      setErrorMsg(null);
      const { data, error } = await supabase
        .from("recursos")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        setErrorMsg("No se encontró el recurso solicitado.");
        setRecurso(null);
      } else {
        setRecurso(data);
      }
      setLoading(false);
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-rose-400 mb-6"></div>
        <p className="text-rose-700 text-lg font-medium">Cargando recurso...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-center text-rose-700 text-xl font-semibold mb-4">
          {errorMsg}
        </p>
        <button
          onClick={() => router.back()}
          className="px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition"
        >
          Volver atrás
        </button>
      </div>
    );
  }

  if (!recurso) return null;

  // Estado de error mejorado
  // (Eliminado el bloque 'if (error)' porque 'error' no está definido. El manejo de errores ya se realiza con errorMsg.)

  if (!recurso) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header con navegación */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm text-rose-700 rounded-xl text-sm font-medium hover:bg-white hover:shadow-md transition-all duration-300 border border-rose-100"
            aria-label="Volver"
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Volver
          </button>
        </div>

        {/* Contenido principal */}
        <div className="bg-white/80 backdrop-blur-xl border border-rose-200 rounded-3xl shadow-2xl overflow-hidden">
          {/* Imagen hero */}
          {recurso.imagen_url && (
            <div className="relative h-64 md:h-80 overflow-hidden">
              <Image
                src={recurso.imagen_url}
                alt={`Imagen de ${recurso.titulo}`}
                width={800}
                height={320}
                className="w-full h-full object-cover"
                style={{ objectFit: "cover" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

              {/* Badge de tipo superpuesto */}
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white/90 backdrop-blur-sm text-rose-700 border border-rose-200 shadow-lg">
                  {recurso.tipo === "audio"
                    ? "🎧"
                    : recurso.tipo === "pdf"
                    ? "📄"
                    : "✨"}{" "}
                  {recurso.tipo}
                </span>
              </div>
            </div>
          )}

          <div className="p-8 space-y-8">
            {/* Título y descripción */}
            <div className="text-center space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                {recurso.titulo}
              </h1>
              <p className="text-gray-700 text-lg leading-relaxed max-w-2xl mx-auto">
                {recurso.descripcion}
              </p>
            </div>

            {/* Tags informativos */}
            <div className="flex flex-wrap justify-center gap-3">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 font-medium text-sm">
                {recurso.tipo_suscripcion === "gratuito"
                  ? "🆓 Gratuito"
                  : recurso.tipo_suscripcion === "mensual"
                  ? "💳 Suscripción mensual"
                  : recurso.tipo_suscripcion === "anual"
                  ? "💎 Suscripción anual"
                  : recurso.tipo_suscripcion}
              </span>

              {recurso.fase && (
                <span className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-medium text-sm">
                  🌙 {recurso.fase}
                </span>
              )}

              {recurso.elemento && (
                <span className="inline-flex items-center px-4 py-2 rounded-full bg-green-50 text-green-700 font-medium text-sm">
                  ⚡ {recurso.elemento}
                </span>
              )}

              {recurso.arquetipo && (
                <span className="inline-flex items-center px-4 py-2 rounded-full bg-purple-50 text-purple-700 font-medium text-sm">
                  🎭 {recurso.arquetipo}
                </span>
              )}
            </div>

            {/* Contenido del recurso */}
            <div className="space-y-6">
              {recurso.tipo === "audio" ? (
                <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-6 rounded-2xl border border-rose-200 shadow-inner">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full flex items-center justify-center">
                      <span className="text-white text-xl">🎧</span>
                    </div>
                  </div>
                  <audio
                    controls
                    src={recurso.url}
                    className="w-full rounded-xl shadow-md"
                    style={{ height: "54px" }}
                  />
                  <p className="text-center text-sm text-rose-600 font-medium mt-3">
                    Reproducir contenido de audio
                  </p>
                </div>
              ) : recurso.tipo === "pdf" ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full flex items-center justify-center">
                      <span className="text-white text-lg">📄</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-blue-900">
                        Documento PDF
                      </h3>
                      <p className="text-sm text-blue-600">
                        Visualiza el contenido completo
                      </p>
                    </div>
                  </div>
                  <div className="w-full h-[70vh] bg-gray-50 rounded-2xl border-2 border-rose-200 shadow-lg overflow-hidden">
                    <iframe
                      src={recurso.url}
                      className="w-full h-full"
                      allow="fullscreen"
                      title={`PDF de ${recurso.titulo}`}
                    />
                  </div>
                </div>
              ) : recurso.tipo === "video" ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                      <span className="text-white text-lg">🎥</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-purple-900">
                        Contenido de Video
                      </h3>
                      <p className="text-sm text-purple-600">
                        Experiencia audiovisual completa
                      </p>
                    </div>
                  </div>
                  <div className="w-full aspect-video bg-gray-50 rounded-2xl border-2 border-rose-200 shadow-lg overflow-hidden">
                    <video
                      controls
                      src={recurso.url}
                      className="w-full h-full"
                      title={`Video de ${recurso.titulo}`}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 bg-gray-50 rounded-2xl border border-gray-200">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full mb-4">
                    <span className="text-2xl">❓</span>
                  </div>
                  <p className="text-gray-600 font-medium">
                    Este tipo de recurso ({recurso.tipo}) aún no es compatible
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Estamos trabajando para añadir soporte pronto
                  </p>
                </div>
              )}
            </div>

            {/* Footer decorativo */}
            <div className="text-center pt-6 border-t border-rose-100">
              <div className="inline-flex items-center gap-2 text-sm text-gray-500">
                <span className="w-2 h-2 bg-rose-300 rounded-full"></span>
                <span>Ciclo de sabiduría ancestral</span>
                <span className="w-2 h-2 bg-rose-300 rounded-full"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
