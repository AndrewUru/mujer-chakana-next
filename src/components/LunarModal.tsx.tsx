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

      setFaseLunar(etiquetas[faseMasCercana] || "🌘 Fase intermedia");

      // Puedes ajustar esto por fase si lo deseas
      const consejos: Record<string, string> = {
        new_date: "Planta tu intención 🌱",
        first_quarter: "Activa tu energía y creatividad 💡",
        full_date: "Celebra y brilla con plenitud ✨",
        last_quarter: "Libera lo que ya no sirve 🌬️",
      };

      setMensaje(consejos[faseMasCercana] || "Siente tu ritmo interior.");
    };

    calcularFaseLunar();
  }, [fecha]);

  return (
    <div className="fixed inset-0 bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-96 shadow-xl text-center">
        <h2 className="text-2xl font-bold text-pink-700 mb-3">
          Día {day} del ciclo
        </h2>

        <p className="text-lg mb-1">Fase lunar actual:</p>
        <p className="text-xl font-semibold text-indigo-700 mb-3">
          {faseLunar}
        </p>

        <p className="text-sm italic text-gray-700">{mensaje}</p>

        <button
          onClick={onClose}
          className="mt-6 bg-pink-600 text-white px-6 py-2 rounded hover:bg-pink-700 transition"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
