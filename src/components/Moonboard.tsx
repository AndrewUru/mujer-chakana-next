"use client";

import { useEffect, useState } from "react";
import LunarModal from "./LunarModal.tsx";
import { supabase } from "@/lib/supabaseClient";

const Moonboard = () => {
  const days = Array.from({ length: 28 }, (_, i) => i + 1);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [fechaInicio, setFechaInicio] = useState<Date | null>(null);
  const [hoy] = useState<Date>(new Date());

  useEffect(() => {
    const fetchFechaInicio = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
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

  const diaActual = calcularDiaActual();
  const ciclosCompletos = calcularCiclosCompletos();

  return (
    <>
      {/* Encabezado emocional */}
      <div className="text-center mb-6 text-white">
        <p className="text-xl font-bold">
          Hoy es <span className="text-pink-300">día {diaActual}</span> de tu
          ciclo 🌸
        </p>
        <p className="text-sm mt-1 text-yellow-200">
          🌕 Estás en tu <strong>{ciclosCompletos + 1}ª vuelta lunar</strong>
        </p>
      </div>

      {/* Calendario Lunar */}
      <div className="grid grid-cols-7 gap-3 px-6 sm:px-10 max-w-xl mx-auto">
        {days.map((day) => {
          const isPastOrToday = diaActual !== null && day <= diaActual;
          const isToday = day === diaActual;

          return (
            <div
              key={day}
              className={`rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl transition-all duration-300 border
              ${
                isToday
                  ? "bg-pink-600 ring-4 ring-pink-300 text-white scale-110 shadow-lg"
                  : ""
              }
              ${
                isPastOrToday && !isToday
                  ? "bg-pink-500 text-white hover:bg-pink-400 cursor-pointer"
                  : ""
              }
              ${
                !isPastOrToday
                  ? "bg-white/30 text-pink-800 border-pink-200 opacity-50 cursor-not-allowed"
                  : ""
              }
            `}
              onClick={() => isPastOrToday && handleClickDay(day)}
              title={`Día ${day}`}
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* Modal con información del día */}
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
