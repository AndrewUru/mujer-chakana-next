"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import * as lune from "lune";
import { createClient } from "@supabase/supabase-js";
import { X, Sparkles, CalendarDays, MoonStar } from "lucide-react";

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

const fallbackPhase: FaseLunarDB = {
  nombre_fase: "Fase desconocida",
  simbolo: "·",
  color: "gray",
  rango_inicio: 0,
  rango_fin: 0,
  imagen_url: "",
  mensaje: "No encontramos informacion para este dia lunar.",
};

const colorMap = {
  gray: {
    border: "border-slate-400/50",
    gradient: "from-slate-900/90 via-slate-900/75 to-slate-900/60",
    badge: "bg-slate-100/10 border border-slate-200/30 text-slate-100",
  },
  emerald: {
    border: "border-emerald-300/40",
    gradient: "from-emerald-950/90 via-emerald-900/75 to-teal-900/60",
    badge: "bg-emerald-100/15 border border-emerald-200/40 text-emerald-100",
  },
  yellow: {
    border: "border-amber-300/45",
    gradient: "from-amber-950/90 via-amber-900/75 to-orange-900/60",
    badge: "bg-amber-100/15 border border-amber-200/40 text-amber-100",
  },
  purple: {
    border: "border-violet-300/45",
    gradient: "from-indigo-950/90 via-violet-900/75 to-purple-900/60",
    badge: "bg-violet-100/15 border border-violet-200/40 text-violet-100",
  },
} as const;

export default function LunarModal({ fecha, onClose }: LunarModalProps) {
  const [fase, setFase] = useState<FaseLunarDB | null>(null);
  const [closing, setClosing] = useState(false);
  const [loading, setLoading] = useState(true);

  const stars = useMemo(
    () =>
      Array.from({ length: 32 }, () => ({
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() * 1.6 + 0.4,
        opacity: 0.5 + Math.random() * 0.5,
        delay: Math.random() * 3,
      })),
    []
  );

  useEffect(() => {
    const fetchFase = async () => {
      setLoading(true);
      const { phase } = lune.phase(fecha);
      const age = phase * 29.53;

      const { data, error } = await supabase.from("fases_lunares").select("*");
      if (error || !data) {
        console.error("Error al cargar fases lunares:", error);
        setFase(fallbackPhase);
        setLoading(false);
        return;
      }

      const match =
        data.find(
          (f: FaseLunarDB) => age >= f.rango_inicio && age <= f.rango_fin
        ) ?? fallbackPhase;

      setFase(match);
      setLoading(false);
    };

    fetchFase();
  }, [fecha]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(onClose, 260);
  };

  const styles = fase ? colorMap[fase.color] ?? colorMap.gray : colorMap.gray;

  return (
    <div
      className={`fixed inset-0 z-90 flex items-center justify-center bg-black/70 backdrop-blur-2xl transition-all duration-300 ${
        closing ? "opacity-0 scale-95" : "opacity-100 scale-100"
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="lunar-modal-title"
      aria-live="polite"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70" />

      {fase && (
        <div
          className={`relative mx-4 w-full max-w-3xl overflow-hidden rounded-[36px] border ${styles.border} bg-gradient-to-br ${styles.gradient} shadow-[0_25px_80px_rgba(8,47,73,0.45)]`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12)_0%,_transparent_65%)]" />

          <button
            type="button"
            onClick={handleClose}
            className="absolute right-5 top-5 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white shadow-lg transition hover:scale-105 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200/70"
            aria-label="Cerrar modal lunar"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="absolute inset-0 z-10 pointer-events-none">
            {stars.map((star, index) => (
              <span
                key={index}
                className="absolute rounded-full bg-white/90 animate-lunar-twinkle"
                style={{
                  top: `${star.top}%`,
                  left: `${star.left}%`,
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                  opacity: star.opacity,
                  animationDelay: `${star.delay}s`,
                }}
              />
            ))}
          </div>

          <div className="relative z-20 grid gap-10 p-8 text-white sm:p-12 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-6 text-center lg:text-left">
              <div className="mx-auto flex h-44 w-44 items-center justify-center rounded-full border border-white/15 bg-white/10 shadow-inner shadow-sky-300/20 backdrop-blur">
                {loading ? (
                  <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-white/60" />
                ) : fase.imagen_url ? (
                  <Image
                    src={fase.imagen_url}
                    alt={fase.nombre_fase}
                    width={176}
                    height={176}
                    className="h-44 w-44 rounded-full object-contain"
                    priority
                  />
                ) : (
                  <MoonStar className="h-12 w-12 text-white/70" />
                )}
              </div>

              <div className="space-y-3">
                <span
                  className={`mx-auto flex w-max items-center gap-2 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${styles.badge}`}
                >
                  Fase lunar
                </span>
                <h1
                  id="lunar-modal-title"
                  className="text-3xl font-bold leading-tight sm:text-4xl"
                >
                  {fase.nombre_fase}
                </h1>
                <p className="text-sm text-white/70 sm:text-base">
                  Dia seleccionado:{" "}
                  {fecha.toLocaleDateString("es-ES", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                  })}
                </p>
              </div>

              {fase.mensaje && (
                <div className="rounded-3xl border border-white/15 bg-white/5 p-5 text-sm text-white/80 backdrop-blur sm:text-base">
                  <Sparkles className="mb-3 h-5 w-5 text-white/70" />
                  <p className="whitespace-pre-line leading-relaxed">
                    {fase.mensaje}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/75 backdrop-blur">
                <div className="flex items-center gap-3">
                  <CalendarDays className="h-5 w-5 text-white/70" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                      Rango de edad lunar
                    </p>
                    <p className="text-base font-semibold text-white">
                      Dia {Math.floor(fase.rango_inicio)} a dia{" "}
                      {Math.ceil(fase.rango_fin)}
                    </p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed">
                  Esta fase despierta cualidades asociadas al arquetipo de la
                  luna en tu mandala ciclico. Escucha que sensaciones emergen y
                  como dialogan con tu ciclo actual.
                </p>
              </div>

              <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <h2 className="text-base font-semibold text-white">
                  Como integrar esta fase?
                </h2>
                <ul className="space-y-3 text-sm text-white/75">
                  <li className="flex gap-3">
                    <Sparkles className="mt-1 h-4 w-4 text-white/60" />
                    Permite que tus emociones tengan un cauce creativo:
                    escribir, dibujar o grabar una nota de voz puede ayudarte a
                    escuchar lo que sientes.
                  </li>
                  <li className="flex gap-3">
                    <Sparkles className="mt-1 h-4 w-4 text-white/60" />
                    Observa como tu energia fisica responde a esta fase lunar y
                    toma decisiones suaves sobre descanso o movimiento.
                  </li>
                  <li className="flex gap-3">
                    <Sparkles className="mt-1 h-4 w-4 text-white/60" />
                    Registra en el moonboard lo que descubras para reconocer
                    patrones en futuras vueltas.
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="w-full rounded-2xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:border-white/40 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                Volver al moonboard
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes lunar-twinkle {
          0%,
          100% {
            opacity: 0.9;
          }
          50% {
            opacity: 0.2;
          }
        }
        .animate-lunar-twinkle {
          animation: lunar-twinkle 3.2s ease-in-out infinite alternate;
        }
      `}</style>
    </div>
  );
}
