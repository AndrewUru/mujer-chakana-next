// components/CycleCard.tsx
import React from "react";

interface Props {
  day: number;
  arquetipo: string;
  elemento: string;
  descripcion: string;
  audioUrl?: string;
  tip_extra: string;
  imagenUrl?: string;
  ritualPdf?: string;
  semana?: number;
}

export default function CycleCard({
  day,
  arquetipo,
  elemento,
  tip_extra,
  descripcion,
  audioUrl,
  imagenUrl,
  ritualPdf,
  semana,
}: Props) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-pink-200 space-y-4">
      <p className="text-sm text-pink-700">
        Estás en el día {day} de tu ciclo de 28 días
        {semana && ` (Semana ${semana})`}.
      </p>

      <h2 className="text-2xl font-bold text-pink-900">
        🔮 Día {day} – {arquetipo}
      </h2>

      <p className="text-pink-600 font-medium">Elemento: {elemento}</p>

      {imagenUrl && (
        <img
          src={imagenUrl}
          alt={`Imagen del arquetipo ${arquetipo}`}
          className="w-full h-auto rounded-lg border border-pink-100"
        />
      )}

      <p className="text-gray-800">{descripcion}</p>

      {tip_extra && (
        <div className="bg-pink-50 border border-pink-100 p-3 rounded-lg text-pink-800 text-sm">
          🌿 <strong>Tip extra:</strong> {tip_extra}
        </div>
      )}

      {ritualPdf && (
        <a
          href={ritualPdf}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-sm text-pink-700 underline mt-2"
        >
          Ver ritual en PDF ✨
        </a>
      )}

      {audioUrl && (
        <div className="pt-4">
          <audio controls className="w-full">
            <source src={audioUrl} type="audio/mpeg" />
            Tu navegador no soporta audio 😢
          </audio>
        </div>
      )}
    </div>
  );
}
