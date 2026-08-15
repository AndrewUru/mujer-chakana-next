"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Check,
  Flame,
  Leaf,
  Moon,
  Pause,
  Play,
  Sparkles,
  Waves,
  Wind,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import styles from "./bienvenida.module.css";

const TOTAL_CYCLE_DAYS = 28;
const DEPARTURE_MS = 920;

interface WelcomeContext {
  name: string;
  startDate: string | null;
  cycleDay: number | null;
  archetype: string | null;
  element: string | null;
}

const INITIAL_CONTEXT: WelcomeContext = {
  name: "",
  startDate: null,
  cycleDay: null,
  archetype: null,
  element: null,
};

const ELEMENTS: Record<
  string,
  { image: string; label: string; Icon: LucideIcon; accent: string }
> = {
  agua: { image: "/agua-ui.webp", label: "Agua", Icon: Waves, accent: "#79dbe5" },
  fuego: { image: "/fuego-ui.webp", label: "Fuego", Icon: Flame, accent: "#ffad73" },
  tierra: { image: "/tierra-ui.webp", label: "Tierra", Icon: Leaf, accent: "#d8b46e" },
  cielo: { image: "/cielo-ui.webp", label: "Cielo", Icon: Wind, accent: "#f2d5c5" },
};

const ARRIVAL_STAGES = [
  { title: "Reconociendo tu ritmo", detail: "Tu fecha y tu día cíclico" },
  { title: "Abriendo tu arquetipo", detail: "La cualidad disponible hoy" },
  { title: "Preparando tu espacio", detail: "Moonboard y Samari en contexto" },
];

function normalizeElement(value: string | null) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function calculateCycleDay(startDate: string | null) {
  if (!startDate) return null;
  const start = new Date(`${startDate.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(start.getTime())) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const elapsed = Math.floor((today.getTime() - start.getTime()) / 86_400_000);
  if (elapsed < 0) return 1;
  return (elapsed % TOTAL_CYCLE_DAYS) + 1;
}

export default function BienvenidaPage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [context, setContext] = useState(INITIAL_CONTEXT);
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState(0);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [departing, setDeparting] = useState(false);

  const elementKey = normalizeElement(context.element);
  const element = ELEMENTS[elementKey] || {
    image: "/mujer-chakana.webp",
    label: "Chakana",
    Icon: Moon,
    accent: "#f3a8bd",
  };
  const ElementIcon = element.Icon;

  const firstName = useMemo(
    () => context.name.trim().split(/\s+/)[0] || "mujer cíclica",
    [context.name],
  );

  const formattedDate = useMemo(() => {
    if (!context.startDate) return "Lista para configurar";
    return new Date(`${context.startDate.slice(0, 10)}T00:00:00`).toLocaleDateString(
      "es-ES",
      { day: "numeric", month: "long" },
    );
  }, [context.startDate]);

  const enterDashboard = useCallback(() => {
    if (departing) return;
    setDeparting(true);
    window.setTimeout(
      () => router.push("/dashboard"),
      reduceMotion ? 120 : DEPARTURE_MS,
    );
  }, [departing, reduceMotion, router]);

  useEffect(() => {
    let active = true;

    async function loadWelcomeContext() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("perfiles")
        .select("display_name, fecha_inicio")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError) console.error("Error obteniendo el perfil:", profileError.message);

      const cycleDay = calculateCycleDay(profile?.fecha_inicio ?? null);
      const archetypeResult = cycleDay
        ? await supabase
            .from("mujer_chakana")
            .select("arquetipo, elemento")
            .eq("dia_ciclo", cycleDay)
            .maybeSingle()
        : { data: null, error: null };

      if (archetypeResult.error) {
        console.error("Error obteniendo el arquetipo:", archetypeResult.error.message);
      }

      if (active) {
        setContext({
          name: profile?.display_name || user.user_metadata?.display_name || "",
          startDate: profile?.fecha_inicio ?? null,
          cycleDay,
          archetype: archetypeResult.data?.arquetipo ?? null,
          element: archetypeResult.data?.elemento ?? null,
        });
        setLoading(false);
      }
    }

    void loadWelcomeContext();
    router.prefetch("/dashboard");

    return () => {
      active = false;
    };
  }, [router]);

  useEffect(() => {
    if (loading || !autoAdvance || departing) return;

    const stageTwo = window.setTimeout(() => setStage(1), 1350);
    const stageThree = window.setTimeout(() => setStage(2), 3000);
    const departure = window.setTimeout(enterDashboard, 6100);

    return () => {
      window.clearTimeout(stageTwo);
      window.clearTimeout(stageThree);
      window.clearTimeout(departure);
    };
  }, [autoAdvance, departing, enterDashboard, loading]);

  if (loading) {
    return (
      <main className={styles.loadingGate}>
        <span className={styles.loadingOrbit} aria-hidden="true" />
        <Moon aria-hidden="true" />
        <p>Preparando tu umbral…</p>
      </main>
    );
  }

  return (
    <main
      className={styles.gateway}
      style={{ "--element-accent": element.accent } as CSSProperties}
    >
      <div className={styles.backdrop} aria-hidden="true">
        <Image src={element.image} alt="" fill sizes="100vw" priority />
      </div>
      <div className={styles.veil} aria-hidden="true" />
      <div className={styles.grain} aria-hidden="true" />

      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="Mujer Chakana, inicio">
          <Image src="/logo_chakana.png" alt="" width={38} height={38} priority />
          <span>Mujer Chakana</span>
        </Link>
        <span className={styles.arrivalCode}>Umbral · 01</span>
      </header>

      <section className={styles.stage}>
        <motion.div
          className={styles.copy}
          initial={reduceMotion ? false : { opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className={styles.kicker}>
            <Sparkles aria-hidden="true" />
            Tu espacio ha sido tejido
          </p>
          <h1>
            Bienvenida,
            <em>{firstName}.</em>
          </h1>
          <p className={styles.intro}>
            No entras a un tablero cualquiera. Entras a una forma más atenta de escuchar
            tu cuerpo, registrar tu ritmo y conversar con Samari desde tu propio contexto.
          </p>

          <div className={styles.contextLine}>
            <span>
              <Moon aria-hidden="true" />
              {context.cycleDay ? `Día ${context.cycleDay} de 28` : "Primer día por definir"}
            </span>
            <span>
              <ElementIcon aria-hidden="true" />
              {context.archetype || element.label}
            </span>
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.enterButton} onClick={enterDashboard}>
              Entrar en mi espacio
              <ArrowRight aria-hidden="true" />
            </button>
            <button
              type="button"
              className={styles.pauseButton}
              onClick={() => setAutoAdvance((current) => !current)}
              aria-pressed={!autoAdvance}
            >
              {autoAdvance ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
              {autoAdvance ? "Quedarme un momento" : "Continuar el viaje"}
            </button>
          </div>

          <Link href="/manual" className={styles.manualLink}>
            <BookOpen aria-hidden="true" />
            Prefiero conocer primero el manual
          </Link>
        </motion.div>

        <motion.aside
          className={styles.apertureArea}
          initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          aria-label="Tu contexto cíclico de hoy"
        >
          <div className={styles.orbitOuter} aria-hidden="true" />
          <div className={styles.orbitInner} aria-hidden="true" />
          <div className={styles.aperture}>
            <Image src={element.image} alt="" fill sizes="(max-width: 760px) 72vw, 40vw" />
            <div className={styles.apertureShade} />
            <div className={styles.daySeal}>
              <span>{context.cycleDay ? "día" : "inicio"}</span>
              <strong>{context.cycleDay || "·"}</strong>
              <small>{element.label}</small>
            </div>
          </div>
          <p className={styles.archetypeLabel}>{context.archetype || "Tu ciclo comienza aquí"}</p>
        </motion.aside>
      </section>

      <section className={styles.alignment} aria-label="Preparación del espacio">
        <div className={styles.alignmentHead}>
          <span>Ritual de llegada</span>
          <span>{autoAdvance ? "en curso" : "en pausa"}</span>
        </div>
        <div className={styles.progressTrack} aria-hidden="true">
          <motion.span
            animate={{ width: `${((stage + 1) / ARRIVAL_STAGES.length) * 100}%` }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
        <ol className={styles.stageList}>
          {ARRIVAL_STAGES.map((item, index) => {
            const isDone = index < stage;
            const isActive = index === stage;
            return (
              <li
                key={item.title}
                className={isActive ? styles.stageActive : isDone ? styles.stageDone : ""}
              >
                <span className={styles.stageNumber}>
                  {isDone ? <Check aria-hidden="true" /> : `0${index + 1}`}
                </span>
                <div>
                  <strong>{item.title}</strong>
                  <small>{item.detail}</small>
                </div>
              </li>
            );
          })}
        </ol>
        <p className={styles.syncNote}>
          <span>{context.startDate ? "Ciclo sincronizado" : "Ciclo listo para configurar"}</span>
          <span>{formattedDate}</span>
        </p>
      </section>

      <AnimatePresence>
        {departing ? (
          <motion.div
            className={styles.departure}
            initial={reduceMotion ? { opacity: 0 } : { clipPath: "circle(0% at 50% 50%)" }}
            animate={
              reduceMotion
                ? { opacity: 1 }
                : { clipPath: "circle(150% at 50% 50%)" }
            }
            transition={{ duration: reduceMotion ? 0.1 : 0.9, ease: [0.76, 0, 0.24, 1] }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: reduceMotion ? 0 : 0.34, duration: 0.35 }}
            >
              <Moon aria-hidden="true" />
              <p>Tu espacio está listo</p>
              <span>Entrando a tu día cíclico</span>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
