"use client";

import { useEffect, useState } from "react";

import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
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
}

export default LunarModalWithCalendar;

function LunarModalWithCalendar() {
  const [fasesDB, setFasesDB] = useState<FaseLunarDB[]>([]);

  useEffect(() => {
    const fetchFases = async () => {
      const { data, error } = await supabase.from("fases_lunares").select("*");
      if (error) {
        console.error("Error cargando fases:", error);
      } else {
        setFasesDB(data);
      }
    };
    fetchFases();
  }, []);

  interface FaseDia {
    date: Date;
    day: number;
    illumination: number;
    age: number;
    simbolo: string;
    color: "gray" | "emerald" | "yellow" | "purple";
    nombre_fase: string;
  }

  function getFaseFromAge(age: number, fases: FaseLunarDB[]) {
    return (
      fases.find(
        (fase) => age >= fase.rango_inicio && age <= fase.rango_fin
      ) || {
        nombre_fase: "Desconocida",
        simbolo: "❓",
        color: "gray",
      }
    );
  }

  function getMonthPhases(year: number, month: number): FaseDia[] {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const phases: FaseDia[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const { phase: phaseValue } = lune.phase(date);
      const illumination = Math.abs(Math.sin(phaseValue * Math.PI));
      const age = phaseValue * 29.53;
      const faseMatch = getFaseFromAge(age, fasesDB);

      phases.push({
        date,
        day,
        illumination,
        age,
        simbolo: faseMatch.simbolo,
        color: faseMatch.color,
        nombre_fase: faseMatch.nombre_fase,
      });
    }

    return phases;
  }
  const [phases, setPhases] = useState<FaseDia[]>([]);
  const [selectedDay, setSelectedDay] = useState<FaseDia | null>(null);

  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const data = getMonthPhases(year, month);
    setPhases(data);
  }, []);

  const fondos: Record<string, string> = {
    gray: "/luna.png",
    emerald: "/luna.png",
    yellow: "/luna.png",
    purple: "/luna.png",
  };

  const [monthName, setMonthName] = useState("");
  useEffect(() => {
    const now = new Date();
    const monthNames = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];
    setMonthName(monthNames[now.getMonth()]);
  }, []);

  function getColorFromAge(age: number): string {
    const fase = getFaseFromAge(age, fasesDB);
    return fase.nombre_fase;
  }

  return (
    <div
      className="relative min-h-screen p-6 flex flex-col items-center justify-start"
      style={{
        backgroundImage: `url(${fondos.gray})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Capa oscura para contraste */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md z-0" />

      {/* Encabezado */}
      <h1 className="z-10 text-white text-4xl font-semibold tracking-wide mb-8 animate-fade-in">
        🌓 Calendario Lunar – {monthName}
      </h1>

      {/* Calendario lunar */}
      <div className="z-10 grid grid-cols-7 gap-4 max-w-4xl mx-auto">
        {phases.map((fase) => (
          <div
            key={fase.day}
            onClick={() => setSelectedDay(fase)}
            className={`cursor-pointer w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-full transition-all hover:scale-110 shadow-lg
              ${
                fase.color === "emerald"
                  ? "bg-emerald-700/60 border-2 border-emerald-400"
                  : fase.color === "yellow"
                  ? "bg-yellow-600/60 border-2 border-yellow-300"
                  : fase.color === "purple"
                  ? "bg-purple-700/60 border-2 border-purple-400"
                  : "bg-gray-700/50 border-2 border-gray-400"
              }`}
          >
            <div className="flex flex-col items-center text-white text-sm font-medium">
              <div>{fase.day}</div>
              <div className="text-lg">{fase.simbolo}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal lunar del día seleccionado */}
      {selectedDay && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4"
          onClick={() => setSelectedDay(null)}
        >
          <div
            className={`relative bg-black rounded-3xl shadow-2xl p-6 w-full max-w-md text-center border-4
              ${
                selectedDay.color === "emerald"
                  ? "border-emerald-400"
                  : selectedDay.color === "yellow"
                  ? "border-yellow-400"
                  : selectedDay.color === "purple"
                  ? "border-purple-400"
                  : "border-gray-400"
              }`}
          >
            <h2 className="text-2xl text-white mb-2 font-semibold">
              Día {selectedDay.day}
            </h2>
            <div className="text-5xl mb-2">{selectedDay.simbolo}</div>
            <div className="text-white mb-4 capitalize">
              Fase: {getColorFromAge(selectedDay.age)}
            </div>
            <p className="text-white text-xl italic mb-2">
              {selectedDay.nombre_fase}
            </p>

            <div className="w-24 h-24 mx-auto mb-4">
              <CircularProgressbar
                value={selectedDay.illumination * 100}
                text={`${Math.round(selectedDay.illumination * 100)}%`}
                styles={buildStyles({
                  textColor: "#fff",
                  pathColor:
                    selectedDay.color === "emerald"
                      ? "#34d399"
                      : selectedDay.color === "yellow"
                      ? "#facc15"
                      : selectedDay.color === "purple"
                      ? "#a855f7"
                      : "#9ca3af",
                  trailColor: "#1f2937",
                })}
              />
            </div>
            <button
              className="mt-4 px-6 py-2 rounded-full bg-white text-black font-semibold shadow hover:scale-105 transition-all"
              onClick={() => setSelectedDay(null)}
            >
              ✨ Cerrar ✨
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
