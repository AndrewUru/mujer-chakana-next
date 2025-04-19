import React from "react";

interface Props {
  day: number;
  arquetipo: string;
  elemento: string;
  mensaje: string;
  descripcion: string;
  audioUrl?: string;
  tip_extra: string;
}

export default function CycleCard({
  day,
  arquetipo,
  elemento,
  tip_extra,
  descripcion,
  audioUrl,
}: Props) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-pink-200">
      <p className="text-sm text-pink-700 mb-2">
        Estás en el día {day} de tu ciclo de 28 días.
      </p>
      <h2 className="text-xl font-bold text-pink-900 mb-1">
        🔮 Día {day} – {arquetipo}
      </h2>
      <p className="text-pink-600 mb-2">Elemento: {elemento}</p>
      <p className="text-gray-700 italic">{tip_extra}</p>
      <p className="text-gray-700 italic">{descripcion}</p>

      {audioUrl && (
        <div className="mt-4">
          <audio controls className="w-full">
            <source src={audioUrl} type="audio/mpeg" />
            Tu navegador no soporta audio 😢
          </audio>
        </div>
      )}
    </div>
  );
}
