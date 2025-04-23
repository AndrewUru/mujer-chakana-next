export default function CicloResumen({
  day,
  fechaInicioCiclo,
  fechaFinCiclo,
}: {
  day: number;
  fechaInicioCiclo: Date;
  fechaFinCiclo: Date;
}) {
  return (
    <div className="mb-6 bg-white p-4 rounded-xl shadow-md border border-pink-200">
      <h3 className="text-lg font-semibold text-pink-800 mb-2">
        🗓 Ciclo actual
      </h3>
      <p className="text-sm text-gray-700">
        Hoy es <strong>{new Date().toLocaleDateString()}</strong> — estás en el{" "}
        <strong>Día {day}</strong> de tu ciclo 🌕
      </p>
      <p className="text-sm text-gray-600 mt-1">
        Inicio: <strong>{fechaInicioCiclo.toLocaleDateString()}</strong> — Fin:{" "}
        <strong>{fechaFinCiclo.toLocaleDateString()}</strong>
      </p>
    </div>
  );
}
