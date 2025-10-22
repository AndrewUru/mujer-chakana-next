"use client";

import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Sparkles, Moon, CalendarRange, Clock, Lock } from "lucide-react";
import LunarModal from "./LunarModal";

const TOTAL_DAYS = 28;

interface DayStatus {
  day: number;
  isPast: boolean;
  isToday: boolean;
  isFuture: boolean;
}

const Moonboard = () => {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [fechaInicio, setFechaInicio] = useState<Date | null>(null);
  const [isLoadingInicio, setIsLoadingInicio] = useState(true);
  const hoy = useMemo(() => new Date(), []);

  useEffect(() => {
    const fetchFechaInicio = async () => {
      setIsLoadingInicio(true);
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

      setIsLoadingInicio(false);
    };

    fetchFechaInicio();
  }, []);

  function handleClickDay(event: MouseEvent<HTMLButtonElement>, day: number) {
    event.preventDefault();
    if (selectedDay === day) {
      setSelectedDay(null);
      setTimeout(() => setSelectedDay(day), 40);
      return;
    }
    setSelectedDay(day);
  }

  const calcularDiaActual = () => {
    if (!fechaInicio) return null;
    const diferencia = Math.floor(
      (hoy.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24)
    );
    const diaCiclo = ((diferencia % TOTAL_DAYS) + TOTAL_DAYS) % TOTAL_DAYS + 1;
    return diaCiclo;
  };

  const calcularCiclosCompletos = () => {
    if (!fechaInicio) return 0;
    const diferencia = Math.floor(
      (hoy.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24)
    );
    return Math.floor(diferencia / TOTAL_DAYS);
  };

  const diaActual = calcularDiaActual();
  const ciclosCompletos = calcularCiclosCompletos();

  function calcularFechaPorDia(dia: number, fechaInicial: Date): Date {
    const fecha = new Date(fechaInicial);
    fecha.setDate(fecha.getDate() + dia - 1);
    return fecha;
  }

  const dayStatuses: DayStatus[] = useMemo(() => {
    return Array.from({ length: TOTAL_DAYS }, (_, index) => {
      const day = index + 1;
      const isToday = diaActual !== null && day === diaActual;
      const isPast = diaActual !== null && day < diaActual;
      const isFuture = diaActual !== null ? day > diaActual : true;

      return {
        day,
        isPast,
        isToday,
        isFuture,
      };
    });
  }, [diaActual]);

  const legend = [
    {
      label: "Hoy",
      className: "bg-gradient-to-br from-rose-600 to-rose-500",
    },
    {
      label: "Registrado / disponible",
      className: "bg-rose-200/80 border border-rose-400/60",
    },
    {
      label: "Proximos dias",
      className: "bg-white/40 border border-white/30",
    },
  ];

  return (
    <>
      <section className="relative overflow-hidden rounded-[32px] border border-rose-100/70 bg-white/75 p-6 text-rose-900 shadow-xl shadow-rose-900/10 backdrop-blur-xl sm:p-10">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-rose-100/20 via-white/10 to-pink-100/30" />

        <div className="relative z-10 space-y-8">
          <div className="flex flex-col gap-5 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-100/60 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-rose-600">
                Moonboard consciente
              </span>
              <h2 className="text-3xl font-bold text-rose-950 sm:text-4xl">
                Ritmo ciclico en 28 dias
              </h2>
              <p className="max-w-lg text-sm text-rose-700 sm:text-base">
                Registra cada dia para tejer tu mapa lunar. Observa como evoluciona tu
                energia y vuelve a abrir registros pasados cuando necesites profundizar.
              </p>
            </div>
            <div className="flex flex-col gap-3 rounded-3xl border border-rose-100 bg-white/70 p-5 text-sm text-rose-700 shadow">
              <div className="flex items-center gap-3">
                <Moon className="h-5 w-5 text-rose-500" />
                <span>
                  {isLoadingInicio
                    ? "Calculando tu dia..."
                    : diaActual
                    ? `Dia ${diaActual} de tu ciclo`
                    : "Define tu fecha de inicio"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <CalendarRange className="h-5 w-5 text-rose-500" />
                <span>
                  {fechaInicio
                    ? `Inicio: ${fechaInicio.toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "long",
                      })}`
                    : "Sin fecha registrada"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-rose-500" />
                <span>
                  {fechaInicio
                    ? `Vuelta lunar ${ciclosCompletos + 1}`
                    : "Comienza tu primera vuelta"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-3 sm:gap-4">
              {dayStatuses.map(({ day, isPast, isToday, isFuture }) => {
                const isAvailable = !isFuture;
                const baseClasses =
                  "relative flex h-12 w-12 items-center justify-center rounded-full border font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 sm:h-14 sm:w-14";

                const statusClasses = isToday
                  ? "bg-gradient-to-br from-rose-600 to-rose-500 text-white shadow-lg shadow-rose-600/40 ring-4 ring-rose-200"
                  : isAvailable
                  ? "bg-rose-200/80 text-rose-900 border-rose-400/60 hover:bg-rose-200"
                  : "bg-white/50 text-rose-400 border-white/40 cursor-not-allowed opacity-75";

                const label = `Dia ${day}${
                  isToday ? " · Hoy" : isPast ? " · Registra o revisa" : " · Proximamente"
                }`;

                return (
                  <button
                    type="button"
                    key={day}
                    disabled={!isAvailable}
                    onClick={(event) => isAvailable && handleClickDay(event, day)}
                    className={`${baseClasses} ${statusClasses}`}
                    aria-label={label}
                    title={label}
                  >
                    {day}
                    {isPast && !isToday && (
                      <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-rose-400" />
                    )}
                    {isFuture && (
                      <Lock className="absolute -bottom-1 -right-1 h-4 w-4 text-rose-300" />
                    )}
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-rose-700 sm:text-sm">
              {legend.map((item) => (
                <span key={item.label} className="flex items-center gap-2">
                  <span
                    className={`flex h-3 w-3 items-center justify-center rounded-full ${item.className}`}
                  />
                  {item.label}
                </span>
              ))}
            </div>
          </div>

          {!fechaInicio && !isLoadingInicio && (
            <div className="rounded-3xl border border-rose-200/50 bg-rose-100/50 p-5 text-sm text-rose-700 shadow-inner">
              Guarda tu fecha de ultima menstruacion desde tu perfil para activar el
              seguimiento automatico de tu moonboard.
            </div>
          )}
        </div>
      </section>

      {selectedDay !== null && fechaInicio && (
        <LunarModal
          fecha={calcularFechaPorDia(selectedDay, fechaInicio)}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </>
  );
};

export default Moonboard;
