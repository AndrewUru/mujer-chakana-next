"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";

interface SliderConfig {
  id: string;
  emoji: string;
  label: string;
  value: number;
  setter: (value: number) => void;
}

export default function NuevoRegistro({ userId }: { userId: string }) {
  const [emociones, setEmociones] = useState("");
  const [energia, setEnergia] = useState(3);
  const [creatividad, setCreatividad] = useState(3);
  const [espiritualidad, setEspiritualidad] = useState(3);
  const [notas, setNotas] = useState("");
  const [mensaje, setMensaje] = useState("");

  const sliderConfigs: SliderConfig[] = [
    {
      id: "energia",
      emoji: "🔥",
      label: "Energía",
      value: energia,
      setter: setEnergia,
    },
    {
      id: "creatividad",
      emoji: "🎨",
      label: "Creatividad",
      value: creatividad,
      setter: setCreatividad,
    },
    {
      id: "espiritualidad",
      emoji: "✡️",
      label: "Espiritualidad",
      value: espiritualidad,
      setter: setEspiritualidad,
    },
  ];

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
      setMensaje(
        "🌕 Tu huella de hoy ha sido sembrada. Gracias por escuchar a tu ciclo."
      );
      setEmociones("");
      setNotas("");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="bg-white/60 backdrop-blur-md rounded-3xl p-8 shadow-2xl mt-10 max-w-2xl mx-auto space-y-8 relative"
    >
      {/* Fondo animado sutil */}
      <motion.div
        className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-100/40 to-pink-100/40 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />

      <motion.h2
        className="relative z-10 text-4xl text-center font-extrabold bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.6 }}
      >
        🌸 Registrar mi día
      </motion.h2>

      {/* Campo emociones */}
      <motion.input
        type="text"
        placeholder="¿Qué emociones predominan hoy?"
        value={emociones}
        onChange={(e) => setEmociones(e.target.value)}
        className="relative z-10 w-full p-4 rounded-xl border-2 border-indigo-200 focus:ring-2 focus:ring-indigo-400 focus:outline-none transition-all placeholder:text-indigo-400"
        whileFocus={{ scale: 1.02 }}
      />

      {/* Sliders animados */}
      <div className="relative z-10 flex flex-col gap-6">
        {sliderConfigs.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <label className="text-lg font-semibold flex gap-2 items-center">
              <motion.span
                className="text-xl"
                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.2 }}
              >
                {item.emoji}
              </motion.span>
              {item.label}: <span className="ml-2 font-bold">{item.value}</span>
            </label>
            <div className="relative mt-2">
              <motion.div
                className="absolute h-2 rounded-full bg-gradient-to-r from-indigo-200 to-pink-200"
                style={{ width: `${(item.value / 5) * 100}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${(item.value / 5) * 100}%` }}
                transition={{ type: "spring", stiffness: 100 }}
              />
              <input
                type="range"
                min="1"
                max="5"
                value={item.value}
                onChange={(e) => item.setter(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-full appearance-none relative z-10 cursor-pointer"
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Notas */}
      <motion.textarea
        placeholder="Notas personales o intuiciones..."
        value={notas}
        onChange={(e) => setNotas(e.target.value)}
        className="relative z-10 w-full p-4 rounded-xl border-2 border-indigo-200 focus:ring-2 focus:ring-indigo-400 focus:outline-none transition-all resize-none"
        rows={4}
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        whileFocus={{ scale: 1.01 }}
      />

      {/* Botón */}
      <motion.button
        onClick={handleGuardar}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative z-10 w-full py-4 rounded-xl font-bold text-lg text-white bg-gradient-to-br from-indigo-600 to-pink-500 shadow-lg hover:shadow-xl transition-all"
      >
        <div className="flex items-center justify-center gap-2">
          <motion.span
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-xl"
          >
            ✨
          </motion.span>
          Guardar Registro
          <motion.span
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
            className="text-xl"
          >
            🌸
          </motion.span>
        </div>
      </motion.button>

      {/* Mensaje final */}
      {mensaje && (
        <motion.div
          className="relative z-10 mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-green-700 font-semibold text-lg">✓ {mensaje}</p>
          <motion.svg
            viewBox="0 0 100 100"
            className="w-10 h-10 mx-auto mt-2 text-green-600"
          >
            <motion.path
              d="M20,50 L40,70 L80,30"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5 }}
            />
          </motion.svg>
        </motion.div>
      )}
    </motion.div>
  );
}
