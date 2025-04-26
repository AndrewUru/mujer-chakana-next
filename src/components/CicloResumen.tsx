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
  return (
    <div className="mb-6 bg-gradient-to-br from-pink-100 to-pink-50 p-6 rounded-2xl shadow-lg border border-pink-300 transition hover:shadow-2xl">
      <h3 className="text-2xl font-bold text-pink-800 mb-4 flex items-center gap-2">
        🌙 Tu Ciclo Actual
      </h3>

      {userName && (
        <p className="text-md text-gray-700 mb-2">
          Hola, <span className="font-semibold text-pink-700">{userName}</span>{" "}
          👋
        </p>
      )}

      <p className="text-base text-gray-700 mb-1">
        Hoy es <strong>{new Date().toLocaleDateString()}</strong>.
      </p>

      <p className="text-base text-gray-700 mb-1">
        Estás en el <strong>Día {day}</strong> de tu ciclo ✨
      </p>

      <p className="text-base text-gray-600 mt-2">
        Desde: <strong>{fechaInicioCiclo.toLocaleDateString()}</strong> — Hasta:{" "}
        <strong>{fechaFinCiclo.toLocaleDateString()}</strong>
      </p>

      {/* Datos mujer_chakana */}
      <div className="mt-6 space-y-3">
        <h4 className="text-xl font-semibold text-fuchsia-800">
          🔮 Arquetipo: {mujerChakanaData.arquetipo}
        </h4>

        <p className="text-sm text-pink-700">
          Elemento: <strong>{mujerChakanaData.elemento}</strong>
        </p>

        <p className="text-gray-700 text-sm">{mujerChakanaData.descripcion}</p>

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
            className="block text-center mt-3 p-2 bg-pink-300 text-pink-900 rounded-lg hover:bg-pink-400 transition"
          >
            📜 Ver Ritual del Día
          </a>
        )}

        {mujerChakanaData.tip_extra && (
          <p className="italic text-rose-600 text-sm mt-2">
            🌟 Consejo: {mujerChakanaData.tip_extra}
          </p>
        )}

        {mujerChakanaData.semana && (
          <p className="text-xs text-gray-500 text-center mt-2">
            Semana {mujerChakanaData.semana} del ciclo lunar
          </p>
        )}
      </div>

      <div className="mt-6 p-3 bg-pink-200 rounded-xl text-center text-pink-900 font-medium text-sm">
        Recuerda: Cada día de tu ciclo es una puerta a tu sabiduría interior 🌺
      </div>
    </div>
  );
}
