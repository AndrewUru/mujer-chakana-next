"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
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
  imagen_url: string;
  mensaje?: string;
}

interface LunarModalProps {
  fecha: Date;
  onClose: () => void;
}

export default function LunarModal({ fecha, onClose }: LunarModalProps) {
  const [fase, setFase] = useState<FaseLunarDB | null>(null);
  const [closing, setClosing] = useState(false);

  // Genera estrellas solo una vez por apertura del modal
  const stars = useMemo(
    () =>
      [...Array(26)].map(() => ({
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() * 1.6 + 0.4,
        opacity: 10 + Math.floor(Math.random() * 30),
        delay: Math.random() * 3,
      })),
    []
  );

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
          imagen_url: "",
          mensaje: "No hay datos para esta fase.",
        }
      );
    };

    fetchFase();
  }, [fecha]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-2xl flex items-center justify-center transition-all duration-300 ${
        closing
          ? "opacity-0 scale-95 pointer-events-none"
          : "opacity-100 scale-100"
      }`}
    >
      {fase && (
        <div
          className="relative w-full max-w-lg mx-4 rounded-3xl overflow-hidden shadow-2xl ring-2 ring-blue-400/30 backdrop-blur-md border border-white/10"
          style={{
            boxShadow:
              "0 0 40px 8px rgba(103, 232, 249, 0.3), 0 4px 40px rgba(60, 60, 100, 0.3)",
          }}
        >
          {/* Fondo Glassmorphism nocturno */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-blue-950/60 to-slate-900/60 backdrop-blur-2xl z-10" />

          {/* Estrellas animadas, posición estable */}
          <div className="absolute inset-0 z-20 pointer-events-none">
            {stars.map((s, i) => (
              <span
                key={i}
                className={`absolute rounded-full bg-white/[${s.opacity}] animate-twinkle`}
                style={{
                  top: `${s.top}%`,
                  left: `${s.left}%`,
                  width: `${s.size}px`,
                  height: `${s.size}px`,
                  animationDelay: `${s.delay}s`,
                }}
              />
            ))}
          </div>

          {/* Contenido lunar */}
          <div
            className="
              relative z-30 flex flex-col justify-center items-center
              h-auto px-4 py-2 space-y-5 text-center
              overflow-y-auto
            "
          >
            {/* Animación luna con imagen, responsive */}
            <div className="animate-float flex items-center justify-center">
              {fase.imagen_url ? (
                <Image
                  src={fase.imagen_url}
                  alt={fase.nombre_fase}
                  width={240}
                  height={240}
                  className="w-60 h-60 sm:w-96 sm:h-96 object-contain drop-shadow-[0_0_22px_#f9fafbcc] shadow-lg"
                  style={{
                    filter:
                      "drop-shadow(0 0 22px #f9fafb99) drop-shadow(0 0 16px #38bdf8cc)",
                  }}
                  loading="lazy"
                  unoptimized
                />
              ) : (
                <div className="w-32 h-32 flex items-center justify-center bg-slate-700/30 rounded-full">
                  <span className="text-4xl">🌑</span>
                </div>
              )}
            </div>

            <h2
              className="text-3xl sm:text-4xl font-bold tracking-wide text-white drop-shadow-lg mb-1"
              style={{ textShadow: "0 4px 32px #1e293b" }}
            >
              {fase.nombre_fase}
            </h2>
            <div className="text-base text-slate-200/90">
              {fecha.toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            {fase.mensaje && (
              <p className="text-lg sm:text-xl font-medium italic text-sky-100/90 max-w-xl mx-auto drop-shadow">
                {fase.mensaje}
              </p>
            )}
          </div>

          {/* Botón cerrar */}
          <button
            onClick={handleClose}
            className="absolute top-5 right-5 z-50 flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600/80 via-sky-400/60 to-blue-500/80 hover:scale-105 shadow-xl border border-white/10 transition-all hover:from-rose-600 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-sky-200/60"
            aria-label="Cerrar modal"
            style={{
              boxShadow: "0 0 16px 2px #7dd3fc, 0 0 6px 1px #fff2",
              color: "#fff",
            }}
          >
            <span className="text-2xl font-bold">×</span>
          </button>
        </div>
      )}

      {/* Animaciones CSS extra */}
      <style jsx global>{`
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-16px);
          }
          100% {
            transform: translateY(0px);
          }
        }
        .animate-float {
          animation: float 3.3s ease-in-out infinite;
        }
        @keyframes twinkle {
          0%,
          100% {
            opacity: 0.7;
          }
          50% {
            opacity: 0.1;
          }
        }
        .animate-twinkle {
          animation: twinkle 2.7s infinite;
        }
      `}</style>
    </div>
  );
}
