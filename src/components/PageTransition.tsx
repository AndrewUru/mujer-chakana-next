"use client";

import { MotionConfig, motion } from "framer-motion";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, useTransition, type CSSProperties, type ReactNode } from "react";
import styles from "./PageTransition.module.css";
import { DURATION, enter } from "@/lib/motion";

const PortalScene = dynamic(() => import("./NavigationPortalScene"), { ssr: false });
const MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const getReducedMotion = () => window.matchMedia(MOTION_QUERY).matches;
const getServerReducedMotion = () => true;
function subscribeToMotion(onChange: () => void) {
  const media = window.matchMedia(MOTION_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

export function preparePageTransition() {
  if (!getReducedMotion()) {
    void import("./NavigationPortalScene");
  }
}

const SCENES: Record<string, { image: string; accent: string; word: string }> = {
  "/moonboard": { image: "/cielo-ui.webp", accent: "#c6c2e8", word: "Abre tu luna" },
  "/dashboard": { image: "/mujer-chakana.webp", accent: "#f7b5c8", word: "Volver a ti" },
  "/ciclo": { image: "/fuego-ui.webp", accent: "#ffc37a", word: "Reconocer" },
  "/registros": { image: "/agua-ui.webp", accent: "#88e6ef", word: "Escuchar" },
  "/setup": { image: "/tierra-ui.webp", accent: "#e6c07a", word: "Enraizar" },
  "/recursos": { image: "/cielo-ui.webp", accent: "#ffe0b0", word: "Descubrir" },
  "/manual": { image: "/tierra-ui.webp", accent: "#e6c07a", word: "Integrar" },
};

// La vista rápida no espera más que esto a la nueva ruta: mientras dura,
// el navegador congela la pantalla en la instantánea anterior.
const QUICK_TRANSITION_TIMEOUT = 1500;

type Journey = { href: string; label: string; phase: "covering" | "navigating" | "revealing" };
/**
 * "quick": fundido breve con la View Transitions API, para la navegación diaria.
 * "cinematic": el portal a pantalla completa, reservado a momentos especiales.
 * Devuelve false cuando el enlace debe navegar por sí mismo.
 */
type Navigate = (href: string, label: string, mode?: "quick" | "cinematic") => boolean;
const NavigationContext = createContext<Navigate | null>(null);

export function usePageTransition() {
  return useContext(NavigationContext);
}

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const reduceMotion = useSyncExternalStore(subscribeToMotion, getReducedMotion, getServerReducedMotion);
  const [journey, setJourney] = useState<Journey | null>(null);
  const [isPending, startTransition] = useTransition();
  const locked = useRef(false);
  const pushed = useRef(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const settleQuick = useRef<(() => void) | null>(null);

  // La nueva ruta ya está en el DOM: la vista rápida puede capturarla.
  useLayoutEffect(() => {
    settleQuick.current?.();
  }, [pathname]);

  const navigate = useCallback<Navigate>((href, label, mode = "quick") => {
    if (locked.current || href === pathname) return true;
    if (reduceMotion) return false;

    if (mode === "quick") {
      if (!document.startViewTransition) return false;
      locked.current = true;
      const transition = document.startViewTransition(() => new Promise<void>((resolve) => {
        const settle = () => {
          window.clearTimeout(timer);
          settleQuick.current = null;
          resolve();
        };
        const timer = window.setTimeout(settle, QUICK_TRANSITION_TIMEOUT);
        settleQuick.current = settle;
        router.push(href);
      }));
      void transition.finished.finally(() => {
        locked.current = false;
        document.getElementById("main-content")?.focus({ preventScroll: true });
      });
      return true;
    }

    locked.current = true;
    pushed.current = false;
    router.prefetch(href);
    setJourney({ href, label, phase: "covering" });
    return true;
  }, [pathname, reduceMotion, router]);

  const finish = useCallback(() => {
    const didNavigate = pushed.current;
    locked.current = false;
    pushed.current = false;
    contentRef.current?.removeAttribute("inert");
    setJourney(null);
    if (didNavigate) document.getElementById("main-content")?.focus({ preventScroll: true });
  }, []);

  // Reveal after the router commits, including redirects.
  useEffect(() => {
    if (journey?.phase === "navigating" && !isPending) {
      setJourney((current) => current ? { ...current, phase: "revealing" } : null);
    }
  }, [journey?.phase, isPending]);

  const busy = journey !== null;
  useEffect(() => {
    if (!busy) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Failed or interrupted navigation must never trap the interface.
    const timeout = window.setTimeout(finish, 12000);
    return () => {
      window.clearTimeout(timeout);
      document.body.style.overflow = previousOverflow;
    };
  }, [busy, finish]);

  const scene = SCENES[journey?.href ?? ""] ?? SCENES["/dashboard"];

  return (
    <NavigationContext.Provider value={navigate}>
      <MotionConfig reducedMotion="user">
        <div ref={contentRef} inert={busy} aria-busy={busy} className={styles.content}>
          {children}
        </div>
        {journey && (
          <motion.div
            className={styles.veil}
            style={{ "--journey-accent": scene.accent } as CSSProperties}
            data-page-transition={journey.phase}
            initial={{ opacity: 0 }}
            animate={{ opacity: journey.phase === "revealing" ? 0 : 1 }}
            transition={enter(reduceMotion ? 0 : journey.phase === "revealing" ? DURATION.slow : DURATION.base)}
            onAnimationComplete={() => {
              if (journey.phase === "covering" && !pushed.current) {
                pushed.current = true;
                setJourney({ ...journey, phase: "navigating" });
                startTransition(() => router.push(journey.href));
              } else if (journey.phase === "revealing") {
                finish();
              }
            }}
          >
            <div className={styles.landscape} style={{ backgroundImage: `url('${scene.image}')` }} aria-hidden="true" />
            <div className={styles.shade} aria-hidden="true" />
            {!reduceMotion && <PortalScene accent={scene.accent} />}
            <div className={styles.center} role="status" aria-live="polite">
              <p className={styles.eyebrow}>Mujer Chakana · {journey.label}</p>
              <p className={styles.word}>{scene.word}</p>
              <span className={styles.caption}>Un espacio para tu propio ritmo</span>
              <span className="sr-only">Abriendo {journey.label}</span>
            </div>
          </motion.div>
        )}
      </MotionConfig>
    </NavigationContext.Provider>
  );
}
