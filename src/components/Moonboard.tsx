"use client";

import { useEffect, useState } from "react";
import LunarModal from "./LunarModal.tsx";
import { supabase } from "@/lib/supabaseClient";
import { Skeleton } from "@/components/ui/Skeleton";

const Moonboard = () => {
  const days = Array.from({ length: 28 }, (_, i) => i + 1);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [fechaInicio, setFechaInicio] = useState<Date | null>(null);
  const [hoy] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFechaInicio = async () => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();
        if (authError) throw authError;

        if (user) {
          const { data: perfil, error } = await supabase
            .from("perfiles")
            .select("fecha_inicio")
            .eq("user_id", user.id)
            .single();

          if (error) throw error;

          if (perfil?.fecha_inicio) {
            setFechaInicio(new Date(perfil.fecha_inicio));
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
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

  const handleClickDay = (day: number) => {
    if (diaActual !== null && day <= diaActual) {
      setSelectedDay(day);
    }
  };

  // Fase de ciclo y colores por día
  const getBackgroundPorDia = (day: number) => {
    if (day >= 1 && day <= 7) return "url('/agua-ui.webp')"; // Menstrual (Agua)
    if (day >= 8 && day <= 14) return "url('/tierra-ui.webp')"; // Doncella (Tierra)
    if (day >= 15 && day <= 21) return "url('/fuego-ui.webp')"; // Madre (Fuego)
    return "url('/cielo-ui.webp')"; // Hechicera (Aire)
  };

  if (isLoading) {
    return (
      <div className="max-w-xl mx-auto px-6 sm:px-10">
        <Skeleton className="h-8 w-3/4 mx-auto mb-6" />
        <div className="grid grid-cols-7 gap-3">
          {days.map((_, i) => (
            <Skeleton key={i} className="h-12 w-12 rounded-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!fechaInicio) {
    return (
      <div className="text-center text-pink-300 p-6">
        No se encontró una fecha de inicio de ciclo. Ve a Configurar y elige tu
        comienzo 🌱
      </div>
    );
  }

  return (
    <>
      {/* Encabezado */}
      <div className="text-center mb-8 text-white space-y-2">
        <div className="inline-flex items-center bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
          <p className="text-xl font-bold bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">
            Día {diaActual} del ciclo
          </p>
        </div>
        <p className="text-sm text-yellow-200 opacity-90">
          Ciclo lunar #{ciclosCompletos + 1}
        </p>
      </div>

      {/* Calendario lunar con colores de fase */}
      <div className="grid grid-cols-7 gap-2 px-4 sm:gap-3 sm:px-6 max-w-xl mx-auto">
        {days.map((day) => {
          const isPastOrToday = diaActual !== null && day <= diaActual;
          const isToday = day === diaActual;
          const isFuture = !isPastOrToday;

          return (
            <button
              key={day}
              aria-label={`Día ${day}${isToday ? " (Actual)" : ""}`}
              role="button"
              className={`relative rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center font-bold transition-all duration-300 border-2 overflow-hidden
        ${
          isFuture
            ? "bg-white/20 text-pink-100 border-pink-200/30 cursor-not-allowed"
            : ""
        }
        ${isToday ? "ring-4 ring-white/60 scale-110 shadow-lg" : ""}
        motion-reduce:transform-none`}
              style={
                isPastOrToday
                  ? {
                      backgroundImage: getBackgroundPorDia(day),
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : {}
              }
              onClick={() => handleClickDay(day)}
              disabled={isFuture}
            >
              <span className="relative z-10 text-shadow-sm">{day}</span>

              {/* Brillo hover */}
              {isPastOrToday && !isToday && (
                <div className="absolute inset-0 rounded-full opacity-0 hover:opacity-20 transition-opacity duration-200 bg-white/30" />
              )}
            </button>
          );
        })}
      </div>

      {/* Barra de progreso */}
      <div className="mt-6 max-w-xl mx-auto px-6 sm:px-10">
        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-pink-500 transition-all duration-500 ease-out"
            style={{ width: `${((diaActual ?? 0) * 100) / 28}%` }}
          />
        </div>
        <p className="text-center text-sm text-pink-200 mt-2">
          {28 - (diaActual ?? 0)} días restantes en este ciclo
        </p>
      </div>

      {/* Modal lunar */}
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
