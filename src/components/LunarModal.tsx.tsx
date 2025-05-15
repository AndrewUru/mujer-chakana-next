"use client";

import { useEffect, useState } from "react";
import * as lune from "lune";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface FaseLunarDB {
  nombre_fase: string;
  simbolo: string;
  color: "gray" | "emerald" | "yellow" | "purple";
  rango_inicio: number;
  rango_fin: number;
  mensaje?: string;
}

interface FaseDia {
  date: Date;
  day: number;
  simbolo: string;
  color: "gray" | "emerald" | "yellow" | "purple";
  nombre_fase: string;
  mensaje?: string;
}

export default function LunarModalMVP() {
  // Removed unused state declaration
  const [phases, setPhases] = useState<FaseDia[]>([]);

  function getFaseFromAge(age: number, fases: FaseLunarDB[]) {
    return (
      fases.find(
        (fase) => age >= fase.rango_inicio && age <= fase.rango_fin
      ) || {
        nombre_fase: "Desconocida",
        simbolo: "❓",
        color: "gray",
        mensaje: "",
      }
    );
  }

  function generateMonthPhases(fases: FaseLunarDB[]) {
    const today = new Date();

    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const generatedPhases: FaseDia[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const { phase: phaseValue } = lune.phase(date);
      const age = phaseValue * 29.53;
      const faseMatch = getFaseFromAge(age, fases);

      console.log("🔍 faseMatch:", faseMatch);

      generatedPhases.push({
        date,
        day,
        simbolo: faseMatch.simbolo,
        color: faseMatch.color,
        nombre_fase: faseMatch.nombre_fase,
        mensaje: faseMatch.mensaje,
      });
    }

    setPhases(generatedPhases);
  }

  useEffect(() => {
    const fetchFases = async () => {
      const { data, error } = await supabase.from("fases_lunares").select("*");
      if (!error && data) {
        generateMonthPhases(data); // ✅ esto es lo único que necesitas
      } else {
        console.error("Error cargando fases:", error);
      }
    };
    fetchFases();
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
      {/* Tarjeta del día lunar actual */}
      {phases.length > 0 && (
        <div
          className={`relative bg-opacity-90 backdrop-blur-xl text-white rounded-3xl shadow-2xl p-8 w-full max-w-sm border-l-4
            ${
              phases[0].color === "emerald"
                ? "bg-emerald-800/90 border-emerald-400"
                : phases[0].color === "yellow"
                ? "bg-yellow-700/90 border-yellow-300"
                : phases[0].color === "purple"
                ? "bg-purple-800/90 border-purple-400"
                : "bg-stone-800/90 border-stone-400"
            }`}
        >
          {/* Botón de cerrar */}
          <button
            onClick={() => window.location.reload()} // o cerrar con un state si es modal real
            className="absolute top-3 right-3 text-white bg-rose-600 hover:bg-rose-500 px-3 py-1 rounded-full text-sm font-medium"
          >
            ✕
          </button>

          {/* Símbolo lunar */}
          <div className="text-5xl text-center mb-2">{phases[0].simbolo}</div>

          {/* Nombre de la fase */}
          <h2 className="text-center text-2xl font-semibold mb-1">
            {phases[0].nombre_fase}
          </h2>

          {/* Mensaje */}
          {phases[0].mensaje && (
            <p className="text-center text-sm text-stone-200 italic mt-3">
              “{phases[0].mensaje}”
            </p>
          )}
        </div>
      )}
    </div>
  );
}
