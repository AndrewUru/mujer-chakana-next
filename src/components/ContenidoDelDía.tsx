"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Contenido {
  id: number;
  dia_ciclo: number;
  semana: number;
  arquetipo: string;
  descripcion: string;
  elemento: string;
  imagen_url: string | null;
  audio_url: string | null;
  video_url?: string | null;
  pdf_url?: string | null;
}

export default function ContenidoDelDia() {
  const [contenido, setContenido] = useState<Contenido | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContenido = async () => {
      const today = new Date().getDate() % 28 || 1;

      const { data, error } = await supabase
        .from("mujer_chakana")
        .select("*")
        .eq("dia_ciclo", today)
        .single();

      if (error) {
        console.error("❌ Error al traer el contenido:", error.message);
      } else {
        setContenido(data);
      }

      setLoading(false);
    };

    fetchContenido();
  }, []);

  if (loading)
    return (
      <p className="text-center text-pink-700 mt-4">
        Cargando contenido del día...
      </p>
    );

  if (!contenido)
    return (
      <p className="text-center text-red-500 mt-4">
        No se encontró contenido para hoy.
      </p>
    );

  return (
    <div className="space-y-6 bg-white p-6 rounded-xl shadow mt-6">
      <h2 className="text-xl font-semibold text-pink-800">
        Día {contenido.dia_ciclo} – {contenido.arquetipo}
      </h2>

      <p className="text-pink-700 italic">{contenido.descripcion}</p>

      {contenido.imagen_url && (
        <img
          src={contenido.imagen_url}
          alt="Imagen del día"
          className="rounded-lg mx-auto"
        />
      )}

      {contenido.audio_url && (
        <audio controls className="w-full mt-4">
          <source src={contenido.audio_url} type="audio/mp3" />
          Tu navegador no soporta el audio.
        </audio>
      )}

      {contenido.video_url && (
        <div className="mt-4 aspect-video">
          <iframe
            src={contenido.video_url}
            title="Video del día"
            className="w-full h-full rounded"
            allowFullScreen
          />
        </div>
      )}

      {contenido.pdf_url && (
        <a
          href={contenido.pdf_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-pink-600 underline block text-center"
        >
          📄 Ver PDF del día
        </a>
      )}
    </div>
  );
}
