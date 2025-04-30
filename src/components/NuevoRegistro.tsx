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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-2xl p-8 shadow-xl mt-8 space-y-6 relative overflow-hidden"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="absolute inset-0 bg-gradient-to-br from-indigo-100/50 to-pink-100/50 pointer-events-none"
      />

      <motion.h2
        initial={{ scale: 0.5, rotate: -5 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="text-3xl font-bold text-center bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent"
      >
        🌱 Registrar mi día
      </motion.h2>

      <motion.input
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        type="text"
        placeholder="¿Qué emociones predominan hoy?"
        value={emociones}
        onChange={(e) => setEmociones(e.target.value)}
        className="w-full border-2 border-indigo-100 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-all shadow-sm"
        whileFocus={{ scale: 1.02 }}
      />

      <div className="flex flex-col gap-6">
        {sliderConfigs.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
          >
            <label className="font-semibold flex items-center gap-2 text-lg cursor-pointer hover:text-opacity-80 transition-all">
              <motion.span
                whileHover={{ scale: 1.2, rotate: [0, 10, -10, 0] }}
                className="inline-block"
              >
                {item.emoji}
              </motion.span>
              {item.label}:
              <span className="text-2xl font-bold ml-2">{item.value}</span>
            </label>

            <div className="relative">
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
                className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer relative z-10"
              />
            </div>
          </motion.div>
        ))}
      </div>

      <motion.textarea
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        transition={{ type: "spring", delay: 0.7 }}
        placeholder="Notas personales o intuiciones..."
        value={notas}
        onChange={(e) => setNotas(e.target.value)}
        className="w-full border-2 border-indigo-100 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-all shadow-sm resize-none"
        whileFocus={{
          scale: 1.01,
          boxShadow: "0px 4px 20px rgba(99, 102, 241, 0.2)",
        }}
        rows={4}
      />

      <motion.button
        whileHover={{
          scale: 1.05,
          boxShadow: "0px 8px 25px rgba(99, 102, 241, 0.4)",
        }}
        whileTap={{
          scale: 0.95,
          boxShadow: "0px 2px 10px rgba(99, 102, 241, 0.2)",
        }}
        onClick={handleGuardar}
        className="w-full bg-gradient-to-br from-indigo-600 to-pink-500 text-white py-4 rounded-xl font-bold text-lg relative overflow-hidden"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2"
        >
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
        </motion.div>

        {/* Efecto de partículas al hacer hover */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute inset-0 flex justify-around items-center pointer-events-none"
        >
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 h-1 bg-white rounded-full"
              animate={{
                y: [0, -20, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      </motion.button>

      {mensaje && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="text-center mt-4"
        >
          <motion.p
            className="text-green-700 font-semibold text-lg"
            animate={{
              color: ["#15803d", "#10b981", "#15803d"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            ✓ {mensaje}
          </motion.p>
          <motion.svg
            viewBox="0 0 100 100"
            className="w-12 h-12 mx-auto mt-2 text-green-600"
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
