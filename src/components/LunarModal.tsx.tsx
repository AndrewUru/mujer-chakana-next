"use client";

import { useEffect, useState } from "react";
import { phase_hunt } from "lune";

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

  useEffect(() => {
    const calcularFaseLunar = () => {
      const fechaActual = new Date(fecha);
      const fases = phase_hunt(fechaActual);
      const ahora = fechaActual.getTime();

      const proximasFases = Object.entries(fases)
        .map(([nombre, date]) => ({
          nombre,
          timestamp: new Date(date as string | number | Date).getTime(),
        }))
        .sort(
          (a, b) =>
            Math.abs(a.timestamp - ahora) - Math.abs(b.timestamp - ahora)
        );

      const faseMasCercana = proximasFases[0].nombre;

      const etiquetas: Record<string, string> = {
        new_date: "🌑 Luna Nueva",
        first_quarter: "🌓 Cuarto Creciente",
        full_date: "🌕 Luna Llena",
        last_quarter: "🌗 Cuarto Menguante",
      };

      const consejos: Record<string, string> = {
        new_date: "Planta tu intención 🌱",
        first_quarter: "Activa tu energía y creatividad 💡",
        full_date: "Celebra y brilla con plenitud ✨",
        last_quarter: "Libera lo que ya no sirve 🌬️",
      };

      if (etiquetas[faseMasCercana]) {
        setFaseLunar(etiquetas[faseMasCercana]);
        setMensaje(consejos[faseMasCercana]);
      } else {
        setFaseLunar("🌘 Transición lunar");
        setMensaje("Un momento suave para escuchar tu intuición 🤍");
      }
    };

    calcularFaseLunar();
  }, [fecha]);

  return (
    <div className="fixed inset-0 z-50  backdrop-blur-sm flex items-center justify-center px-4">
      <div className="relative w-full max-w-md sm:max-w-lg bg-white/80 border border-pink-100 rounded-3xl p-8 shadow-2xl text-center animate-fade-in overflow-hidden backdrop-blur-md">
        {/* Imagen decorativa lunar */}
        <div className="absolute inset-0 z-0 bg-[url('https://elsaltoweb.es/wp-content/uploads/2025/04/luna.png')] bg-cover bg-center opacity-90 blur-sm rounded-3xl" />

        <div className="relative z-10 space-y-4">
          <h2 className="text-3xl font-extrabold text-rose-700 tracking-wide">
            Día {day} del ciclo 🌸
          </h2>

          <p className="text-sm text-gray-600">Fase lunar actual:</p>
          <p className="text-xl font-semibold text-indigo-600">{faseLunar}</p>

          <p className="text-base italic text-gray-700">{mensaje}</p>

          <button
            onClick={onClose}
            className="mt-6 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold px-6 py-2 rounded-full hover:scale-105 transition-all shadow-md"
          >
            ✨ Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
