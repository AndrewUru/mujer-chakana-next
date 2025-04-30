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
    Agua: "url('https://elsaltoweb.es/wp-content/uploads/2025/04/agua.png')",
    Fuego: "url('https://elsaltoweb.es/wp-content/uploads/2025/04/fuego.png')",
    Tierra:
      "url('https://elsaltoweb.es/wp-content/uploads/2025/04/tierra.png')",
    Aire: "url('https://elsaltoweb.es/wp-content/uploads/2025/04/aire.png')",
    default:
      "url('https://elsaltoweb.es/wp-content/uploads/2025/04/tierra.png')",
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
      <div className="relative z-10 shadow-lg text-white">
        <h2 className="text-xl mb-1">
          Elemento:{" "}
          <span className="font-semibold text-green-200">
            {mujerChakanaData.elemento}
          </span>
        </h2>
        <h3 className="text-3xl font-bold mb-2 flex items-center gap-2">
          🌙 Tu Ciclo Actual
        </h3>

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

        <div className="text-sm mb-4 space-y-1">
          <p>
            <span className="font-semibold">Inicio:</span>{" "}
            {fechaInicioCiclo.toLocaleDateString()}
          </p>
          <p>
            <span className="font-semibold">Fin:</span>{" "}
            {fechaFinCiclo.toLocaleDateString()}
          </p>
          {mujerChakanaData.semana && (
            <p>
              <span className="font-semibold">Semana:</span>{" "}
              {mujerChakanaData.semana} del ciclo lunar
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

          {mujerChakanaData.audio_url && (
            <audio controls className="w-full mt-4">
              <source src={mujerChakanaData.audio_url} type="audio/mpeg" />
              Tu navegador no soporta audio.
            </audio>
          )}

          {mujerChakanaData.ritual_pdf && (
            <a
              href={mujerChakanaData.ritual_pdf}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-4 text-center p-2 bg-pink-600 rounded-lg text-white hover:bg-pink-700 transition"
            >
              📜 Ver Ritual del Día
            </a>
          )}
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
