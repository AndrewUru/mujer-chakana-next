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
import type { LucideIcon } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import EstadoActualCiclo from "@/components/EstadoActualCiclo";
import Moonboard from "@/components/Moonboard";
import RecursosList from "@/components/RecursosList";
import CicloResumen from "@/components/CicloResumen";
import NuevoRegistro from "@/components/NuevoRegistro";
import QuickNav from "@/components/QuickNav";
import { useToast } from "@/components/Toast";
import ArquetiposPanel from "@/components/ArquetiposPanel";
import {
  GlassCard,
  PageShell,
  PrimaryAction,
} from "@/components/ui/AppPrimitives";
import { EstadoCiclo, Recurso } from "@/types/index";

const TOTAL_CYCLE_DAYS = 28;

interface Perfil {
  display_name: string;
  avatar_url: string | null;
  fecha_inicio: string | null;
  suscripcion_activa?: boolean;
}

type DashboardPanel = "ciclo" | "moonboard" | "registro" | "arquetipos" | "recursos";

interface DashboardPanelItem {
  id: DashboardPanel;
  label: string;
  description: string;
  Icon: LucideIcon;
  disabled?: boolean;
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

  return (
    (((elapsedDays % TOTAL_CYCLE_DAYS) + TOTAL_CYCLE_DAYS) %
      TOTAL_CYCLE_DAYS) +
    1
  );
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
        <span className="font-bold text-rose-900">
          {Math.round(percentage)}%
        </span>
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
  const [activePanel, setActivePanel] = useState<DashboardPanel>("ciclo");
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
              description:
                "Guarda tu fecha de inicio para desbloquear tu lectura diaria.",
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

  const dashboardPanels: DashboardPanelItem[] = useMemo(
    () => [
      {
        id: "ciclo",
        label: "Ciclo",
        description: estadoCiclo
          ? `${estadoCiclo.arquetipo} · ${estadoCiclo.elemento}`
          : "Configura tu fecha de inicio",
        Icon: Moon,
      },
      {
        id: "moonboard",
        label: "Moonboard",
        description: "Mapa visual de 28 dias",
        Icon: CalendarDays,
      },
      {
        id: "registro",
        label: "Registro",
        description: "Anota como estas hoy",
        Icon: PenLine,
        disabled: !(userId && estadoCiclo && fechaInicioCiclo),
      },
      {
        id: "arquetipos",
        label: "Arquetipos",
        description: isSubscriber ? "Biblioteca activa" : "Vista y desbloqueo",
        Icon: Flower2,
      },
      {
        id: "recursos",
        label: "Recursos",
        description: `${recursosData.length} disponibles`,
        Icon: BookOpen,
      },
    ],
    [estadoCiclo, fechaInicioCiclo, isSubscriber, recursosData.length, userId]
  );

  if (loading) {
    return <LoadingState message={loadingMessage} />;
  }

  const activePanelData =
    dashboardPanels.find((panel) => panel.id === activePanel) ??
    dashboardPanels[0];

  const activeContent = (() => {
    switch (activePanel) {
      case "ciclo":
        return estadoCiclo ? (
          <div className="space-y-6">
            <section className="grid gap-4 md:grid-cols-3">
              {cycleHighlights.map((item) => (
                <InsightCard key={item.label} {...item} />
              ))}
            </section>
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
          </div>
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
        );
      case "moonboard":
        return <Moonboard />;
      case "registro":
        return userId && estadoCiclo && fechaInicioCiclo ? (
          <NuevoRegistro
            userId={userId}
            nombre={userName ?? "Exploradora"}
            dia_ciclo={day}
            ciclo_actual={cicloActual}
            arquetipo={estadoCiclo.arquetipo ?? "Guia"}
          />
        ) : (
          <GlassCard className="text-center">
            <PenLine className="mx-auto h-10 w-10 text-rose-500" />
            <h2 className="mt-4 text-2xl font-semibold text-rose-950">
              Tu registro se activa con el ciclo
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-rose-800/72">
              Configura tu fecha de inicio para registrar emociones y recibir
              reflexiones diarias.
            </p>
          </GlassCard>
        );
      case "arquetipos":
        return (
          <ArquetiposPanel
            isLoadingProfile={perfil === null}
            isSubscriber={isSubscriber}
            onNavigateToArquetipos={() => router.push("/ciclo")}
            onNavigateToSuscripcion={() => router.push("/suscripcion")}
          />
        );
      case "recursos":
        return (
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
        );
      default:
        return null;
    }
  })();

  return (
    <>
      <PageShell className="relative text-rose-950">
        <div className="grid gap-5 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start xl:grid-cols-[20rem_minmax(0,1fr)]">
          <aside className="glass-shell sticky top-5 hidden max-h-[calc(100vh-2.5rem)] overflow-auto rounded-[28px] p-4 lg:block">
            <div className="space-y-5">
              <div className="rounded-3xl border border-white/60 bg-white/42 p-4">
                <p className="app-kicker">Dashboard</p>
                <h1 className="mt-2 text-2xl font-semibold leading-tight text-rose-950">
                  {userName || "Exploradora"}
                </h1>
                <p className="mt-2 text-sm leading-6 text-rose-800/70">
                  {fechaActual || "Hoy"} · Dia {day} · Ciclo {cicloActual}
                </p>
              </div>

              <CycleProgress day={day} />

              <nav className="space-y-2" aria-label="Secciones del dashboard">
                {dashboardPanels.map(
                  ({ id, label, description, Icon, disabled }) => {
                    const isActive = activePanel === id;

                    return (
                      <button
                        key={id}
                        type="button"
                        disabled={disabled}
                        onClick={() => setActivePanel(id)}
                        className={`app-focus-ring flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition ${
                          isActive
                            ? "border-rose-200/80 bg-white/70 text-rose-950 shadow-inner"
                            : "border-transparent text-rose-700 hover:border-white/70 hover:bg-white/42"
                        } ${disabled ? "cursor-not-allowed opacity-45" : ""}`}
                      >
                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                            isActive
                              ? "border-rose-200 bg-rose-100/80 text-rose-700"
                              : "border-white/60 bg-white/36 text-rose-500"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold">
                            {label}
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-rose-700/64">
                            {description}
                          </span>
                        </span>
                      </button>
                    );
                  }
                )}
              </nav>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-2xl border border-white/60 bg-white/42 p-3">
                  <Leaf className="mb-2 h-4 w-4 text-rose-500" />
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-rose-500">
                    Plan
                  </p>
                  <p className="mt-1 text-sm font-semibold text-rose-950">
                    {isSubscriber ? "Activo" : "Gratuito"}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/60 bg-white/42 p-3">
                  <Sparkles className="mb-2 h-4 w-4 text-rose-500" />
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-rose-500">
                    Recursos
                  </p>
                  <p className="mt-1 text-sm font-semibold text-rose-950">
                    {recursosData.length}
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <div className="min-w-0 space-y-5">
            <section className="glass-shell rounded-[28px] p-4 sm:p-5 lg:hidden">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="app-kicker">Dashboard</p>
                  <h1 className="mt-1 text-2xl font-semibold text-rose-950">
                    {userName || "Exploradora"}
                  </h1>
                  <p className="mt-1 text-sm text-rose-800/70">
                    Dia {day} · Ciclo {cicloActual}
                  </p>
                </div>
                <PrimaryAction
                  onClick={() => setActivePanel("registro")}
                  disabled={!(userId && estadoCiclo && fechaInicioCiclo)}
                  className="min-h-10 px-4"
                >
                  <PenLine className="h-4 w-4" />
                </PrimaryAction>
              </div>
              <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                {dashboardPanels.map(({ id, label, Icon, disabled }) => (
                  <button
                    key={id}
                    type="button"
                    disabled={disabled}
                    onClick={() => setActivePanel(id)}
                    className={`app-focus-ring inline-flex shrink-0 items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-semibold transition ${
                      activePanel === id
                        ? "border-rose-200 bg-white/72 text-rose-950"
                        : "border-white/60 bg-white/34 text-rose-700"
                    } ${disabled ? "opacity-45" : ""}`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
            </section>

            <motion.section
              key={activePanel}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28 }}
              className="min-w-0"
            >
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="app-kicker">{activePanelData.label}</p>
                  <h2 className="mt-1 text-2xl font-semibold text-rose-950 sm:text-3xl">
                    {activePanelData.description}
                  </h2>
                </div>
                <Link
                  href="/manual"
                  className="app-focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl border border-white/70 bg-white/46 px-4 py-2 text-sm font-semibold text-rose-800 transition hover:bg-white/72"
                >
                  <BookOpen className="h-4 w-4" />
                  Guia
                </Link>
              </div>

              {activeContent}
            </motion.section>
          </div>
        </div>
      </PageShell>

      <QuickNav currentDay={day} userName={userName || ""} />
      <ToastContainer />
    </>
  );
}
