"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface MujerChakanaData {
  id: number;
  arquetipo: string;
  elemento: string;
  mensaje: string;
  audio_url: string;
}

export default function CicloPage() {
  const [ciclo, setCiclo] = useState<MujerChakanaData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCiclo = async () => {
      const { data, error } = await supabase
        .from("mujer_chakana")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        console.error("Error al cargar el ciclo:", error.message);
      } else {
        setCiclo(data);
      }

      setLoading(false);
    };

    fetchCiclo();
  }, []);

  if (loading) return <p className="text-center mt-10">Cargando el ciclo completo...</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center text-pink-800 mb-6">
        🌕 Ciclo completo de Mujer Chakana
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ciclo.map((dia) => (
          <div
            key={dia.id}
            className="border border-pink-300 rounded-lg p-4 bg-white shadow-md"
          >
            <h2 className="text-lg font-semibold text-pink-700">
              Día {dia.id}: {dia.arquetipo}
            </h2>
            <p className="text-sm text-purple-600 mb-1">
              Elemento: {dia.elemento}
            </p>
            <p className="text-gray-800 italic mb-2">"{dia.mensaje}"</p>
            <audio controls className="w-full">
              <source src={dia.audio_url} type="audio/mpeg" />
              Tu navegador no soporta audio.
            </audio>
          </div>
        ))}
      </div>
    </div>
  );
}
