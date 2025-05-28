"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export interface MujerChakanaData {
  arquetipo: string;
  elemento: string;
  descripcion: string;
  imagen_url?: string;
  audio_url?: string;
  ritual_pdf?: string;
  video_url?: string;
  tip_extra?: string;
  semana?: number;
}

export default function CicloResumen({
  day,
  fechaInicioCiclo,
  fechaFinCiclo,
  userName,
  mujerChakanaData,
}: {
  day: number;
  fechaInicioCiclo: Date;
  fechaFinCiclo: Date;
  userName?: string;
  mujerChakanaData: MujerChakanaData;
}) {
  const [suscripcionActiva, setSuscripcionActiva] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuscripcion = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("perfiles")
        .select("suscripcion_activa")
        .eq("user_id", user.id)
        .single();
      setSuscripcionActiva(!!data?.suscripcion_activa);
      setLoading(false);
    };

    fetchSuscripcion();
  }, []);

  const fondoPorElemento: Record<string, string> = {
    Agua: "url('/agua-ui.webp')",
    Fuego: "url('/fuego-ui.webp')",
    Tierra: "url('/tierra-ui.webp')",
    Aire: "url('/cielo-ui.webp')",
    default: "url('/tierra-ui.webp')",
  };

  const fondoBg =
    fondoPorElemento[mujerChakanaData.elemento] || fondoPorElemento.default;

  if (loading) {
    return (
      <div className="mb-6 p-6 rounded-2xl shadow-lg border text-white bg-black/60">
        Cargando tu ciclo...
      </div>
    );
  }

  return (
    <div
      className="mb-6 p-6 rounded-2xl shadow-lg border relative overflow-hidden text-white"
      style={{
        backgroundImage: fondoBg,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-black/50 rounded-2xl pointer-events-none" />

      <div className="relative z-10">
        <h2 className="text-xl mb-1">
          Elemento:{" "}
          <span className="font-semibold text-green-200">
            {mujerChakanaData.elemento}
          </span>
        </h2>

        <h3 className="text-3xl font-bold mb-2">🌙 Tu Ciclo Actual</h3>

        {userName && (
          <p className="text-lg mb-4">
            ¡<span className="font-bold text-pink-300">{userName}</span>! 🌸 Hoy
            es <strong>{new Date().toLocaleDateString()}</strong>
          </p>
        )}

        <p className="text-base mb-2">
          Estás en el <strong className="text-yellow-300">día {day}</strong> de
          tu ciclo lunar ✨
        </p>

        <div className="text-sm mb-4">
          <p>
            <strong>Inicio:</strong> {fechaInicioCiclo.toLocaleDateString()}
          </p>
          <p>
            <strong>Fin:</strong> {fechaFinCiclo.toLocaleDateString()}
          </p>
          {mujerChakanaData.semana && (
            <p>
              <strong>Semana:</strong> {mujerChakanaData.semana} del ciclo lunar
            </p>
          )}
        </div>

        {(mujerChakanaData.audio_url ||
          mujerChakanaData.ritual_pdf ||
          mujerChakanaData.video_url) &&
          suscripcionActiva && (
            <Link
              href={`/ritual?pdf=${encodeURIComponent(
                mujerChakanaData.ritual_pdf || ""
              )}&audio=${encodeURIComponent(
                mujerChakanaData.audio_url || ""
              )}&video=${encodeURIComponent(mujerChakanaData.video_url || "")}`}
              className="block mt-4 text-center p-2 bg-pink-600 rounded-lg text-white hover:bg-pink-700 transition"
            >
              🌕 Ver Contenido del Día
            </Link>
          )}

        {mujerChakanaData.tip_extra && (
          <div className="mt-6 bg-yellow-100/10 border-l-4 border-yellow-300 p-4 rounded-md text-sm italic text-yellow-100">
            🌟 <strong>Consejo:</strong> {mujerChakanaData.tip_extra}
          </div>
        )}

        <p className="mt-6 text-center text-sm text-white/70 italic">
          Recuerda: Cada día de tu ciclo es una puerta a tu sabiduría interior
          🌺
        </p>
      </div>
    </div>
  );
}
