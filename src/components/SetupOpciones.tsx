import { useState } from "react";

export default function SetupOpciones() {
  const [mostrarFase, setMostrarFase] = useState(true);
  const [idioma, setIdioma] = useState("es");

  return (
    <div className="p-6 bg-white rounded-xl shadow border border-pink-200">
      <h2 className="text-lg font-semibold mb-4 text-pink-700">
        ⚙️ Opciones adicionales
      </h2>

      <div className="mb-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={mostrarFase}
            onChange={() => setMostrarFase(!mostrarFase)}
          />
          Mostrar fase lunar real
        </label>
      </div>

      <div>
        <label className="block text-sm mb-1">Idioma preferido:</label>
        <select
          value={idioma}
          onChange={(e) => setIdioma(e.target.value)}
          className="w-full border border-pink-300 rounded p-2"
        >
          <option value="es">Español</option>
          <option value="en">English</option>
        </select>
      </div>
    </div>
  );
}
