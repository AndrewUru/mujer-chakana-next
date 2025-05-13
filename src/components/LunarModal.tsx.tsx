"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { getLunarPhase } from "@/lib/getLunarPhase";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

interface FaseLunar {
  id: string;
  nombre_fase: string;
  simbolo: string;
  color: "gray" | "emerald" | "yellow" | "purple";
  rango_inicio: number;
  rango_fin: number;
  mensaje: string;
  decimalFase: number;
}

export default function LunarModal({
  day,
  fecha,
  onClose,
}: {
  day: number;
  fecha: string;
  onClose: () => void;
}) {
  const [fase, setFase] = useState<FaseLunar | null>(null);

  useEffect(() => {
    getLunarPhase(fecha).then((data) => {
      console.log("Fase lunar obtenida:", data);
      if (data) setFase(data);
    });
  }, [fecha]);

  const fondos: Record<string, string> = {
    gray: "/luna.png",
    emerald: "/luna.png",
    yellow: "/luna.png",
    purple: "/luna.png",
  };

  if (!fase) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center pt-20"
      style={{
        backgroundColor: "black",
        backgroundImage: `url(${fondos[fase.color]})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute flex items-center justify-center pointer-events-none">
        <motion.div
          animate={{ y: [0, -10, 0], rotate: [0, 1, -1, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        >
          <Image
            src="/luna.png"
            alt="Luna"
            width={400}
            height={400}
            className="w-[50%] max-w-[400px] opacity-30"
            priority
          />
        </motion.div>
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-800 to-black opacity-60 animate-pulse" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-15 animate-twinkle" />

      <div
        className={`relative z-10 max-w-3xl p-10 rounded-3xl backdrop-blur-xl shadow-2xl border-4 ${
          fase.color === "emerald"
            ? "border-emerald-400/60"
            : fase.color === "yellow"
            ? "border-yellow-400/60"
            : fase.color === "purple"
            ? "border-purple-400/60"
            : "border-gray-400/60"
        } bg-black/50 text-center space-y-6`}
      >
        <h2
          className={`text-2xl sm:text-4xl font-extrabold ${
            fase.color === "emerald"
              ? "text-emerald-300"
              : fase.color === "yellow"
              ? "text-yellow-300"
              : fase.color === "purple"
              ? "text-purple-300"
              : "text-gray-300"
          }`}
        >
          Día {day} del ciclo 🌙
        </h2>

        <p className="text-5xl">{fase.simbolo}</p>

        <p
          className={`text-3xl font-semibold ${
            fase.color === "emerald"
              ? "text-emerald-200"
              : fase.color === "yellow"
              ? "text-yellow-200"
              : fase.color === "purple"
              ? "text-purple-200"
              : "text-gray-200"
          }`}
        >
          {fase.nombre_fase}
        </p>

        <p className="text-lg italic text-gray-300 max-w-md mx-auto">
          {fase.mensaje || "🌑 Sin mensaje definido para esta fase lunar."}
        </p>

        <div className="w-32 h-32 mx-auto">
          <CircularProgressbar
            value={fase.decimalFase * 100}
            text={`${Math.round(fase.decimalFase * 100)}%`}
            styles={buildStyles({
              textColor: "#fff",
              pathColor:
                fase.color === "emerald"
                  ? "#34d399"
                  : fase.color === "yellow"
                  ? "#facc15"
                  : fase.color === "purple"
                  ? "#a855f7"
                  : "#9ca3af",
              trailColor: "#1f2937",
            })}
          />
        </div>

        <button
          onClick={onClose}
          className={`mt-6 px-8 py-2 rounded-full bg-gradient-to-r ${
            fase.color === "emerald"
              ? "from-emerald-500 to-emerald-700"
              : fase.color === "yellow"
              ? "from-yellow-500 to-yellow-700"
              : fase.color === "purple"
              ? "from-purple-500 to-purple-700"
              : "from-gray-500 to-gray-700"
          } text-white font-bold shadow-lg hover:scale-105 transition-all`}
        >
          Cerrar portal lunar ✨
        </button>
      </div>
    </div>
  );
}
