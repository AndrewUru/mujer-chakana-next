"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "./Toast";
import { Heart, Sparkles, Palette, Zap, Send, CheckCircle } from "lucide-react";

interface SliderConfig {
  id: string;
  emoji: string;
  label: string;
  value: number;
  setter: (value: number) => void;
  icon: React.ReactNode;
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
  const [cargando, setCargando] = useState(false);
  const [success, setSuccess] = useState(false);
  const { addToast } = useToast();

  const sliderConfigs: SliderConfig[] = [
    {
      id: "energia",
      emoji: "🔥",
      label: "Energía",
      value: energia,
      setter: setEnergia,
      icon: <Zap className="w-5 h-5" />,
    },
    {
      id: "creatividad",
      emoji: "🎨",
      label: "Creatividad",
      value: creatividad,
      setter: setCreatividad,
      icon: <Palette className="w-5 h-5" />,
    },
    {
      id: "espiritualidad",
      emoji: "✨",
      label: "Espiritualidad",
      value: espiritualidad,
      setter: setEspiritualidad,
      icon: <Sparkles className="w-5 h-5" />,
    },
  ];

  const handleGuardar = async () => {
    // Validación básica
    if (!emociones.trim()) {
      addToast("error", "Por favor, describe tus emociones de hoy");
      return;
    }

    setCargando(true);
    addToast("loading", "Guardando tu registro y generando reflexión...");

    const fechaHoy = new Date().toISOString().split("T")[0];

    try {
      // Insertar y obtener el ID del nuevo registro
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
        .select("id")
        .single();

      if (error || !insertData) {
        addToast(
          "error",
          "No se pudo guardar el registro. Intenta nuevamente."
        );
        setCargando(false);
        return;
      }

      // Llamar a OpenAI para generar el mensaje
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

      // Mostrar mensaje de éxito
      const mensajeFinal = data.mensaje || "🌕 Registro guardado exitosamente!";
      setMensaje(mensajeFinal);
      addToast("success", "¡Registro guardado y reflexión generada!");

      // Actualizar el registro con el mensaje generado
      await supabase
        .from("registros")
        .update({ mensaje: data.mensaje })
        .eq("id", insertData.id);

      // Limpiar campos y mostrar éxito
      setEmociones("");
      setNotas("");
      setSuccess(true);

      // Resetear estado de éxito después de 3 segundos
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      addToast("error", "Ocurrió un error inesperado. Intenta nuevamente.");
      console.error("Error en handleGuardar:", error);
    } finally {
      setCargando(false);
    }
  };

  const getSliderColor = (value: number) => {
    if (value <= 2) return "from-red-400 to-red-600";
    if (value <= 3) return "from-yellow-400 to-yellow-600";
    if (value <= 4) return "from-blue-400 to-blue-600";
    return "from-green-400 to-green-600";
  };

  return (
    <motion.div
      className="bg-white/90 border border-rose-200 rounded-3xl p-8 shadow-2xl mx-auto space-y-8 relative transition-all duration-500"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header con animación */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <h2 className="text-3xl sm:text-4xl font-extrabold text-rose-700 drop-shadow-sm mb-2">
          🌸 Registra tu día y recibe una reflexión GRATIS!
        </h2>
        <p className="text-rose-600 text-sm">
          Día {dia_ciclo} del ciclo • Arquetipo: {arquetipo}
        </p>
      </motion.div>

      {/* Campo emociones mejorado */}
      <motion.div
        className="space-y-3"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <label
          htmlFor="emociones"
          className="block text-rose-700 font-semibold items-center gap-2"
        >
          <Heart className="w-5 h-5 text-pink-500" />
          ¿Qué emociones florecen hoy?
        </label>
        <input
          id="emociones"
          type="text"
          placeholder="Escribe tus emociones..."
          value={emociones}
          onChange={(e) => setEmociones(e.target.value)}
          className="w-full p-4 rounded-xl border border-rose-300 focus:ring-2 focus:ring-rose-400 focus:outline-none placeholder:text-gray-500 bg-white shadow-inner transition duration-300 hover:border-rose-400"
          aria-describedby="emociones-help"
          required
        />
        <p id="emociones-help" className="text-sm text-rose-600">
          Describe cómo te sientes emocionalmente hoy
        </p>
      </motion.div>

      {/* Sliders mejorados */}
      <motion.div
        className="flex flex-col gap-6"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        {sliderConfigs.map((item, index) => (
          <motion.div
            key={item.id}
            className="space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
          >
            <label
              htmlFor={`slider-${item.id}`}
              className="text-lg font-semibold flex gap-2 items-center text-rose-700"
            >
              <span className="text-2xl">{item.emoji}</span>
              {item.icon}
              {item.label}:{" "}
              <span className="ml-2 font-bold text-lg">{item.value}</span>
            </label>

            <div className="relative">
              <input
                id={`slider-${item.id}`}
                type="range"
                min="1"
                max="5"
                value={item.value}
                onChange={(e) => item.setter(Number(e.target.value))}
                className="w-full h-3 rounded-full bg-rose-200 cursor-pointer transition-all duration-200 appearance-none"
                style={{
                  background: `linear-gradient(to right, ${getSliderColor(
                    item.value
                  )})`,
                }}
                aria-describedby={`${item.id}-help`}
              />
              <div className="flex justify-between text-xs text-rose-600 mt-1">
                <span>Bajo</span>
                <span>Alto</span>
              </div>
            </div>

            <p id={`${item.id}-help`} className="text-sm text-rose-600">
              Evalúa tu nivel de {item.label.toLowerCase()} hoy
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Notas mejoradas */}
      <motion.div
        className="space-y-3"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <label
          htmlFor="notas"
          className="block text-rose-700 font-semibold items-center gap-2"
        >
          <Sparkles className="w-5 h-5 text-pink-500" />
          Intuiciones, palabras clave, sueños, señales...
        </label>
        <textarea
          id="notas"
          placeholder="Escribe tus notas..."
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          className="w-full p-4 rounded-xl border border-rose-300 focus:ring-2 focus:ring-rose-400 focus:outline-none resize-none placeholder:text-gray-500 bg-white shadow-inner transition duration-300 hover:border-rose-400"
          rows={4}
          aria-describedby="notas-help"
        />
        <p id="notas-help" className="text-sm text-rose-600">
          Opcional: Registra cualquier intuición o señal especial
        </p>
      </motion.div>

      {/* Botón mejorado */}
      <motion.button
        onClick={handleGuardar}
        disabled={cargando || success}
        className={`w-full py-4 rounded-xl font-bold text-lg text-white transition-all duration-300 
        ${
          cargando || success
            ? "bg-green-500 cursor-not-allowed"
            : "bg-gradient-to-br from-pink-600 to-rose-500 hover:shadow-xl hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2"
        } 
        shadow-lg flex items-center justify-center gap-2`}
        aria-busy={cargando}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        whileHover={!cargando && !success ? { scale: 1.02 } : {}}
        whileTap={!cargando && !success ? { scale: 0.98 } : {}}
      >
        {cargando ? (
          <>
            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Generando tu reflexión...
          </>
        ) : success ? (
          <>
            <CheckCircle className="w-5 h-5" />
            ¡Reflexión generada!
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Genera mi reflexión de hoy 🌙
          </>
        )}
      </motion.button>

      {/* Mensaje final mejorado */}
      <AnimatePresence>
        {mensaje && (
          <motion.div
            className="mt-6 p-4 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-xl"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            role="status"
            aria-live="polite"
          >
            <p className="text-rose-700 font-medium text-center leading-relaxed">
              ✨ {mensaje}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Estilos CSS para el slider personalizado */}
      <style jsx>{`
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: 2px solid #f43f5e;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        input[type="range"]::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: 2px solid #f43f5e;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </motion.div>
  );
}
