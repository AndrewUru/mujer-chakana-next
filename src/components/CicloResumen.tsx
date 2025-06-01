import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

// Define or import the MujerChakanaData type/interface
interface MujerChakanaData {
  elemento: string;
  semana?: string;
  audio_url?: string;
  ritual_pdf?: string;
  video_url?: string;
  tip_extra?: string;
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
  const [showUpsell, setShowUpsell] = useState(false);

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

  // --- NUEVO: handle para click en botón
  const handleNoAccess = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowUpsell(true);
  };

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
          (suscripcionActiva ? (
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
          ) : (
            <button
              className="block mt-4 text-center p-2 bg-pink-300/60 rounded-lg text-pink-700 cursor-not-allowed opacity-60"
              onClick={handleNoAccess}
              title="Necesitas suscripción para acceder"
            >
              🌕 Ver Contenido del Día
            </button>
          ))}

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

      {/* Modal o aviso de upsell */}
      {showUpsell && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm mx-auto text-center text-black">
            <h3 className="text-2xl font-bold mb-2">Contenido exclusivo</h3>
            <p className="mb-4">
              Necesitas una{" "}
              <span className="text-pink-600 font-bold">
                suscripción activa
              </span>{" "}
              para acceder a este recurso del día.
            </p>
            <Link
              href="/suscripcion"
              className="inline-block px-4 py-2 rounded-lg bg-pink-600 text-white font-semibold hover:bg-pink-700 transition mb-2"
            >
              Ver planes de suscripción
            </Link>
            <button
              onClick={() => setShowUpsell(false)}
              className="mt-2 block text-sm text-gray-600 hover:underline mx-auto"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
