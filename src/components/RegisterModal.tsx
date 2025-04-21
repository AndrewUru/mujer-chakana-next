import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RegisterModal({
  day,
  fecha,
  onClose,
  registro,
}: {
  day: number;
  fecha: string;
  onClose: () => void;
  registro?: {
    id?: string;
    emociones?: string;
    energia?: number;
    creatividad?: number;
    espiritualidad?: number;
    notas?: string;
  };
}) {
  const [emociones, setEmociones] = useState("");
  const [energia, setEnergia] = useState(3);
  const [creatividad, setCreatividad] = useState(3);
  const [espiritualidad, setEspiritualidad] = useState(3);
  const [notas, setNotas] = useState("");

  useEffect(() => {
    if (registro) {
      setEmociones(registro.emociones || "");
      setEnergia(registro.energia || 3);
      setCreatividad(registro.creatividad || 3);
      setEspiritualidad(registro.espiritualidad || 3);
      setNotas(registro.notas || "");
    }
  }, [registro]);

  const handleSave = async () => {
    if (registro?.id) {
      const { error } = await supabase
        .from("registros")
        .update({
          emociones,
          energia,
          creatividad,
          espiritualidad,
          notas,
        })
        .eq("id", registro.id);

      if (!error) onClose();
    } else {
      const { error } = await supabase.from("registros").insert([
        {
          fecha,
          emociones,
          energia,
          creatividad,
          espiritualidad,
          notas,
        },
      ]);

      if (!error) onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-96 shadow-xl">
        <h2 className="text-xl font-bold text-pink-700 mb-4">
          {registro ? "Editar Día" : "Registrar Día"} {day}
        </h2>

        <textarea
          placeholder="¿Cómo te sentiste emocionalmente?"
          value={emociones}
          onChange={(e) => setEmociones(e.target.value)}
          className="w-full border p-2 rounded mb-2"
        />

        <label className="block text-sm">Energía</label>
        <input
          type="range"
          min="1"
          max="5"
          value={energia}
          onChange={(e) => setEnergia(+e.target.value)}
        />

        <label className="block text-sm">Creatividad</label>
        <input
          type="range"
          min="1"
          max="5"
          value={creatividad}
          onChange={(e) => setCreatividad(+e.target.value)}
        />

        <label className="block text-sm">Espiritualidad</label>
        <input
          type="range"
          min="1"
          max="5"
          value={espiritualidad}
          onChange={(e) => setEspiritualidad(+e.target.value)}
        />

        <textarea
          placeholder="Notas del día..."
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          className="w-full border p-2 rounded my-2"
        />

        <div className="flex justify-between mt-4">
          <button className="text-sm text-gray-500" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="bg-pink-600 text-white px-4 py-1 rounded"
            onClick={handleSave}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
