// components/CycleCard.tsx
"use client";

import React from "react";
import Image from "next/image";
import { FileAudio, FileText, Sparkles } from "lucide-react";

interface Props {
  day: number;
  arquetipo: string;
  elemento: string;
  descripcion: string;
  audioUrl?: string;
  tip_extra: string;
  imagenUrl?: string;
  ritualPdf?: string;
  displayName?: string;
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
  displayName,
}: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-pink-200 space-y-5 transition-all">
      <p className="text-sm text-pink-600">
        Día <span className="font-semibold text-pink-800">{day}</span> de tu
        ciclo de 28 días
        {semana && (
          <span className="ml-2 text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full">
            Semana {semana}
          </span>
        )}
      </p>

      <h2 className="text-2xl font-bold text-pink-900">
        🔮 Día {day} – {arquetipo}
      </h2>

      <p className="text-sm font-medium text-pink-500 uppercase tracking-wide">
        Elemento: {elemento}
      </p>

      {imagenUrl && (
        <div className="relative w-full h-64 rounded-lg overflow-hidden border border-pink-100 shadow-md">
          <Image
            src={imagenUrl}
            alt={`Imagen del arquetipo ${arquetipo}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 700px"
          />
          {displayName && (
            <div className="text-md font-medium text-pink-700">
              ✨ Hola, {displayName}. Hoy estás en el día {day} de tu viaje
              cíclico 🌕
            </div>
          )}
        </div>
      )}

      <p className="text-gray-800 leading-relaxed text-justify whitespace-pre-line">
        {descripcion}
      </p>

      {tip_extra && (
        <div className="flex items-start gap-2 bg-pink-50 border border-pink-100 p-3 rounded-lg text-pink-800 text-sm">
          <Sparkles className="w-5 h-5 mt-1 text-pink-500" />
          <div>
            <strong>Tip extra:</strong> {tip_extra}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
        {ritualPdf && (
          <a
            href={ritualPdf}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-pink-600 hover:text-pink-800 font-medium"
          >
            <FileText className="w-4 h-4" /> Ver ritual en PDF
          </a>
        )}

        {audioUrl && (
          <div className="flex flex-col w-full sm:w-auto">
            <label className="text-sm text-pink-700 font-medium flex items-center gap-1">
              <FileAudio className="w-4 h-4" /> Audio guía:
            </label>
            <audio controls className="w-full mt-1">
              <source src={audioUrl} type="audio/mpeg" />
              Tu navegador no soporta audio 😢
            </audio>
          </div>
        )}
      </div>
    </div>
  );
}
