"use client";

import { useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "./Toast";
import {
  Heart,
  Sparkles,
  Palette,
  Zap,
  Send,
  CheckCircle,
  CalendarDays,
  Moon,
  Feather,
  Star,
  Flower2,
  MoonStar,
  Leaf,
  HeartHandshake,
  Flame,
  Sun,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface SliderConfig {
  id: string;
  label: string;
  value: number;
  setter: (value: number) => void;
  icon: LucideIcon;
}

const FEELING_SUGGESTIONS: ReadonlyArray<{ label: string; Icon: LucideIcon }> =
  [
    { label: "Serena", Icon: Leaf },
    { label: "Agradecida", Icon: HeartHandshake },
    { label: "Creativa", Icon: Palette },
    { label: "Intensa", Icon: Flame },
    { label: "Introspectiva", Icon: MoonStar },
    { label: "Radiante", Icon: Sun },
  ];

const NOTES_LIMIT = 320;

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

  const todayInfo = useMemo(() => {
    const now = new Date();
    return {
      date: now.toLocaleDateString("es-ES", {
        weekday: "long",
        day: "2-digit",
        month: "long",
      }),
      time: now.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  }, []);

  const handleSuggestionClick = (feeling: string) => {
    setEmociones((prev) => {
      if (!prev.trim()) {
        return feeling;
      }

      if (prev.toLowerCase().includes(feeling.toLowerCase())) {
        return prev;
      }

      return `${prev.trim()} - ${feeling}`;
    });
  };

  const describeSlider = (label: string, value: number) => {
    if (value <= 2) {
      return `${label} en modo semilla, escucha tu descanso.`;
    }
    if (value === 3) {
      return `${label} equilibrada, sostén el ritmo con suavidad.`;
    }
    if (value === 4) {
      return `${label} despierta y creativa hoy.`;
    }
    return `${label} expansiva, aprovéchala con intención.`;
  };

  const promedioVital = Math.round(
    (energia + creatividad + espiritualidad) / 3
  );

  const vitalStatus = useMemo(() => {
    if (promedioVital <= 2) {
      return {
        title: "Modo semilla",
        description: "Invita el silencio y prioriza el autocuidado suave.",
      };
    }
    if (promedioVital === 3) {
      return {
        title: "Punto de equilibrio",
        description: "Escucha tu cuerpo y sostén un ritmo amable.",
      };
    }
    return {
      title: "Expansión creativa",
      description: "Tu energía está disponible. Canalízala con presencia.",
    };
  }, [promedioVital]);

  const remainingNotes = Math.max(0, NOTES_LIMIT - notas.length);

  const sliderConfigs: SliderConfig[] = [
    {
      id: "energia",
      label: "Energía",
      value: energia,
      setter: setEnergia,
      icon: Zap,
    },
    {
      id: "creatividad",
      label: "Creatividad",
      value: creatividad,
      setter: setCreatividad,
      icon: Palette,
    },
    {
      id: "espiritualidad",
      label: "Espiritualidad",
      value: espiritualidad,
      setter: setEspiritualidad,
      icon: Sparkles,
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
      const mensajeFinal = data.mensaje || "Registro guardado exitosamente!";
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
    if (value <= 2)
      return "linear-gradient(90deg,#fecdd3 0%,#fb7185 100%)";
    if (value <= 3)
      return "linear-gradient(90deg,#fde68a 0%,#fbbf24 100%)";
    if (value <= 4)
      return "linear-gradient(90deg,#bae6fd 0%,#38bdf8 100%)";
    return "linear-gradient(90deg,#bbf7d0 0%,#34d399 100%)";
  };

  return (
    <motion.div
      className="relative overflow-hidden bg-white/95 border border-rose-200 rounded-3xl p-6 sm:p-8 shadow-2xl mx-auto transition-all duration-500"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div
        className="pointer-events-none absolute -top-16 -right-10 h-48 w-48 rounded-full bg-pink-200/60 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-rose-100/70 blur-3xl"
        aria-hidden="true"
      />
      <div className="relative z-10 space-y-8">
        {/* Header con animación */}
      <motion.div
        className="text-center space-y-2"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <p className="text-xs uppercase tracking-[0.3em] text-rose-500">
          Hola, {nombre}
        </p>
        <h2 className="flex items-center justify-center gap-3 text-3xl sm:text-4xl font-extrabold text-rose-700 drop-shadow-sm">
          <Flower2 className="h-10 w-10 text-rose-500" aria-hidden="true" />
          <span>Registra tu día y recibe una reflexión gratis</span>
        </h2>
        <p className="text-rose-600 text-sm">
          Día {dia_ciclo} del ciclo | Hoy es {todayInfo.date}
        </p>
      </motion.div>

      {/* Contexto del día */}
      <motion.div
        className="grid gap-4 md:grid-cols-2"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5 }}
      >
        <div className="rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 p-5 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-9 w-9 rounded-2xl bg-white/20 p-2" />
            <div>
              <p className="text-sm uppercase tracking-[0.2em] opacity-80">
                Ritmo presente
              </p>
              <p className="text-lg font-semibold capitalize">{todayInfo.date}</p>
              <span className="text-sm opacity-80">{todayInfo.time} h</span>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed">
            Observa las señales del arquetipo <strong>{arquetipo}</strong> y deja
            que tu registro guíe el siguiente paso.
          </p>
        </div>

        <div className="rounded-2xl border border-rose-100 bg-white/80 p-5 shadow-inner">
          <div className="flex flex-wrap gap-2 text-xs font-semibold text-rose-600">
            <span className="rounded-full bg-rose-50 px-3 py-1">
              Día #{dia_ciclo} del ciclo
            </span>
            <span className="rounded-full bg-rose-50 px-3 py-1">
              Vuelta #{ciclo_actual}
            </span>
            <span className="rounded-full bg-rose-50 px-3 py-1 flex items-center gap-1">
              <Moon className="h-3.5 w-3.5" />
              {arquetipo}
            </span>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-rose-400">
                Clima vital
              </p>
              <p className="text-3xl font-black text-rose-700">
                {promedioVital}/5
              </p>
              <p className="text-sm text-rose-500">{vitalStatus.title}</p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50/80 px-4 py-3 text-rose-600">
              <Feather className="h-5 w-5" />
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-rose-400">
                  Intención
                </p>
                <p className="font-semibold text-rose-700">
                  Manténte presente y gentil
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Campo emociones mejorado */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <label
          htmlFor="emociones"
          className="flex flex-col gap-1 text-rose-700 font-semibold"
        >
          <span className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-500" />
            ¿Qué emociones florecen hoy?
          </span>
          <span className="text-sm font-normal text-rose-500">
            Escribe un par de líneas o combina las sugerencias rápidas.
          </span>
        </label>
        <textarea
          id="emociones"
          placeholder="Ej. Me siento expansiva pero un poco cansada..."
          value={emociones}
          onChange={(e) => setEmociones(e.target.value)}
          className="w-full min-h-[120px] p-4 rounded-xl border border-rose-300 focus:ring-2 focus:ring-rose-400 focus:outline-none placeholder:text-gray-500 bg-white shadow-inner transition duration-300 hover:border-rose-400 resize-none"
          aria-describedby="emociones-help"
          required
        />
        <div className="flex flex-wrap gap-2" role="list">
          {FEELING_SUGGESTIONS.map((feeling) => {
            const SuggestionIcon = feeling.Icon;
            const isActive = emociones
              .toLowerCase()
              .includes(feeling.label.toLowerCase());
            return (
              <button
                key={feeling.label}
                type="button"
                onClick={() => handleSuggestionClick(feeling.label)}
                className={`rounded-full border px-3 py-1.5 text-sm transition-all ${
                  isActive
                    ? "border-rose-400 bg-rose-100 text-rose-700"
                    : "border-rose-200 bg-white text-rose-500 hover:border-rose-400"
                }`}
                aria-pressed={isActive}
              >
                <SuggestionIcon className="mr-1 h-4 w-4" aria-hidden="true" />
                {feeling.label}
              </button>
            );
          })}
        </div>
        <p id="emociones-help" className="text-sm text-rose-600">
          Describe cómo te sientes emocionalmente hoy y suma palabras clave con
          los chips.
        </p>
      </motion.div>

      {/* Sliders mejorados */}
      <motion.div
        className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <div className="flex flex-col gap-6">
          {sliderConfigs.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                className="space-y-3 rounded-2xl border border-rose-100 bg-white/70 p-4 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
              >
                <label
                  id={`label-${item.id}`}
                  htmlFor={`slider-${item.id}`}
                  className="text-lg font-semibold flex flex-wrap gap-2 items-center text-rose-700"
                >
                  <span className="rounded-xl bg-rose-50 p-2 text-rose-500">
                    <Icon className="w-5 h-5" />
                  </span>
                  {item.label}
                  <span className="ml-auto text-base font-bold">
                    {item.value}/5
                  </span>
                </label>

                <div className="relative">
                  <input
                    id={`slider-${item.id}`}
                    type="range"
                    min="1"
                    max="5"
                    value={item.value}
                    onChange={(e) => item.setter(Number(e.target.value))}
                    className="w-full h-3 rounded-full bg-rose-100 cursor-pointer transition-all duration-200 appearance-none"
                    style={{
                      background: getSliderColor(item.value),
                    }}
                    aria-labelledby={`label-${item.id}`}
                    aria-describedby={`${item.id}-help`}
                    aria-valuemin={1}
                    aria-valuemax={5}
                    aria-valuenow={item.value}
                  />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/90 px-2 py-0.5 text-xs text-rose-600 shadow">
                    Nivel {item.value}
                  </div>
                  <div className="flex justify-between text-xs text-rose-600 mt-2">
                    <span>Bajo</span>
                    <span>Alto</span>
                  </div>
                </div>

                <p id={`${item.id}-help`} className="text-sm text-rose-500">
                  {describeSlider(item.label, item.value)}
                </p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          className="rounded-3xl border border-rose-100 bg-gradient-to-br from-rose-50 to-pink-50 p-5 shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="flex items-center gap-3">
            <Star className="h-10 w-10 rounded-2xl bg-white text-rose-500 p-2 shadow" />
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-rose-400">
                Clima interno
              </p>
              <p className="text-3xl font-black text-rose-700">
                {promedioVital}/5
              </p>
            </div>
          </div>
          <p className="mt-3 text-sm text-rose-600">{vitalStatus.description}</p>
          <div className="mt-4 space-y-3">
            {sliderConfigs.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={`insight-${item.id}`}
                  className="flex items-start gap-3 rounded-2xl bg-white/80 p-3"
                >
                  <span className="rounded-xl bg-rose-100 p-2 text-rose-500">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-rose-700">
                      {item.label}
                    </p>
                    <p className="text-xs text-rose-500">
                      {describeSlider(item.label, item.value)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-rose-600">
                    {item.value}/5
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
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
          className="flex flex-col gap-1 text-rose-700 font-semibold"
        >
          <span className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-500" />
            Intuiciones, palabras clave, sueños, señales...
          </span>
          <span className="text-sm font-normal text-rose-500">
            Describe símbolos, mensajes del cuerpo o detalles que quieras
            recordar.
          </span>
        </label>
        <textarea
          id="notas"
          placeholder="Ej. Soñé con agua, sentí el cuerpo pesado pero creativo..."
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          className="w-full p-4 rounded-xl border border-rose-300 focus:ring-2 focus:ring-rose-400 focus:outline-none resize-none placeholder:text-gray-500 bg-white shadow-inner transition duration-300 hover:border-rose-400"
          rows={4}
          aria-describedby="notas-help"
          maxLength={NOTES_LIMIT}
        />
        <div className="flex items-center justify-between text-xs text-rose-500">
          <p id="notas-help">
            Opcional: Registra cualquier intuición o señal especial
          </p>
          <span>
            {remainingNotes}/{NOTES_LIMIT} caracteres
          </span>
        </div>
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
            Genera mi reflexión de hoy
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
            <p className="text-rose-700 font-medium text-center leading-relaxed flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4 text-rose-500" aria-hidden="true" />
              <span>{mensaje}</span>
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
      </div>
    </motion.div>
  );
}
