import React from "react";

const getFaseColor = (nombre: string) => {
  switch (nombre?.toLowerCase()) {
    case "agua":
      return "bg-gradient-to-br from-blue-100 via-cyan-100 to-indigo-100 text-blue-800";
    case "tierra":
      return "bg-gradient-to-br from-lime-100 via-emerald-100 to-teal-100 text-green-800";
    case "fuego":
      return "bg-gradient-to-br from-rose-100 via-red-100 to-amber-100 text-rose-800";
    case "aire":
      return "bg-gradient-to-br from-yellow-100 via-sky-100 to-white text-yellow-700";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getFaseIcon = (nombre: string) => {
  switch (nombre?.toLowerCase()) {
    case "agua":
      return "💧";
    case "tierra":
      return "🌱";
    case "fuego":
      return "🔥";
    case "aire":
      return "🌬️";
    default:
      return "🌑";
  }
};

interface Fase {
  nombre_fase: string;
  resumen_emocional: string;
}

interface FaseActualCardProps {
  fase: Fase;
}

export default function FaseActualCard({ fase }: FaseActualCardProps) {
  return (
    <div
      className={`mt-6 p-6 rounded-2xl shadow-xl border border-white/30 backdrop-blur-md relative overflow-hidden transition-all ${getFaseColor(
        fase.nombre_fase
      )}`}
    >
      {/* Ícono elemental sutil en el fondo */}
      <div className="absolute -top-4 -right-4 opacity-10 text-6xl pointer-events-none">
        {getFaseIcon(fase.nombre_fase)}
      </div>

      {/* Contenido principal */}
      <h3 className="text-2xl font-semibold tracking-wider italic mb-2">
        ✨ Fase actual: <span className="uppercase">{fase.nombre_fase}</span>
      </h3>

      <p className="text-base leading-relaxed font-light italic">
        {fase.resumen_emocional}
      </p>
    </div>
  );
}
