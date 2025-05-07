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

  useEffect(() => {
    const fetchSuscripcion = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("perfiles")
        .select("suscripcion_activa")
        .eq("user_id", user.id)
        .single();

      if (data?.suscripcion_activa) {
        setSuscripcionActiva(true);
      }
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

        <div className="mt-6 p-4 rounded-lg bg-white/10 border border-white/20">
          <h4 className="text-xl font-bold mb-1">
            🔮 Arquetipo: {mujerChakanaData.arquetipo}
          </h4>
          <p className="text-sm italic text-white/80">
            {mujerChakanaData.descripcion}
          </p>

          {mujerChakanaData.audio_url &&
            (suscripcionActiva ? (
              <audio controls className="w-full mt-4">
                <source src={mujerChakanaData.audio_url} type="audio/mpeg" />
              </audio>
            ) : (
              <div className="mt-4 text-center">
                <p className="text-pink-100 italic mb-2">
                  🔒 Audio exclusivo para suscriptoras.
                </p>
                <Link
                  href="/suscripcion"
                  className="inline-block px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-sm font-medium"
                >
                  Activar mi suscripción
                </Link>
              </div>
            ))}

          {mujerChakanaData.ritual_pdf &&
            (suscripcionActiva ? (
              <a
                href={mujerChakanaData.ritual_pdf}
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-4 text-center p-2 bg-pink-600 rounded-lg text-white hover:bg-pink-700 transition"
              >
                📜 Ver Ritual del Día
              </a>
            ) : (
              <div className="mt-4 text-center">
                <p className="text-pink-100 italic mb-2">
                  🔒 Ritual disponible solo con suscripción.
                </p>
                <Link
                  href="/suscripcion"
                  className="inline-block px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-sm font-medium"
                >
                  Ver planes de suscripción
                </Link>
              </div>
            ))}
        </div>

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
