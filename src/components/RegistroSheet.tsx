"use client";

import { useEffect, useRef, useState, type ComponentProps, type CSSProperties } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";
import NuevoRegistro from "./NuevoRegistro";
import { DURATION, enter } from "@/lib/motion";
import styles from "./RegistroSheet.module.css";

type RegistroProps = Omit<ComponentProps<typeof NuevoRegistro>, "immersive" | "onSaved" | "onReflection">;

interface Props extends RegistroProps {
  open: boolean;
  /** Color del elemento del día, para el anillo del ritual. */
  accent: string;
  onClose: () => void;
  onSaved: () => void;
}

const TOTAL_DAYS = 28;

/**
 * Bitácora en una hoja inferior. Se monta una vez y solo se oculta al cerrar,
 * así un borrador sin enviar sigue ahí al volver a abrirla.
 */
export default function RegistroSheet({ open, accent, onClose, onSaved, ...registro }: Props) {
  const reduceMotion = useReducedMotion();
  const dialog = useRef<HTMLDialogElement>(null);
  const ritualTitle = useRef<HTMLHeadingElement>(null);
  const [closing, setClosing] = useState(false);
  const [phase, setPhase] = useState<"form" | "ritual">("form");
  const [reflection, setReflection] = useState<string | null>(null);

  useEffect(() => {
    if (open && !dialog.current?.open) dialog.current?.showModal();
  }, [open]);

  useEffect(() => {
    if (phase === "ritual") ritualTitle.current?.focus({ preventScroll: true });
  }, [phase]);

  // Todo cierre acaba en el evento nativo "close" (incluido el que fuerza el navegador).
  const finishClose = () => dialog.current?.close();

  const requestClose = () => {
    if (reduceMotion) finishClose();
    else setClosing(true);
  };

  return (
    <dialog
      ref={dialog}
      className={styles.sheet}
      data-closing={closing || undefined}
      aria-labelledby={phase === "form" ? "registro-sheet-title" : "ritual-title"}
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
      onClose={() => {
        setClosing(false);
        onClose();
      }}
      onAnimationEnd={(event) => {
        if (closing && event.target === event.currentTarget) finishClose();
      }}
    >
      <header className={styles.bar}>
        <span className={styles.handle} aria-hidden="true" />
        <p id="registro-sheet-title">Bitácora · Día {String(registro.dia_ciclo).padStart(2, "0")}</p>
        <button type="button" onClick={requestClose} aria-label="Cerrar bitácora">
          <X size={19} aria-hidden="true" />
        </button>
      </header>

      <div className={styles.body}>
        {phase === "form" ? (
          <NuevoRegistro
            {...registro}
            immersive
            onSaved={() => {
              setPhase("ritual");
              onSaved();
            }}
            onReflection={setReflection}
          />
        ) : (
          <Ritual
            day={registro.dia_ciclo}
            accent={accent}
            reflection={reflection}
            titleRef={ritualTitle}
            onDone={requestClose}
          />
        )}
      </div>
    </dialog>
  );
}

function Ritual({ day, accent, reflection, titleRef, onDone }: {
  day: number;
  accent: string;
  reflection: string | null;
  titleRef: React.RefObject<HTMLHeadingElement | null>;
  onDone: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const words = reflection?.split(/\s+/).filter(Boolean) ?? [];
  // El reflejo completo aparece en unos 2,4 s sea cual sea su largo.
  const stagger = Math.min(0.045, 2.4 / Math.max(words.length, 1));

  return (
    <section className={styles.ritual} style={{ "--ritual-accent": accent } as CSSProperties}>
      <div className={styles.ring}>
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <circle cx="60" cy="60" r="54" className={styles.track} />
          <motion.circle
            cx="60" cy="60" r="54"
            className={styles.progress}
            initial={reduceMotion ? false : { pathLength: (day - 1) / TOTAL_DAYS }}
            animate={{ pathLength: day / TOTAL_DAYS }}
            transition={{ ...enter(DURATION.reveal * 2), delay: 0.2 }}
          />
        </svg>
        <div className={styles.ringCenter}>
          <strong>{day}</strong>
          <span>de {TOTAL_DAYS}</span>
        </div>
      </div>

      <motion.div
        className={styles.ritualCopy}
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...enter(DURATION.reveal), delay: 0.5 }}
      >
        <p className={styles.eyebrow}>Huella guardada · Día {day}</p>
        <h2 id="ritual-title" ref={titleRef} tabIndex={-1}>
          Lo que nombras, <em>se transforma.</em>
        </h2>

        <div className={styles.reflection} role="status">
          {reflection ? (
            <>
              <span className={styles.reflectionLabel}>Samari · Reflejo del día</span>
              <p className="sr-only">{reflection}</p>
              <p aria-hidden="true">
                {words.map((word, index) => (
                  <motion.span
                    key={index}
                    initial={reduceMotion ? false : { opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...enter(DURATION.slow), delay: index * stagger }}
                  >
                    {word}{" "}
                  </motion.span>
                ))}
              </p>
            </>
          ) : (
            <p className={styles.listening}>
              <span aria-hidden="true" />
              Samari está escuchando tu registro…
            </p>
          )}
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.primary} onClick={onDone}>
            Volver a mi día
          </button>
          <Link href="/registros" className={styles.secondary}>
            Ver mis registros <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
