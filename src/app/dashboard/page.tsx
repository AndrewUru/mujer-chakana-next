"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen,
  CalendarDays,
  Flower2,
  Leaf,
  Moon,
  PenLine,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import EstadoActualCiclo from "@/components/EstadoActualCiclo";
import Moonboard from "@/components/Moonboard";
import RecursosList from "@/components/RecursosList";
import CicloResumen from "@/components/CicloResumen";
import NuevoRegistro from "@/components/NuevoRegistro";
import QuickNav from "@/components/QuickNav";
import { useToast } from "@/components/Toast";
import ArquetiposPanel from "@/components/ArquetiposPanel";
import { GlassCard, PageShell, PrimaryAction } from "@/components/ui/AppPrimitives";
import { EstadoCiclo, Recurso } from "@/types/index";

const TOTAL_CYCLE_DAYS = 28;

interface Perfil {
  display_name: string;
  avatar_url: string | null;
  fecha_inicio: string | null;
  suscripcion_activa?: boolean;
}

const LoadingState = ({ message }: { message: string }) => (
  <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
    <div className="relative h-16 w-16">
      <div className="absolute inset-0 rounded-full border-4 border-rose-200" />
      <div className="absolute inset-0 animate-spin rounded-full border-4 border-rose-500 border-t-transparent" />
      <Moon className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-rose-600" />
    </div>
    <p className="mt-6 max-w-sm text-base font-semibold text-rose-800">
      {message}
    </p>
  </div>
);

const getCycleDay = (startDate: Date) => {
  const today = new Date();
  const elapsedDays = Math.floor(
    (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return (((elapsedDays % TOTAL_CYCLE_DAYS) + TOTAL_CYCLE_DAYS) % TOTAL_CYCLE_DAYS) + 1;
};

const getCyclePhase = (day: number) => {
  if (day <= 7) return "Menstrual";
  if (day <= 14) return "Folicular";
  if (day <= 21) return "Ovulatoria";
  return "Lutea";
};

function CycleProgress({ day }: { day: number }) {
  const percentage = Math.min(100, (day / TOTAL_CYCLE_DAYS) * 100);
  const phase = getCyclePhase(day);

  return (
    <div className="rounded-2xl border border-white/60 bg-white/42 p-4 shadow-inner">
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="font-semibold text-rose-800">Progreso del ciclo</span>
        <span className="font-bold text-rose-900">{Math.round(percentage)}%</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-rose-100 shadow-inner">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-rose-500 to-pink-500"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      </div>
      <div className="mt-3 flex items-center justify-between text-xs font-medium text-rose-600">
        <span>Dia {day}</span>
        <span>{phase}</span>
        <span>Dia {TOTAL_CYCLE_DAYS}</span>
      </div>
    </div>
  );
}

function InsightCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <GlassCard className="p-5">
      <p className="app-kicker">{label}</p>
      <p className="mt-3 text-xl font-semibold text-rose-950">{value}</p>
      <p className="mt-2 text-sm leading-6 text-rose-800/72">{description}</p>
    </GlassCard>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { ToastContainer } = useToast();
  const [userName, setUserName] = useState<string | null>(null);
  const [fechaActual, setFechaActual] = useState("");
  const [day, setDay] = useState(1);
  const [estadoCiclo, setEstadoCiclo] = useState<EstadoCiclo | null>(null);
  const [recursosData, setRecursosData] = useState<Recurso[]>([]);
  const [fechaInicioCiclo, setFechaInicioCiclo] = useState<Date | null>(null);
  const [fechaFinCiclo, setFechaFinCiclo] = useState<Date | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState(
    "Cargando tu espacio personal..."
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadingMessage("Conectando con tu perfil...");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/");
      return;
    }

    setUserId(user.id);

    const perfilPromise = supabase
      .from("perfiles")
      .select("display_name, avatar_url, fecha_inicio, suscripcion_activa")
      .eq("user_id", user.id)
      .single();

    const recursosPromise = supabase
      .from("recursos")
      .select("*")
      .eq("activo", true);

    const [{ data: perfilData }, { data: recursos }] = await Promise.all([
      perfilPromise,
      recursosPromise,
    ]);

    setUserName(perfilData?.display_name || "");
    setPerfil(perfilData ?? null);
    setRecursosData(recursos || []);
    setFechaActual(
      new Date().toLocaleDateString("es-ES", {
        weekday: "long",
        day: "2-digit",
        month: "long",
      })
    );

    if (!perfilData?.fecha_inicio) {
      setEstadoCiclo(null);
      setDay(1);
      setFechaInicioCiclo(null);
      setFechaFinCiclo(null);
      setLoading(false);
      return;
    }

    setLoadingMessage("Calculando tu ciclo...");
    const startDate = new Date(perfilData.fecha_inicio);
    const cycleDay = getCycleDay(startDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + TOTAL_CYCLE_DAYS - 1);

    setDay(cycleDay);
    setFechaInicioCiclo(startDate);
    setFechaFinCiclo(endDate);

    const { data: mujerChakanaData } = await supabase
      .from("mujer_chakana")
      .select("*")
      .eq("dia_ciclo", cycleDay)
      .single();

    setEstadoCiclo(mujerChakanaData || null);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const isSubscriber = Boolean(perfil?.suscripcion_activa);
  const diasTranscurridos = fechaInicioCiclo
    ? Math.floor(
        (Date.now() - fechaInicioCiclo.getTime()) / (1000 * 60 * 60 * 24)
      )
    : 0;
  const cicloActual = fechaInicioCiclo
    ? Math.floor(diasTranscurridos / TOTAL_CYCLE_DAYS) + 1
    : 1;

  const descripcionCorta = estadoCiclo?.descripcion
    ? `${estadoCiclo.descripcion.split(".")[0]}.`
    : "Registra tus sensaciones para activar una lectura mas personal.";

  const cycleHighlights = useMemo(
    () =>
      estadoCiclo
        ? [
            {
              label: "Arquetipo guia",
              value: estadoCiclo.arquetipo,
              description: descripcionCorta,
            },
            {
              label: "Elemento del dia",
              value: estadoCiclo.elemento,
              description: "Usalo como simbolo para ordenar tu energia de hoy.",
            },
            {
              label: "Ritmo actual",
              value: `Dia ${day} · Ciclo ${cicloActual}`,
              description: "Observa tu energia y registra lo que aparece.",
            },
          ]
        : [
            {
              label: "Primer paso",
              value: "Configura tu ciclo",
              description: "Guarda tu fecha de inicio para desbloquear tu lectura diaria.",
            },
            {
              label: "Recursos",
              value: "Biblioteca viva",
              description: "Explora audios, rituales y guias para acompanar el proceso.",
            },
            {
              label: "Comunidad",
              value: isSubscriber ? "Activa" : "Plan gratuito",
              description: "Tu estado define que contenidos aparecen disponibles.",
            },
          ],
    [estadoCiclo, descripcionCorta, day, cicloActual, isSubscriber]
  );

  if (loading) {
    return <LoadingState message={loadingMessage} />;
  }

  return (
    <>
      <PageShell className="relative text-rose-950">
        <div className="space-y-10">
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="glass-shell overflow-hidden rounded-[32px] p-6 sm:p-8 lg:p-10"
          >
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-rose-200/80 bg-rose-50/72 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-rose-600">
                  <Flower2 className="h-4 w-4" />
                  Santuario personal
                </div>
                <div className="space-y-3">
                  <h1 className="max-w-3xl text-3xl font-semibold leading-tight sm:text-5xl">
                    Hola, {userName || "exploradora"}. Este es tu mapa de hoy.
                  </h1>
                  <p className="max-w-2xl text-base leading-7 text-rose-800/76 sm:text-lg">
                    {fechaActual || "Hoy"} · Dia {day} de tu ciclo. Escucha,
                    registra y vuelve a lo esencial sin perderte entre pantallas.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <PrimaryAction href="#registro">
                    <PenLine className="h-4 w-4" />
                    Registrar hoy
                  </PrimaryAction>
                  <Link
                    href="/manual"
                    className="app-focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-white/70 bg-white/46 px-5 py-2.5 text-sm font-semibold text-rose-800 shadow-inner transition hover:bg-white/72"
                  >
                    <BookOpen className="h-4 w-4" />
                    Guia practica
                  </Link>
                </div>
              </div>

              <div className="space-y-4">
                <CycleProgress day={day} />
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/60 bg-white/42 p-4">
                    <CalendarDays className="mb-3 h-5 w-5 text-rose-500" />
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-rose-500">
                      Vuelta
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-rose-950">
                      {cicloActual}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/60 bg-white/42 p-4">
                    <Leaf className="mb-3 h-5 w-5 text-rose-500" />
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-rose-500">
                      Plan
                    </p>
                    <p className="mt-1 text-base font-semibold text-rose-950">
                      {isSubscriber ? "Activo" : "Gratuito"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          <section className="grid gap-4 md:grid-cols-3">
            {cycleHighlights.map((item) => (
              <InsightCard key={item.label} {...item} />
            ))}
          </section>

          {estadoCiclo ? (
            <section className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <EstadoActualCiclo data={estadoCiclo} />
              {fechaInicioCiclo && fechaFinCiclo ? (
                <CicloResumen
                  day={day}
                  fechaInicioCiclo={fechaInicioCiclo}
                  fechaFinCiclo={fechaFinCiclo}
                  userName={userName ?? undefined}
                  mujerChakanaData={estadoCiclo}
                />
              ) : null}
            </section>
          ) : (
            <GlassCard className="text-center">
              <Sparkles className="mx-auto h-10 w-10 text-rose-500" />
              <h2 className="mt-4 text-2xl font-semibold text-rose-950">
                Configura tu fecha de inicio
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-rose-800/72">
                Necesitamos tu fecha de inicio para calcular el dia del ciclo y
                activar la guia diaria.
              </p>
              <PrimaryAction href="/setup" className="mt-6">
                Ir a configuracion
              </PrimaryAction>
            </GlassCard>
          )}

          <section id="moonboard" className="scroll-mt-8">
            <Moonboard />
          </section>

          <ArquetiposPanel
            isLoadingProfile={perfil === null}
            isSubscriber={isSubscriber}
            onNavigateToArquetipos={() => router.push("/ciclo")}
            onNavigateToSuscripcion={() => router.push("/suscripcion")}
          />

          {userId && estadoCiclo && fechaInicioCiclo ? (
            <section id="registro" className="scroll-mt-8">
              <NuevoRegistro
                userId={userId}
                nombre={userName ?? "Exploradora"}
                dia_ciclo={day}
                ciclo_actual={cicloActual}
                arquetipo={estadoCiclo.arquetipo ?? "Guia"}
              />
            </section>
          ) : null}

          <GlassCard className="overflow-hidden p-5 sm:p-8">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="app-kicker">Recursos</p>
                <h2 className="mt-2 text-2xl font-semibold text-rose-950 sm:text-3xl">
                  Biblioteca para tu proceso
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-rose-800/72">
                  Rituales, audios y guias para acompanar el momento del ciclo
                  que estas transitando.
                </p>
              </div>
              <Link
                href="/recursos"
                className="app-focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl border border-white/70 bg-white/46 px-4 py-2 text-sm font-semibold text-rose-800 transition hover:bg-white/72"
              >
                Ver todos
              </Link>
            </div>
            <RecursosList recursos={recursosData} />
          </GlassCard>
        </div>
      </PageShell>

      <QuickNav currentDay={day} userName={userName || ""} />
      <ToastContainer />
    </>
  );
}
