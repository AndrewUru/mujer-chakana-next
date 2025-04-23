"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Props {
  userId: string;
}

export default function RegistroForm({ userId }: Props) {
  const [emociones, setEmociones] = useState("");
  const [energia, setEnergia] = useState(5);
  const [creatividad, setCreatividad] = useState(5);
  const [espiritualidad, setEspiritualidad] = useState(5);
  const [notas, setNotas] = useState("");
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");

  const hoy = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    const fetchRegistro = async () => {
      const { data, error } = await supabase
        .from("registros")
        .select("*")
        .eq("usuario_id", userId)
        .eq("fecha", hoy)
        .single();

      if (data) {
        setEmociones(data.emociones || "");
        setEnergia(data.energia || 5);
        setCreatividad(data.creatividad || 5);
        setEspiritualidad(data.espiritualidad || 5);
        setNotas(data.notas || "");
      }

      setLoading(false);
    };

    fetchRegistro();
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje("");

    const { error } = await supabase.from("registros").upsert([
      {
        usuario_id: userId,
        fecha: hoy,
        emociones,
        energia,
        creatividad,
        espiritualidad,
        notas,
      },
    ]);

    if (error) {
      setMensaje("❌ Error al guardar: " + error.message);
    } else {
      setMensaje("✨ Registro guardado con amor");
    }
  };

  if (loading)
    return (
      <p className="text-center text-gray-500">🌒 Cargando tu registro...</p>
    );

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-pink-200 rounded-xl p-6 space-y-4 shadow-md mt-10"
    >
      <h2 className="text-lg font-semibold text-pink-800">
        📝 Registro del día {hoy}
      </h2>

      <div>
        <label className="text-sm font-medium text-pink-700">
          ¿Cómo te sientes hoy?
        </label>
        <input
          type="text"
          value={emociones}
          onChange={(e) => setEmociones(e.target.value)}
          className="w-full border border-pink-300 rounded p-2 mt-1"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium text-pink-700">Energía</label>
          <input
            type="number"
            min={1}
            max={10}
            value={energia}
            onChange={(e) => setEnergia(Number(e.target.value))}
            className="w-full border border-pink-300 rounded p-2 mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-pink-700">
            Creatividad
          </label>
          <input
            type="number"
            min={1}
            max={10}
            value={creatividad}
            onChange={(e) => setCreatividad(Number(e.target.value))}
            className="w-full border border-pink-300 rounded p-2 mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-pink-700">
            Espiritualidad
          </label>
          <input
            type="number"
            min={1}
            max={10}
            value={espiritualidad}
            onChange={(e) => setEspiritualidad(Number(e.target.value))}
            className="w-full border border-pink-300 rounded p-2 mt-1"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-pink-700">
          Notas personales
        </label>
        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          rows={4}
          className="w-full border border-pink-300 rounded p-2 mt-1"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-pink-700 text-white font-semibold py-2 rounded-lg hover:bg-pink-800 transition"
      >
        Guardar registro
      </button>

      {mensaje && (
        <p className="text-sm mt-2 text-center text-pink-600">{mensaje}</p>
      )}
    </form>
  );
}
