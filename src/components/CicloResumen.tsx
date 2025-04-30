"use client";

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
  const fondoPorElemento: Record<string, string> = {
    Agua: "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80')",
    Fuego:
      "url('https://images.unsplash.com/photo-1551201601-8d6d2f6d5bbf?auto=format&fit=crop&w=1600&q=80')",
    Tierra:
      "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80')",
    Aire: "url('https://images.unsplash.com/photo-1498654209321-103b5fbc89a5?auto=format&fit=crop&w=1600&q=80')",
    default:
      "url('https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1600&q=80')",
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
      }}
    >
      {/* Overlay oscuro para legibilidad */}
      <div className="absolute inset-0 bg-black/50 rounded-2xl pointer-events-none" />

      {/* Contenido */}
      <div className="relative z-10">
        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
          🌙 Tu Ciclo Actual
        </h3>

        {userName && (
          <p className="text-md mb-2">
            Hola, <span className="font-semibold">{userName}</span> 👋
          </p>
        )}

        <p className="text-base mb-1">
          Hoy es <strong>{new Date().toLocaleDateString()}</strong>.
        </p>

        <p className="text-base mb-1">
          Estás en el <strong>Día {day}</strong> de tu ciclo ✨
        </p>

        <p className="text-base mt-2">
          Desde: <strong>{fechaInicioCiclo.toLocaleDateString()}</strong> —
          Hasta: <strong>{fechaFinCiclo.toLocaleDateString()}</strong>
        </p>

        {/* Datos mujer_chakana */}
        <div className="mt-6 space-y-3">
          <h4 className="text-xl font-semibold">
            🔮 Arquetipo: {mujerChakanaData.arquetipo}
          </h4>

          <p className="text-sm">
            Elemento: <strong>{mujerChakanaData.elemento}</strong>
          </p>

          <p className="text-sm">{mujerChakanaData.descripcion}</p>

          {mujerChakanaData.audio_url && (
            <audio controls className="w-full mt-3">
              <source src={mujerChakanaData.audio_url} type="audio/mpeg" />
              Tu navegador no soporta audio.
            </audio>
          )}

          {mujerChakanaData.ritual_pdf && (
            <a
              href={mujerChakanaData.ritual_pdf}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center mt-3 p-2 bg-white/20 rounded-lg hover:bg-white/30 transition"
            >
              📜 Ver Ritual del Día
            </a>
          )}

          {mujerChakanaData.tip_extra && (
            <p className="italic text-sm mt-2">
              🌟 Consejo: {mujerChakanaData.tip_extra}
            </p>
          )}

          {mujerChakanaData.semana && (
            <p className="text-xs text-center mt-2">
              Semana {mujerChakanaData.semana} del ciclo lunar
            </p>
          )}
        </div>

        <div className="mt-6 p-3 bg-white/10 rounded-xl text-center font-medium text-sm">
          Recuerda: Cada día de tu ciclo es una puerta a tu sabiduría interior
          🌺
        </div>
      </div>
    </div>
  );
}
