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

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white px-4 py-10">
      <div className="max-w-3xl mx-auto bg-white/90 backdrop-blur-xl border border-rose-200 rounded-3xl shadow-2xl p-8 space-y-8 relative">
        {/* Botón volver */}
        <button
          onClick={() => router.back()}
          className="absolute left-4 top-4 px-3 py-1 bg-rose-100 text-rose-700 rounded-lg text-sm hover:bg-rose-200 transition"
          aria-label="Volver"
        >
          ← Volver
        </button>

        {recurso.imagen_url && (
          <div className="flex justify-center">
            <Image
              src={recurso.imagen_url}
              alt={`Imagen de ${recurso.titulo}`}
              width={400}
              height={224}
              className="max-h-56 rounded-xl shadow-md object-contain mb-2"
              style={{ width: "auto", height: "224px" }}
            />
          </div>
        )}

        {/* Título */}
        <h1 className="text-4xl font-bold text-center text-rose-700 tracking-wide">
          ✨ {recurso.titulo}
        </h1>

        {/* Contenido dinámico */}
        {recurso.tipo === "audio" ? (
          <div className="bg-rose-100 p-4 rounded-xl border border-pink-300 shadow-inner flex flex-col items-center">
            <audio
              controls
              src={recurso.url}
              className="w-full rounded-md mb-2"
            />
            <span className="text-xs text-rose-700">Audio</span>
          </div>
        ) : recurso.tipo === "pdf" ? (
          <div className="w-full h-[70vh] bg-gray-100 rounded-xl border-2 border-rose-300 shadow-md overflow-hidden">
            <iframe
              src={recurso.url}
              className="w-full h-full"
              allow="fullscreen"
              title={`PDF de ${recurso.titulo}`}
            />
          </div>
        ) : (
          <p className="text-center text-sm text-gray-500">
            Tipo de recurso no soportado: {recurso.tipo}
          </p>
        )}

        {/* Descripción */}
        <p className="text-center text-lg italic text-gray-700 leading-relaxed">
          {recurso.descripcion}
        </p>

        {/* Datos simbólicos */}
        <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-gray-600">
          <span>
            <strong>Fase:</strong> {recurso.fase || "—"}
          </span>
          <span>
            <strong>Elemento:</strong> {recurso.elemento || "—"}
          </span>
          <span>
            <strong>Arquetipo:</strong> {recurso.arquetipo || "—"}
          </span>
          <span>
            <strong>Acceso:</strong>{" "}
            {recurso.tipo_suscripcion === "gratuito"
              ? "Gratuito"
              : recurso.tipo_suscripcion === "mensual"
              ? "Suscripción mensual"
              : recurso.tipo_suscripcion === "anual"
              ? "Suscripción anual"
              : recurso.tipo_suscripcion}
          </span>
        </div>

        {/* Icono decorativo final */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">Ciclo de sabiduría ancestral</p>
        </div>
      </div>
    </div>
  );
}
