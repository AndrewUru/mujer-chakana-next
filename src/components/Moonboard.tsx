"use client";

import { useEffect, useState } from "react";
import LunarModal from "./LunarModal.tsx";
import { supabase } from "@/lib/supabaseClient";

const Moonboard = () => {
  const days = Array.from({ length: 28 }, (_, i) => i + 1);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [fechaInicio, setFechaInicio] = useState<Date | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [hoy] = useState<Date>(new Date());

  useEffect(() => {
    const fetchFechaInicio = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);

        const { data: perfil } = await supabase
          .from("perfiles")
          .select("fecha_inicio")
          .eq("user_id", user.id)
          .single();

        if (perfil?.fecha_inicio) {
          setFechaInicio(new Date(perfil.fecha_inicio));
        }
      }
    };

    fetchFechaInicio();
  }, []);

  const calcularFechaPorDia = (dia: number) => {
    if (!fechaInicio) return "";
    const fecha = new Date(fechaInicio);
    fecha.setDate(fecha.getDate() + dia - 1);
    return fecha.toISOString().split("T")[0];
  };

  const handleClickDay = (day: number) => {
    if (diaActual !== null && day <= diaActual) {
      setSelectedDay(day);
    }
  };

  const calcularDiaActual = () => {
    if (!fechaInicio) return null;
    const diferencia = Math.floor(
      (hoy.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24)
    );
    const diaCiclo = (diferencia % 28) + 1;
    return diaCiclo;
  };

  const calcularCiclosCompletos = () => {
    if (!fechaInicio) return 0;
    const diferencia = Math.floor(
      (hoy.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24)
    );
    return Math.floor(diferencia / 28);
  };

  const handleReiniciarCiclo = async () => {
    if (!userId) return;

    const hoyISO = new Date().toISOString().split("T")[0];

    const { error } = await supabase
      .from("ciclos")
      .update({ fecha_inicio: hoyISO })
      .eq("usuario_id", userId);

    if (error) {
      alert("❌ No se pudo reiniciar el ciclo: " + error.message);
    } else {
      // ⚡ actualizar localmente el estado en lugar de hacer reload completo
      setFechaInicio(new Date(hoyISO));
      setSelectedDay(null);
      alert("🌑 Has comenzado una nueva vuelta lunar desde hoy.");
    }
  };
  const diaActual = calcularDiaActual();
  const ciclosCompletos = calcularCiclosCompletos();

  return (
    <>
      <div className="text-center mb-4 text-pink-700">
        <p>
          Hoy es día <strong>{diaActual}</strong> de tu ciclo 🌸
        </p>
        <p className="text-sm mt-1">
          🌕 Estás en tu <strong>{ciclosCompletos + 1}ª vuelta lunar</strong>
        </p>
        <button
          onClick={handleReiniciarCiclo}
          className="mt-4 bg-pink-100 text-pink-700 px-4 py-2 rounded-lg border border-pink-300 hover:bg-pink-200 transition text-sm"
        >
          ♻️ Iniciar nuevo ciclo lunar desde hoy
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 p-4 justify-center items-center">
        {days.map((day) => {
          const isPastOrToday = diaActual !== null && day <= diaActual;
          return (
            <div
              key={day}
              className={`rounded-full w-12 h-12 flex items-center justify-center border text-sm font-semibold relative transition
                ${
                  isPastOrToday
                    ? "bg-pink-500 text-white cursor-pointer hover:bg-pink-400"
                    : "bg-white text-pink-800 border-pink-300 cursor-not-allowed opacity-50"
                }`}
              onClick={() => handleClickDay(day)}
            >
              {day}
            </div>
          );
        })}
      </div>

      {selectedDay !== null && (
        <LunarModal
          day={selectedDay}
          fecha={calcularFechaPorDia(selectedDay)}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </>
  );
};

export default Moonboard;
