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
    setSelectedDay(day);
  };

  const calcularDiaActual = () => {
    if (!fechaInicio) return null;
    const diferencia = Math.floor(
      (hoy.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diferencia + 1; // Día actual en el ciclo
  };

  const diaActual = calcularDiaActual();

  return (
    <>
      <div className="grid grid-cols-7 gap-2 p-4 justify-center items-center">
        {days.map((day) => {
          const isPastOrToday = diaActual !== null && day <= diaActual;
          return (
            <div
              key={day}
              className={`rounded-full w-12 h-12 flex items-center justify-center border text-sm font-semibold relative
                ${
                  isPastOrToday
                    ? "bg-pink-500 text-white"
                    : "bg-white text-pink-800 border-pink-300"
                }
                hover:bg-pink-400 cursor-pointer transition`}
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
