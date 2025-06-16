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

  const iconosElemento: Record<string, string> = {
    Agua: "🌊",
    Fuego: "🔥",
    Tierra: "🌍",
    Aire: "💨",
    default: "🌍",
  };

  const fondoBg =
    fondoPorElemento[mujerChakanaData.elemento] || fondoPorElemento.default;
  const iconoElemento =
    iconosElemento[mujerChakanaData.elemento] || iconosElemento.default;

  // --- NUEVO: handle para click en botón
  const handleNoAccess = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowUpsell(true);
  };

  if (loading) {
    return (
      <div className="mb-6 p-8 rounded-3xl shadow-xl border text-white bg-gradient-to-br from-purple-900/80 to-pink-900/80 backdrop-blur-sm">
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <span className="text-lg">Cargando tu ciclo...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="mb-8 p-8 rounded-3xl shadow-2xl border relative overflow-hidden text-white min-h-[400px] flex flex-col justify-center"
      style={{
        backgroundImage: fondoBg,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlay con gradiente más sofisticado */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/30 to-black/50 rounded-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* Elemento como protagonista */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm border border-white/30 mb-4">
            <span className="text-4xl">{iconoElemento}</span>
          </div>

          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
            {mujerChakanaData.elemento}
          </h1>

          <div className="inline-block px-6 py-2 rounded-full bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm border border-white/30">
            <span className="text-lg font-medium">Tu elemento del día</span>
          </div>
        </div>

        {/* Información del ciclo */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4 flex items-center justify-center">
            <span className="mr-3">🌙</span>
            Tu Ciclo Actual
            <span className="ml-3">🌙</span>
          </h2>

          {mujerChakanaData.semana && (
            <div className="inline-block px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500/30 to-purple-500/30 backdrop-blur-sm border border-pink-300/30">
              <p className="text-lg font-semibold">
                <span className="text-pink-200">Semana:</span>{" "}
                {mujerChakanaData.semana} del ciclo lunar
              </p>
            </div>
          )}
        </div>

        {/* Botón de contenido */}
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
              className="block mx-auto w-full max-w-md text-center p-4 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl text-white font-bold text-lg hover:from-pink-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <span className="flex items-center justify-center">
                <span className="mr-2">🌕</span>
                Ver Contenido del Día
                <span className="ml-2">🌕</span>
              </span>
            </Link>
          ) : (
            <button
              className="block mx-auto w-full max-w-md text-center p-4 bg-gradient-to-r from-gray-400/60 to-gray-500/60 rounded-2xl text-gray-700 font-bold text-lg cursor-not-allowed opacity-60 backdrop-blur-sm"
              onClick={handleNoAccess}
              title="Necesitas suscripción para acceder"
            >
              <span className="flex items-center justify-center">
                <span className="mr-2">🔒</span>
                Ver Contenido del Día
                <span className="ml-2">🔒</span>
              </span>
            </button>
          ))}

        {/* Consejo extra */}
        {mujerChakanaData.tip_extra && (
          <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm border border-yellow-300/30">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🌟</span>
              <div>
                <p className="font-semibold text-yellow-200 mb-1">
                  Consejo del día:
                </p>
                <p className="text-yellow-100 italic leading-relaxed">
                  {mujerChakanaData.tip_extra}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Mensaje inspiracional */}
        <div className="mt-8 text-center">
          <p className="text-lg text-white/80 italic leading-relaxed">
            Recuerda: Cada día de tu ciclo es una puerta a tu{" "}
            <span className="font-semibold text-pink-200">
              sabiduría interior
            </span>{" "}
            🌺
          </p>
        </div>
      </div>

      {/* Modal o aviso de upsell mejorado */}
      {showUpsell && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 shadow-2xl max-w-md mx-auto text-center text-black transform animate-in fade-in duration-300">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center">
              <span className="text-2xl">🔒</span>
            </div>

            <h3 className="text-2xl font-bold mb-3 text-gray-800">
              Contenido exclusivo
            </h3>
            <p className="mb-6 text-gray-600 leading-relaxed">
              Necesitas una{" "}
              <span className="text-pink-600 font-bold">
                suscripción activa
              </span>{" "}
              para acceder a este recurso del día.
            </p>

            <div className="space-y-3">
              <Link
                href="/suscripcion"
                className="block w-full px-6 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold hover:from-pink-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
              >
                Ver planes de suscripción
              </Link>
              <button
                onClick={() => setShowUpsell(false)}
                className="block w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
