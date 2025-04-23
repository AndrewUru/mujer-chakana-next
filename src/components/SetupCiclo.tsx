import { useState } from "react";

export default function SetupCiclo() {
  const [fechaInicio, setFechaInicio] = useState("");

  return (
    <div className="p-6 bg-white rounded-xl shadow border border-pink-200">
      <h2 className="text-lg font-semibold mb-3 text-pink-700">
        🌸 ¿Cuándo comenzó tu ciclo?
      </h2>
      <input
        type="date"
        value={fechaInicio}
        onChange={(e) => setFechaInicio(e.target.value)}
        className="w-full border border-pink-300 rounded p-2"
      />
    </div>
  );
}
