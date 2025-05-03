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

export default function NuevoRegistro({
  userId,
  nombre,
  dia_ciclo,
  ciclo_actual,
  arquetipo,
}: {
  userId: string;
  nombre: string;
  dia_ciclo: number;
  ciclo_actual: number;
  arquetipo: string;
}) {
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
      emoji: "🪷",
      label: "Espiritualidad",
      value: espiritualidad,
      setter: setEspiritualidad,
    },
  ];

  const [cargando, setCargando] = useState(false);

  const handleGuardar = async () => {
    setCargando(true); // inicia carga
    const fechaHoy = new Date().toISOString().split("T")[0];

    // 👉 Insertar y obtener el ID del nuevo registro
    const { data: insertData, error } = await supabase
      .from("registros")
      .insert([
        {
          fecha: fechaHoy,
          emociones,
          energia,
          creatividad,
          espiritualidad,
          notas,
          user_id: userId,
        },
      ])
      .select("id") // 👈 pedimos el ID
      .single();

    if (error || !insertData) {
      setMensaje("❌ Algo no se pudo guardar. Intenta nuevamente.");
      setCargando(false);
      return;
    }

    // 👉 Llamar a OpenAI para generar el mensaje
    const response = await fetch("/api/generar-mensaje", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre,
        emociones,
        energia,
        creatividad,
        espiritualidad,
        notas,
        dia_ciclo,
        ciclo_actual,
        arquetipo,
      }),
    });

    const data = await response.json();

    // 👉 Mostramos el mensaje generado
    setMensaje(
      data.mensaje ||
        "🌕 Registro guardado, pero no se pudo generar el mensaje."
    );

    // 👉 Actualizamos SOLO ese registro usando su ID único
    await supabase
      .from("registros")
      .update({ mensaje: data.mensaje })
      .eq("id", insertData.id);

    // 👉 Limpiar campos
    setEmociones("");
    setNotas("");
    setCargando(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="bg-pink-50/50 backdrop-blur-xl border border-rose-200 rounded-3xl p-8 shadow-xl mt-12 max-w-2xl mx-auto space-y-8 relative"
    >
      {/* Fondo animado */}
      <motion.div
        className="absolute inset-0 rounded-3xl bg-gradient-to-br from-pink-100/50 to-rose-100/50 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />

      <motion.h2
        className="relative z-10 text-3xl sm:text-4xl text-center font-extrabold bg-gradient-to-r from-rose-500 to-pink-700 bg-clip-text text-transparent"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        🌸 Registrar mi día
      </motion.h2>

      {/* Campo emociones */}
      <motion.input
        type="text"
        placeholder="¿Qué emociones florecen hoy?"
        value={emociones}
        onChange={(e) => setEmociones(e.target.value)}
        className="relative z-10 w-full p-4 rounded-xl border-2 border-rose-200 focus:ring-2 focus:ring-rose-300 focus:outline-none transition-all placeholder:text-rose-400"
        whileFocus={{ scale: 1.02 }}
      />

      {/* Sliders */}
      <div className="relative z-10 flex flex-col gap-6">
        {sliderConfigs.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <label className="text-lg font-semibold flex gap-2 items-center text-rose-700">
              <motion.span
                className="text-2xl"
                whileHover={{ scale: 1.2, rotate: [0, 5, -5, 0] }}
              >
                {item.emoji}
              </motion.span>
              {item.label}: <span className="ml-2 font-bold">{item.value}</span>
            </label>
            <div className="relative mt-2">
              <motion.div
                className="absolute h-2 rounded-full bg-gradient-to-r from-rose-300 to-pink-400"
                style={{ width: `${(item.value / 5) * 100}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${(item.value / 5) * 100}%` }}
                transition={{ type: "spring", stiffness: 120 }}
              />
              <input
                type="range"
                min="1"
                max="5"
                value={item.value}
                onChange={(e) => item.setter(Number(e.target.value))}
                className="w-full h-2 appearance-none bg-rose-200 rounded-full outline-none cursor-pointer relative z-10
    [&::-webkit-slider-thumb]:appearance-none
    [&::-webkit-slider-thumb]:h-4
    [&::-webkit-slider-thumb]:w-4
    [&::-webkit-slider-thumb]:rounded-full
    [&::-webkit-slider-thumb]:bg-pink-600
    [&::-webkit-slider-thumb]:border-none
    [&::-webkit-slider-thumb]:shadow-md
    [&::-webkit-slider-thumb]:hover:scale-110
    [&::-webkit-slider-thumb]:transition-all

    [&::-moz-range-thumb]:appearance-none
    [&::-moz-range-thumb]:h-4
    [&::-moz-range-thumb]:w-4
    [&::-moz-range-thumb]:rounded-full
    [&::-moz-range-thumb]:bg-pink-600
    [&::-moz-range-thumb]:border-none
    [&::-moz-range-thumb]:shadow-md
    [&::-moz-range-thumb]:hover:scale-110
    [&::-moz-range-thumb]:transition-all
"
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Notas */}
      <motion.textarea
        placeholder="Intuiciones, palabras clave, sueños, señales..."
        value={notas}
        onChange={(e) => setNotas(e.target.value)}
        className="relative z-10 w-full p-4 rounded-xl border-2 border-rose-200 focus:ring-2 focus:ring-rose-300 focus:outline-none transition-all resize-none"
        rows={4}
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        whileFocus={{ scale: 1.01 }}
      />

      {/* Botón */}
      <motion.button
        onClick={handleGuardar}
        whileHover={{ scale: cargando ? 1 : 1.05 }}
        whileTap={{ scale: cargando ? 1 : 0.95 }}
        disabled={cargando}
        className={`relative z-10 w-full py-4 rounded-xl font-bold text-lg text-white 
    ${
      cargando
        ? "bg-rose-300 cursor-not-allowed"
        : "bg-gradient-to-br from-pink-600 to-rose-500 hover:shadow-xl"
    } 
    shadow-lg transition-all`}
      >
        <div className="flex items-center justify-center gap-2">
          {cargando ? (
            <>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="text-2xl"
              >
                🔄
              </motion.span>
              Generando tu reflexión...
            </>
          ) : (
            <>
              <motion.span
                animate={{ rotate: [0, 8, -8, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                🌷
              </motion.span>
              Guardar mi huella de hoy
              <motion.span
                animate={{ rotate: [0, -8, 8, 0] }}
                transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
              >
                🌙
              </motion.span>
            </>
          )}
        </div>
      </motion.button>

      {/* Mensaje final */}
      {mensaje && (
        <motion.div
          className="relative z-10 mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-rose-700 font-semibold text-lg">✓ {mensaje}</p>
        </motion.div>
      )}
    </motion.div>
  );
}
