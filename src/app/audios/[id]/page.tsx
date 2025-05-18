"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

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

export default function AudioPage() {
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
        console.error("Error al obtener el recurso:", error.message);
      } else {
        setRecurso(data);
      }
    };

    fetchData();
  }, [id]);

  if (!recurso) return <p className="text-center mt-20">Cargando recurso...</p>;

  return (
    <div className="min-h-screen bg-transparent py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl p-8 border border-rose-300 space-y-6">
        {/* Título destacado */}
        <h1 className="text-4xl font-extrabold text-center text-rose-700 tracking-wide">
          🌕 {recurso.titulo}
        </h1>

        {/* Reproductor personalizado */}
        <div className="rounded-xl bg-rose-100 p-4 shadow-inner">
          <audio controls src={recurso.url} className="w-full rounded-md" />
        </div>

        {/* Descripción */}
        <p className="text-center text-gray-800 text-lg italic">
          ✨ {recurso.descripcion}
        </p>

        {/* Detalles */}
        <div className="flex justify-around text-sm text-gray-600 mt-4">
          <div>
            <span className="font-semibold">Fase:</span> {recurso.fase || "—"}
          </div>
          <div>
            <span className="font-semibold">Elemento:</span>{" "}
            {recurso.elemento || "—"}
          </div>
          <div>
            <span className="font-semibold">Arquetipo:</span>{" "}
            {recurso.arquetipo || "—"}
          </div>
        </div>

        {/* Extra decorativo */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-400">Guía visual del ciclo</p>
        </div>
      </div>
    </div>
  );
}
