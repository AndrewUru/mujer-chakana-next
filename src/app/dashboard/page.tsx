"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Flower2,
  Leaf,
  Moon,
  PenLine,
  Pause,
  Play,
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

function CycleProgress({ day, onExplore, still }: { day: number; onExplore: () => void; still: boolean }) {
  const percentage = Math.min(100, (day / TOTAL_CYCLE_DAYS) * 100);
  const phase = getCyclePhase(day);

  return (
    <button
      type="button"
      onClick={onExplore}
      className={styles.cycleDial}
      style={{ "--cycle-progress": `${percentage * 3.6}deg` } as CSSProperties}
      aria-label={`Día ${day} de ${TOTAL_CYCLE_DAYS}, fase ${phase}. Explorar mi Moonboard`}
    >
      <svg className={styles.dialDrawing} viewBox="0 0 200 200" aria-hidden="true">
        <circle className={styles.dialTrack} cx="100" cy="100" r="98" />
        <motion.circle className={styles.dialProgress} cx="100" cy="100" r="98" initial={still ? false : { pathLength: 0 }} animate={{ pathLength: percentage / 100 }} transition={{ duration: still ? 0 : 1.8, delay: still ? 0 : 0.25, ease: "easeOut" }} />
        {Array.from({ length: TOTAL_CYCLE_DAYS }, (_, index) => <circle key={index} cx="100" cy="11" r={index === day - 1 ? 2.1 : 0.8} transform={`rotate(${index * 360 / TOTAL_CYCLE_DAYS} 100 100)`} className={index < day ? styles.dialTickActive : styles.dialTick} />)}
      </svg>
      <div className={styles.dialOrbit} aria-hidden="true">
        <span />
      </div>
      <div className={styles.dialCore}>
        <small>día</small>
        <strong>{day}</strong>
        <span>de {TOTAL_CYCLE_DAYS}</span>
      </div>
      <p>{phase}</p>
      <span className={styles.dialExplore}>Explorar ciclo <ArrowRight size={12} /></span>
    </button>
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
  const [motionPaused, setMotionPaused] = useState(false);
  const still = Boolean(reduceMotion || motionPaused);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const sceneX = useSpring(pointerX, { stiffness: 45, damping: 24 });
  const sceneY = useSpring(pointerY, { stiffness: 45, damping: 24 });
  const panelRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
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

  function openPanel(panel: DashboardPanel) {
    setActivePanel(panel);
    requestAnimationFrame(() => {
      panelRef.current?.scrollIntoView({ behavior: still ? "instant" : "smooth", block: "start" });
      panelRef.current?.focus({ preventScroll: true });
    });
  }

  useEffect(() => {
    if (still) { pointerX.set(0); pointerY.set(0); }
  }, [still, pointerX, pointerY]);

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
      data-motion={still ? "paused" : "active"}
      style={{ "--dashboard-accent": elementScene.accent } as CSSProperties}
    >
      <PageShell className={styles.pageShell}>
        <motion.header
          className={styles.hero}
          initial={reduceMotion ? false : { opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
          onPointerMove={(event) => {
            if (still || event.pointerType !== "mouse") return;
            const bounds = event.currentTarget.getBoundingClientRect();
            pointerX.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 18);
            pointerY.set(((event.clientY - bounds.top) / bounds.height - 0.5) * 12);
          }}
          onPointerLeave={() => { pointerX.set(0); pointerY.set(0); }}
        >
          <div className={styles.heroAtmosphere} aria-hidden="true"><span /><span /><span /></div>

          <div className={styles.heroTopline}>
            <span className={styles.observatoryMark}>
              <Flower2 aria-hidden="true" />
              Ginergética<span>MI ESPACIO PERSONAL</span>
            </span>
            <div className={styles.heroMeta}>
              {!reduceMotion && <button type="button" className={styles.motionControl} aria-label={motionPaused ? "Activar movimiento ambiental" : "Pausar movimiento ambiental"} aria-pressed={motionPaused} onClick={() => setMotionPaused(value => !value)}>{motionPaused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}</button>}
              <span><Leaf aria-hidden="true" /> {isSubscriber ? "Círculo activo" : "Plan gratuito"}</span>
              <Link href="/setup" aria-label="Configurar perfil">
                <Settings aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <p>Hola, {firstName}<span />{fechaActual}</p>
              <h1>
                Tu día,
                <em>a tu ritmo.</em>
              </h1>
              <div className={styles.dailyGuide}><span className={styles.guideIcon}><Leaf size={19} aria-hidden="true" /></span><div><small>{estadoCiclo ? "HOY TE ACOMPAÑA" : "COMIENZA POR TI"}</small><strong>{estadoCiclo?.arquetipo || "Cada ciclo es un nuevo comienzo"}</strong></div></div>
              <span className={styles.heroDescription}>
                {estadoCiclo
                  ? descripcionCorta
                  : "Configura tu fecha de inicio para abrir la lectura de este día."}
              </span>
              <div className={styles.heroActions}>
                {canRegister ? <button
                  type="button"
                  onClick={() => openPanel("registro")}
                  className={styles.primaryHeroAction}
                >
                  <PenLine aria-hidden="true" />
                  Registrar cómo estoy
                  <ArrowRight aria-hidden="true" />
                </button> : <Link href="/setup" className={styles.primaryHeroAction}>Configurar mi ciclo <ArrowRight aria-hidden="true" /></Link>}
                <button
                  type="button"
                  onClick={() => openPanel("moonboard")}
                  className={styles.secondaryHeroAction}
                >
                  Ver mi Moonboard
                </button>
              </div>
            </div>

            <div className={styles.heroVisual}>
              <div className={styles.portraitFrame}>
                <motion.div className={styles.heroImage} style={{ x: still ? 0 : sceneX, y: still ? 0 : sceneY }} aria-hidden="true">
                  <Image src={heroImage} alt="" fill sizes="(max-width: 720px) 85vw, 40vw" priority />
                </motion.div>
                <div className={styles.portraitCaption}><span>{elementScene.label}</span><small>Un elemento para conectar contigo</small></div>
              </div>
              <svg className={styles.botanicalLine} viewBox="0 0 120 260" fill="none" aria-hidden="true"><path d="M56 254C80 189 24 112 68 6M61 217C105 206 112 173 109 154C77 163 61 184 61 217ZM58 171C18 159 9 136 13 111C44 123 55 144 58 171ZM56 122C84 115 108 91 106 67C78 75 59 97 56 122ZM56 79C34 66 24 42 31 23C49 37 56 55 56 79Z" stroke="currentColor" strokeWidth="1.1" /></svg>
              <span className={styles.portraitNote}>Todo empieza<br /><em>por escucharte.</em></span>
              {fechaInicioCiclo && <CycleProgress day={day} still={still} onExplore={() => openPanel("moonboard")} />}
            </div>
          </div>

          <section className={styles.insightRail} aria-label="Lectura rápida del día">
            {cycleHighlights.map((item) => (
              <InsightCard key={item.label} {...item} />
            ))}
          </section>
        </motion.header>

        <div className={styles.sectionIntro}><span>Un espacio, muchas formas de cuidarte</span><small>ELIGE POR DÓNDE SEGUIR <ArrowRight size={13} aria-hidden="true" /></small></div>
        <nav ref={navRef} className={styles.panelNav} aria-label="Capítulos del dashboard" role="tablist">
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
                tabIndex={isActive ? 0 : -1}
                disabled={disabled}
                onClick={() => setActivePanel(id)}
                onKeyDown={(event) => {
                  if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
                  event.preventDefault();
                  const enabled = dashboardPanels.filter(panel => !panel.disabled);
                  const current = enabled.findIndex(panel => panel.id === id);
                  const next = event.key === "Home" ? 0 : event.key === "End" ? enabled.length - 1 : (current + (event.key === "ArrowRight" ? 1 : -1) + enabled.length) % enabled.length;
                  setActivePanel(enabled[next].id);
                  navRef.current?.querySelector<HTMLButtonElement>(`#dashboard-tab-${enabled[next].id}`)?.focus();
                }}
                className={isActive ? styles.panelTabActive : styles.panelTab}
              >
                {isActive && <motion.span className={styles.tabIndicator} layoutId="dashboard-active-tab" transition={still ? { duration: 0 } : { type: "spring", stiffness: 360, damping: 34 }} />}
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
          ref={panelRef}
          tabIndex={-1}
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
              <p>Tu espacio de {activePanelData.label.toLocaleLowerCase("es")}</p>
              <h2>{activePanelData.description}</h2>
            </div>
            <Link href="/manual" className={styles.guideLink}>
              <BookOpen aria-hidden="true" />
              Abrir guía
            </Link>
          </header>
          <motion.div key={activePanel} className={styles.workspaceContent} initial={still ? false : { opacity: 0, y: 16, filter: "blur(3px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>{activeContent}</motion.div>
        </motion.section>
      </PageShell>
      <QuickNav currentDay={day} userName={userName || ""} />
      <ToastContainer />
    </div>
  );
}
