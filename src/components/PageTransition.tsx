"use client";

import { MotionConfig, motion, useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef, useState, useTransition, type CSSProperties, type ReactNode } from "react";
import styles from "./PageTransition.module.css";

const PortalScene = dynamic(() => import("./NavigationPortalScene"), { ssr: false });

export function preparePageTransition() {
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    void import("./NavigationPortalScene");
  }
}

const SCENES: Record<string, { image: string; accent: string; word: string }> = {
  "/dashboard": { image: "/mujer-chakana.webp", accent: "#f7b5c8", word: "Volver a ti" },
  "/ciclo": { image: "/fuego-ui.webp", accent: "#ffc37a", word: "Reconocer" },
  "/registros": { image: "/agua-ui.webp", accent: "#88e6ef", word: "Escuchar" },
  "/setup": { image: "/tierra-ui.webp", accent: "#e6c07a", word: "Enraizar" },
  "/recursos": { image: "/cielo-ui.webp", accent: "#ffe0b0", word: "Descubrir" },
  "/manual": { image: "/tierra-ui.webp", accent: "#e6c07a", word: "Integrar" },
};

type Journey = { href: string; label: string; phase: "covering" | "navigating" | "revealing" };
const NavigationContext = createContext<((href: string, label: string) => boolean) | null>(null);

export function usePageTransition() {
  return useContext(NavigationContext);
}

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [journey, setJourney] = useState<Journey | null>(null);
  const [isPending, startTransition] = useTransition();
  const locked = useRef(false);
  const pushed = useRef(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const navigate = useCallback((href: string, label: string) => {
    if (locked.current || href === pathname) return true;
    if (reduceMotion) return false;
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
            transition={{ duration: reduceMotion ? 0 : journey.phase === "revealing" ? .6 : .45, ease: [.22, 1, .36, 1] }}
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
