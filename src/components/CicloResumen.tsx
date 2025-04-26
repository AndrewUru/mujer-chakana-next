export default function CicloResumen({
  day,
  fechaInicioCiclo,
  fechaFinCiclo,
  userName,
}: {
  day: number;
  fechaInicioCiclo: Date;
  fechaFinCiclo: Date;
  userName?: string; // Opcional
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

      <div className="mt-4 p-3 bg-pink-200 rounded-xl text-center text-pink-900 font-medium text-sm">
        Recuerda: Cada día de tu ciclo es una puerta a tu sabiduría interior 🌺
      </div>
    </div>
  );
}
