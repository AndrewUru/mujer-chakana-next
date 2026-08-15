"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Compass,
  Flower2,
  Leaf,
  Moon,
  PenLine,
  Settings,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
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
import styles from "./dashboard.module.css";

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

const ELEMENT_SCENES: Record<string, { image: string; accent: string; label: string }> = {
  agua: { image: "/agua-ui.webp", accent: "#83e2ea", label: "Agua" },
  fuego: { image: "/fuego-ui.webp", accent: "#ffb26f", label: "Fuego" },
  tierra: { image: "/tierra-ui.webp", accent: "#d8b36e", label: "Tierra" },
  aire: { image: "/cielo-ui.webp", accent: "#f0d3c4", label: "Aire" },
  cielo: { image: "/cielo-ui.webp", accent: "#f0d3c4", label: "Cielo" },
};

const normalizeElement = (value?: string | null) =>
  (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const LoadingState = ({ message }: { message: string }) => (
  <div className={styles.loadingState}>
    <div className={styles.loadingCompass} aria-hidden="true">
      <span />
      <Moon />
    </div>
    <p>{message}</p>
    <small>Organizando tu cielo interior</small>
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
    <div
      className={styles.cycleDial}
      style={{ "--cycle-progress": `${percentage * 3.6}deg` } as CSSProperties}
      aria-label={`Día ${day} de ${TOTAL_CYCLE_DAYS}, fase ${phase}`}
    >
      <div className={styles.dialOrbit} aria-hidden="true">
        <span />
      </div>
      <div className={styles.dialCore}>
        <small>día</small>
        <strong>{day}</strong>
        <span>de {TOTAL_CYCLE_DAYS}</span>
      </div>
      <p>{phase}</p>
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
    <article className={styles.insightCard}>
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{description}</span>
    </article>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const { ToastContainer } = useToast();
  const [userName, setUserName] = useState<string | null>(null);
  const [fechaActual] = useState(() =>
    new Date().toLocaleDateString("es-ES", {
      weekday: "long",
      day: "2-digit",
      month: "long",
    }),
  );
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
    : "Registra tus sensaciones para activar una lectura más personal.";

  const cycleHighlights = useMemo(
    () =>
      estadoCiclo
        ? [
            {
              label: "Arquetipo guía",
              value: estadoCiclo.arquetipo,
              description: descripcionCorta,
            },
            {
              label: "Elemento del día",
              value: estadoCiclo.elemento,
              description: "Úsalo como símbolo para ordenar tu energía de hoy.",
            },
            {
              label: "Ritmo actual",
              value: `Día ${day} · Ciclo ${cicloActual}`,
              description: "Observa tu energía y registra lo que aparece.",
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
              description: "Explora audios, rituales y guías para acompañar el proceso.",
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
        description: "Mapa visual de 28 días",
        Icon: CalendarDays,
      },
      {
        id: "registro",
        label: "Registro",
        description: "Anota cómo estás hoy",
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
          <div className={styles.cycleContent}>
            {fechaInicioCiclo && fechaFinCiclo ? (
              <CicloResumen
                day={day}
                fechaInicioCiclo={fechaInicioCiclo}
                fechaFinCiclo={fechaFinCiclo}
                userName={userName ?? undefined}
                mujerChakanaData={estadoCiclo}
                isSubscriber={isSubscriber}
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
              Necesitamos tu fecha de inicio para calcular el día del ciclo y
              activar la guía diaria.
            </p>
            <PrimaryAction href="/setup" className="mt-6">
              Ir a configuración
            </PrimaryAction>
          </GlassCard>
        );
      case "moonboard":
        return <Moonboard startDate={fechaInicioCiclo} />;
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
                  Rituales, audios y guías para acompañar el momento del ciclo
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
            <RecursosList recursos={recursosData} isSubscriber={isSubscriber} />
          </GlassCard>
        );
      default:
        return null;
    }
  })();

  const elementScene = ELEMENT_SCENES[normalizeElement(estadoCiclo?.elemento)] || {
    image: "/mujer-chakana.webp",
    accent: "#f2a9bd",
    label: "Chakana",
  };
  const heroImage = estadoCiclo?.imagen_url || elementScene.image;
  const firstName = userName?.trim().split(/\s+/)[0] || "Exploradora";
  const canRegister = Boolean(userId && estadoCiclo && fechaInicioCiclo);

  return (
    <div
      className={styles.dashboard}
      style={{ "--dashboard-accent": elementScene.accent } as CSSProperties}
    >
      <PageShell className={styles.pageShell}>
        <motion.header
          className={styles.hero}
          initial={reduceMotion ? false : { opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className={styles.heroImage} aria-hidden="true">
            <Image src={heroImage} alt="" fill sizes="100vw" priority />
          </div>
          <div className={styles.heroVeil} aria-hidden="true" />

          <div className={styles.heroTopline}>
            <span className={styles.observatoryMark}>
              <Compass aria-hidden="true" />
              Observatorio cíclico
            </span>
            <div className={styles.heroMeta}>
              <span><Leaf aria-hidden="true" /> {isSubscriber ? "Círculo activo" : "Plan gratuito"}</span>
              <Link href="/setup" aria-label="Configurar perfil">
                <Settings aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <p>{fechaActual}</p>
              <h1>
                Hoy, {firstName},
                <em>{estadoCiclo ? estadoCiclo.arquetipo : "tu ciclo pide un punto de partida"}.</em>
              </h1>
              <span className={styles.heroDescription}>
                {estadoCiclo
                  ? descripcionCorta
                  : "Configura tu fecha de inicio para abrir la lectura de este día."}
              </span>
              <div className={styles.heroActions}>
                <button
                  type="button"
                  onClick={() => setActivePanel("registro")}
                  disabled={!canRegister}
                  className={styles.primaryHeroAction}
                >
                  <PenLine aria-hidden="true" />
                  Registrar cómo estoy
                  <ArrowRight aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setActivePanel("moonboard")}
                  className={styles.secondaryHeroAction}
                >
                  Ver mi Moonboard
                </button>
              </div>
            </div>

            <CycleProgress day={day} />
          </div>

          <section className={styles.insightRail} aria-label="Lectura rápida del día">
            {cycleHighlights.map((item) => (
              <InsightCard key={item.label} {...item} />
            ))}
          </section>
        </motion.header>

        <nav className={styles.panelNav} aria-label="Capítulos del dashboard" role="tablist">
          {dashboardPanels.map(({ id, label, description, Icon, disabled }, index) => {
            const isActive = activePanel === id;
            return (
              <button
                key={id}
                id={`dashboard-tab-${id}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls="dashboard-panel"
                disabled={disabled}
                onClick={() => setActivePanel(id)}
                className={isActive ? styles.panelTabActive : styles.panelTab}
              >
                <span className={styles.panelIndex}>0{index + 1}</span>
                <Icon aria-hidden="true" />
                <span>
                  <strong>{label}</strong>
                  <small>{description}</small>
                </span>
              </button>
            );
          })}
        </nav>

        <motion.section
          key={activePanel}
          id="dashboard-panel"
          role="tabpanel"
          aria-labelledby={`dashboard-tab-${activePanel}`}
          className={styles.workspace}
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.34 }}
        >
          <header className={styles.workspaceHeader}>
            <div>
              <p>{activePanelData.label} · capítulo activo</p>
              <h2>{activePanelData.description}</h2>
            </div>
            <Link href="/manual" className={styles.guideLink}>
              <BookOpen aria-hidden="true" />
              Abrir guía
            </Link>
          </header>
          <div className={styles.workspaceContent}>{activeContent}</div>
        </motion.section>
      </PageShell>
      <QuickNav currentDay={day} userName={userName || ""} />
      <ToastContainer />
    </div>
  );
}
