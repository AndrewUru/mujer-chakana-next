"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";

export default function NuevoRegistro({ userId }: { userId: string }) {
  const [emociones, setEmociones] = useState("");
  const [energia, setEnergia] = useState(3);
  const [creatividad, setCreatividad] = useState(3);
  const [espiritualidad, setEspiritualidad] = useState(3);
  const [notas, setNotas] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleGuardar = async () => {
    const fechaHoy = new Date().toISOString().split("T")[0];

    const { error } = await supabase.from("registros").insert([
      {
        fecha: fechaHoy,
        emociones,
        energia,
        creatividad,
        espiritualidad,
        notas,
        user_id: userId,
      },
    ]);

    if (error) {
      setMensaje("❌ Error al guardar: " + error.message);
    } else {
      setMensaje("✅ Registro guardado con éxito.");
      setEmociones("");
      setNotas("");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl p-8 shadow-xl mt-8 space-y-6"
    >
      <h2 className="text-2xl font-bold text-center text-indigo-700">
        🌱 Registrar mi día
      </h2>

      <input
        type="text"
        placeholder="¿Qué emociones predominan hoy?"
        value={emociones}
        onChange={(e) => setEmociones(e.target.value)}
        className="w-full border border-indigo-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
      />

      <div className="flex flex-col gap-6">
        <div>
          <label className="font-semibold text-rose-600 flex items-center gap-2">
            🔥 Energía: <span>{energia}</span>
          </label>
          <input
            type="range"
            min="1"
            max="5"
            value={energia}
            onChange={(e) => setEnergia(Number(e.target.value))}
            className="w-full h-2 bg-gradient-to-r from-red-400 to-red-600 rounded-full appearance-none cursor-pointer"
          />
        </div>

        <div>
          <label className="font-semibold text-blue-600 flex items-center gap-2">
            🎨 Creatividad: <span>{creatividad}</span>
          </label>
          <input
            type="range"
            min="1"
            max="5"
            value={creatividad}
            onChange={(e) => setCreatividad(Number(e.target.value))}
            className="w-full h-2 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full appearance-none cursor-pointer"
          />
        </div>

        <div>
          <label className="font-semibold text-yellow-600 flex items-center gap-2">
            ✡️ Espiritualidad: <span>{espiritualidad}</span>
          </label>
          <input
            type="range"
            min="1"
            max="5"
            value={espiritualidad}
            onChange={(e) => setEspiritualidad(Number(e.target.value))}
            className="w-full h-2 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full appearance-none cursor-pointer"
          />
        </div>
      </div>

      <textarea
        placeholder="Notas personales o intuiciones..."
        value={notas}
        onChange={(e) => setNotas(e.target.value)}
        className="w-full border border-indigo-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
        rows={4}
      />

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleGuardar}
        className="w-full bg-indigo-700 text-white py-3 rounded-lg font-semibold hover:bg-indigo-800 transition"
      >
        Guardar Registro
      </motion.button>

      {mensaje && (
        <p className="text-center mt-4 text-sm text-green-700 animate-pulse">
          {mensaje}
        </p>
      )}
    </motion.div>
  );
}
