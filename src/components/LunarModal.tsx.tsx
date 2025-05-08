"use client";

import { useEffect, useState } from "react";
import { phase } from "lune";
import Image from "next/image";
import { motion } from "framer-motion";

export default function LunarModal({
  day,
  fecha,
  onClose,
}: {
  day: number;
  fecha: string;
  onClose: () => void;
}) {
  const [faseLunar, setFaseLunar] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [themeColor, setThemeColor] = useState("gray");
  const [emocion, setEmocion] = useState<string | null>(null); // Estado para emoción

  useEffect(() => {
    const calcularFaseLunar = () => {
      const fechaActual = new Date(fecha);
      const { phase: faseDecimal } = phase(fechaActual);

      let nombreFase = "";
      let color = "";
      let consejo = "";

      if (faseDecimal === 0) {
        nombreFase = "🌑 Luna Nueva";
        color = "gray";
        consejo = "Planta tu intención 🌱";
      } else if (faseDecimal > 0 && faseDecimal < 0.25) {
        nombreFase = "🌒 Luna Creciente";
        color = "emerald";
        consejo = "Activa tu energía y creatividad 💡";
      } else if (faseDecimal === 0.25) {
        nombreFase = "🌓 Cuarto Creciente";
        color = "emerald";
        consejo = "Construye tus proyectos 🏗️";
      } else if (faseDecimal > 0.25 && faseDecimal < 0.5) {
        nombreFase = "🌔 Gibosa Creciente";
        color = "emerald";
        consejo = "Expande tu poder y conecta ✨";
      } else if (faseDecimal === 0.5) {
        nombreFase = "🌕 Luna Llena";
        color = "yellow";
        consejo = "Celebra y brilla con plenitud 🌟";
      } else if (faseDecimal > 0.5 && faseDecimal < 0.75) {
        nombreFase = "🌖 Gibosa Menguante";
        color = "purple";
        consejo = "Reflexiona y comparte aprendizajes 🪞";
      } else if (faseDecimal === 0.75) {
        nombreFase = "🌗 Cuarto Menguante";
        color = "purple";
        consejo = "Libera lo que ya no sirve 🌬️";
      } else if (faseDecimal > 0.75 && faseDecimal < 1) {
        nombreFase = "🌘 Luna Menguante";
        color = "purple";
        consejo = "Introspección y descanso 💤";
      } else {
        nombreFase = "🌑 Luna Nueva";
        color = "gray";
        consejo = "Reinicia tu ciclo con nuevas intenciones 🌱";
      }

      setFaseLunar(nombreFase);
      setMensaje(consejo);
      setThemeColor(color);
    };

    calcularFaseLunar();
  }, [fecha]);

  const fondos: Record<string, string> = {
    gray: "/luna.png",
    emerald: "/luna.png",
    yellow: "/luna.png",
    purple: "/luna.png",
  };

  // Posible función para guardar emoción en la base de datos (aún no implementada)
  const guardarEmocion = () => {
    console.log("Emoción seleccionada:", emocion);
    // Aquí luego puedes integrar Supabase u otra persistencia
  };

  return (
    <div
      className="fixed inset-0 z-50 w-full h-full overflow-hidden flex flex-col items-center justify-center pt-20" // pt-20 para que no tape la navbar
      style={{
        backgroundColor: "black",
        backgroundImage: `url(${fondos[themeColor]})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [0, 1, -1, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 6,
            ease: "easeInOut",
          }}
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
        className={`relative z-10 max-w-3xl w-[90%] mx-4 p-10 rounded-3xl backdrop-blur-xl shadow-2xl border-4 ${
          themeColor === "emerald"
            ? "border-emerald-400/60"
            : themeColor === "yellow"
            ? "border-yellow-400/60"
            : themeColor === "purple"
            ? "border-purple-400/60"
            : "border-gray-400/60"
        } bg-black/50 text-center space-y-6 animate-fade-in-up`}
      >
        <h2
          className={`text-3xl sm:text-6xl font-extrabold ${
            themeColor === "emerald"
              ? "text-emerald-300"
              : themeColor === "yellow"
              ? "text-yellow-300"
              : themeColor === "purple"
              ? "text-purple-300"
              : "text-gray-300"
          }`}
        >
          Día {day} del ciclo 🌙
        </h2>

        <p className="text-lg text-gray-200">Fase lunar actual:</p>
        <p
          className={`text-3xl sm:text-4xl font-semibold ${
            themeColor === "emerald"
              ? "text-emerald-200"
              : themeColor === "yellow"
              ? "text-yellow-200"
              : themeColor === "purple"
              ? "text-purple-200"
              : "text-gray-200"
          }`}
        >
          {faseLunar}
        </p>

        <p className="text-lg italic text-gray-300">{mensaje}</p>

        {/* Selector de emoción */}
        <div className="space-y-2">
          <p className="text-lg text-gray-200">¿Cómo te sientes hoy?</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setEmocion("tranquila")}
              className={`w-12 h-12 rounded-full ${
                emocion === "tranquila" ? "ring-4 ring-blue-300" : ""
              } bg-blue-500`}
            ></button>
            <button
              onClick={() => setEmocion("intensa")}
              className={`w-12 h-12 rounded-full ${
                emocion === "intensa" ? "ring-4 ring-red-300" : ""
              } bg-red-500`}
            ></button>
            <button
              onClick={() => setEmocion("creativa")}
              className={`w-12 h-12 rounded-full ${
                emocion === "creativa" ? "ring-4 ring-green-300" : ""
              } bg-green-500`}
            ></button>
          </div>
        </div>

        {/* Botón cerrar */}
        <button
          onClick={() => {
            guardarEmocion();
            onClose();
          }}
          className={`mt-6 px-8 py-2 rounded-full bg-gradient-to-r ${
            themeColor === "emerald"
              ? "from-emerald-500 to-emerald-700"
              : themeColor === "yellow"
              ? "from-yellow-500 to-yellow-700"
              : themeColor === "purple"
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
