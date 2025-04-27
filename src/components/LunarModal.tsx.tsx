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
        // 🌿 Elegancia para fases intermedias
        setFaseLunar("🌘 Transición lunar");
        setMensaje("Un momento suave para escuchar tu intuición. 🤍");
      }
    };

    calcularFaseLunar();
  }, [fecha]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-96 shadow-2xl text-center animate-fade-in">
        <h2 className="text-2xl font-bold text-pink-700 mb-4">
          Día {day} del ciclo
        </h2>

        <p className="text-lg text-gray-700 mb-1">Fase lunar:</p>
        <p className="text-xl font-semibold text-indigo-700 mb-4">
          {faseLunar}
        </p>

        <p className="text-md italic text-gray-600">{mensaje}</p>

        <button
          onClick={onClose}
          className="mt-6 bg-gradient-to-r from-pink-500 to-pink-700 text-white px-6 py-2 rounded-full hover:scale-105 transition"
        >
          🌸 Cerrar
        </button>
      </div>
    </div>
  );
}
