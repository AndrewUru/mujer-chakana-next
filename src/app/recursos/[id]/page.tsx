"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
  const id =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
      ? params.id[0]
      : null;

  const [recurso, setRecurso] = useState<Recurso | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      const { data, error } = await supabase
        .from("recursos")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error al obtener recurso:", error.message);
      } else {
        setRecurso(data);
      }
    };

    fetchData();
  }, [id]);

  if (!recurso) return <p className="text-center mt-20">Cargando recurso...</p>;

  return (
    <div className="min-h-screen bg-transparent px-4 py-10">
      <div className="max-w-3xl mx-auto bg-white/80 backdrop-blur-xl border border-rose-200 rounded-3xl shadow-2xl p-8 space-y-8">
        {/* Título */}
        <h1 className="text-4xl font-bold text-center text-rose-700 tracking-wide">
          ✨ {recurso.titulo}
        </h1>

        {/* Contenido dinámico */}
        {recurso.tipo === "audio" ? (
          <div className="bg-rose-100 p-4 rounded-xl border border-pink-300 shadow-inner">
            <audio controls src={recurso.url} className="w-full rounded-md" />
          </div>
        ) : recurso.tipo === "pdf" ? (
          <iframe
            src={recurso.url}
            className="w-full h-[80vh] border-2 border-rose-300 rounded-xl shadow-md"
            allow="fullscreen"
          />
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
        </div>

        {/* Icono decorativo final */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">Ciclo de sabiduría ancestral</p>
        </div>
      </div>
    </div>
  );
}
