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

interface LunarModalProps {
  fecha: Date;
  onClose: () => void;
}

export default function LunarModal({ fecha, onClose }: LunarModalProps) {
  const [fase, setFase] = useState<FaseLunarDB | null>(null);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const fetchFase = async () => {
      const { phase } = lune.phase(fecha);
      const age = phase * 29.53;

      const { data, error } = await supabase.from("fases_lunares").select("*");
      if (error || !data) {
        console.error("Error al cargar fases lunares:", error);
        return;
      }

      const match = data.find(
        (f: FaseLunarDB) => age >= f.rango_inicio && age <= f.rango_fin
      );

      setFase(
        match || {
          nombre_fase: "Desconocida",
          simbolo: "❓",
          color: "gray",
          mensaje: "No hay datos para esta fase.",
        }
      );
    };

    fetchFase();
  }, [fecha]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(onClose, 300); // para que la animación tenga tiempo
  };

  return (
    <div
      className={`fixed inset-0 z-50 bg-gradient-to-br from-black/60 to-purple-900/30 bg-[url('/luna.png')] bg-cover bg-center backdrop-blur-lg flex items-center justify-center transition-all duration-300 ${
        closing
          ? "opacity-0 scale-95 pointer-events-none"
          : "opacity-100 scale-100"
      }`}
    >
      {fase && (
        <div
          className={`relative rounded-3xl shadow-[0_0_30px_-5px_rgba(255,255,255,0.3)] p-8 w-full max-w-md mx-4 border-2 transition-all duration-300 transform backdrop-blur-xl ${
            fase.color === "emerald"
              ? "border-emerald-400/40 bg-emerald-900/80"
              : fase.color === "yellow"
              ? "border-amber-300/40 bg-yellow-800/80"
              : fase.color === "purple"
              ? "border-purple-300/40 bg-purple-900/80"
              : "border-stone-300/40 bg-stone-800/80"
          }`}
        >
          {/* Botón de cerrar mejorado */}
          <button
            onClick={handleClose}
            className="absolute -top-4 -right-4 text-white bg-rose-600/90 hover:bg-rose-500 px-3 py-2 rounded-full text-lg font-bold shadow-xl hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Cerrar modal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {/* Contenido con mejor espaciado */}
          <div className="space-y-6">
            {/* Icono con efecto flotante */}
            <div className="text-7xl text-center animate-float drop-shadow-[0_5px_10px_rgba(255,255,255,0.3)]">
              {fase.simbolo}
            </div>

            {/* Título con efecto tipográfico */}
            <h2 className="text-center text-3xl font-extrabold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent tracking-wide">
              {fase.nombre_fase}
            </h2>

            {/* Mensaje con mejor jerarquía */}
            {fase.mensaje && (
              <div className="relative group">
                <div className="absolute inset-0 bg-white/10 rounded-xl filter blur-xl -z-10 group-hover:opacity-50 transition-opacity" />
                <p className="text-center text-lg leading-relaxed text-white font-medium px-4 py-3 rounded-lg transition-all duration-300">
                  &quot;{fase.mensaje}&quot;
                </p>
              </div>
            )}
          </div>

          {/* Efecto de partículas decorativas */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white/30 rounded-full animate-star"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.5}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
