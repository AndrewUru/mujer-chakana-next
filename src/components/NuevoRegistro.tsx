"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

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
    <div className="bg-white/90 border border-rose-200 rounded-3xl p-8 shadow-2xl mt-12 mx-auto space-y-8 relative transition-all duration-500">
      <h2 className="text-3xl sm:text-4xl text-center font-extrabold text-rose-700 drop-shadow-sm">
        🌸 Registrar mi día
      </h2>

      {/* Campo emociones */}
      <div className="space-y-2">
        <label
          htmlFor="emociones"
          className="block text-rose-700 font-semibold"
        >
          ¿Qué emociones florecen hoy?
        </label>
        <input
          id="emociones"
          type="text"
          placeholder="Escribe tus emociones..."
          value={emociones}
          onChange={(e) => setEmociones(e.target.value)}
          className="w-full p-4 rounded-xl border border-rose-300 focus:ring-2 focus:ring-rose-400 focus:outline-none placeholder:text-gray-500 bg-white shadow-inner transition duration-300"
        />
      </div>

      {/* Sliders */}
      <div className="flex flex-col gap-6">
        {sliderConfigs.map((item) => (
          <div key={item.id} className="space-y-1">
            <label
              htmlFor={`slider-${item.id}`}
              className="text-lg font-semibold flex gap-2 items-center text-rose-700"
            >
              <span className="text-2xl">{item.emoji}</span>
              {item.label}: <span className="ml-2 font-bold">{item.value}</span>
            </label>
            <input
              id={`slider-${item.id}`}
              type="range"
              min="1"
              max="5"
              value={item.value}
              onChange={(e) => item.setter(Number(e.target.value))}
              className="w-full h-3 rounded-full bg-rose-200 accent-rose-500 cursor-pointer transition-all duration-200"
            />
          </div>
        ))}
      </div>

      {/* Notas */}
      <div className="space-y-2">
        <label htmlFor="notas" className="block text-rose-700 font-semibold">
          Intuiciones, palabras clave, sueños, señales...
        </label>
        <textarea
          id="notas"
          placeholder="Escribe tus notas..."
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          className="w-full p-4 rounded-xl border border-rose-300 focus:ring-2 focus:ring-rose-400 focus:outline-none resize-none placeholder:text-gray-500 bg-white shadow-inner transition duration-300"
          rows={4}
        />
      </div>

      {/* Botón */}
      <button
        onClick={handleGuardar}
        disabled={cargando}
        className={`w-full py-4 rounded-xl font-bold text-lg text-white transition-all duration-300 
        ${
          cargando
            ? "bg-rose-300 cursor-not-allowed"
            : "bg-gradient-to-br from-pink-600 to-rose-500 hover:shadow-xl hover:scale-[1.02]"
        } 
        shadow-lg`}
        aria-busy={cargando}
      >
        {cargando ? (
          <div className="flex items-center justify-center gap-2">
            <div className="h-5 w-5 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            Generando tu reflexión...
          </div>
        ) : (
          <>Genera mi reflexión de hoy🌙</>
        )}
      </button>

      {/* Mensaje final */}
      {mensaje && (
        <div className="mt-6 text-center" aria-live="polite">
          <p className="text-rose-700 font-semibold text-lg">✓ {mensaje}</p>
        </div>
      )}
    </div>
  );
}
