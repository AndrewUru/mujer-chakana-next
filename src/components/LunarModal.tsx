"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import { ArrowLeft, Moon, RefreshCcw, X } from "lucide-react";
import { phase } from "lune";
import { getLunarImage } from "@/lib/lunarImages";
import { supabase } from "@/lib/supabaseClient";
import styles from "./LunarModal.module.css";

interface FaseLunarDB {
  nombre_fase: string;
  color: "gray" | "emerald" | "yellow" | "purple";
  rango_inicio: number;
  rango_fin: number;
  mensaje?: string;
}

interface LunarModalProps {
  fecha: Date;
  onClose: () => void;
}

const PHASE_COLORS = {
  gray: "#c9cedb",
  emerald: "#b6d3c4",
  yellow: "#ead0a0",
  purple: "#d8b7cf",
} as const;

const PRACTICES = [
  { title: "Escucha", text: "Haz una pausa y pon nombre a lo que sientes." },
  { title: "Dale forma", text: "Escribe, dibuja o graba una nota. No necesita ser perfecto." },
  { title: "Guarda una huella", text: "Lleva lo que descubras a tu registro del día." },
];

export default function LunarModal({ fecha, onClose }: LunarModalProps) {
  const selectedTime = fecha.getTime();
  const lunar = useMemo(() => phase(new Date(selectedTime)), [selectedTime]);
  const lunarImage = getLunarImage(lunar.phase);
  const reduceMotion = useReducedMotion();
  const [fase, setFase] = useState<FaseLunarDB | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  const [closing, setClosing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchPhase() {
      setLoading(true);
      setLoadFailed(false);
      setFase(null);

      try {
        const { data, error } = await supabase
          .from("fases_lunares")
          .select("*")
          .abortSignal(controller.signal)
          .returns<FaseLunarDB[]>();

        if (controller.signal.aborted) return;
        if (error) throw error;

        const match = data?.find(
          (item) => lunar.age >= item.rango_inicio && lunar.age <= item.rango_fin,
        );
        setFase(match ?? null);
      } catch {
        if (!controller.signal.aborted) setLoadFailed(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void fetchPhase();
    return () => controller.abort();
  }, [lunar.age, retry]);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!mounted || !dialogRef.current) return;

    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus({ preventScroll: true });

    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
        previousFocus.focus({ preventScroll: true });
      }
    };
  }, [mounted]);

  const handleClose = useCallback(() => {
    if (closeTimerRef.current) return;
    setClosing(true);
    closeTimerRef.current = setTimeout(onClose, reduceMotion ? 0 : 220);
  }, [onClose, reduceMotion]);

  if (!mounted) return null;

  const accent = PHASE_COLORS[fase?.color ?? "gray"] ?? PHASE_COLORS.gray;

  return createPortal(
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      data-closing={closing}
      aria-labelledby="lunar-modal-title"
      onCancel={(event) => {
        event.preventDefault();
        handleClose();
      }}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const buttons = event.currentTarget.querySelectorAll<HTMLButtonElement>("button:not(:disabled)");
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) handleClose();
      }}
      style={{ "--lunar-accent": accent, "--lunar-angle": `${lunar.phase * 360}deg` } as CSSProperties}
    >
      <div className={styles.panel}>
        <header className={styles.header}>
          <span className={styles.eyebrow}><Moon size={15} aria-hidden="true" /> Tu cielo lunar</span>
          <button ref={closeButtonRef} type="button" onClick={handleClose} className={styles.close} aria-label="Cerrar modal lunar">
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <div className={styles.content}>
          <div className={styles.heading}>
            <time className={styles.date} dateTime={`${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`}>
              {fecha.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
            </time>
            <h1 id="lunar-modal-title">{lunarImage.name}</h1>
            <p className={styles.intro}>Mira la luna. Vuelve a ti.</p>
          </div>

          <div className={styles.observatory}>
            <div className={styles.orbit}>
              <div className={styles.orbitMarker} aria-hidden="true" />
              <div className={styles.moonHalo} aria-hidden="true" />
              <Image
                src={lunarImage.src}
                alt={lunarImage.name}
                width={360}
                height={360}
                sizes="(max-width: 640px) 210px, 320px"
                className={styles.moonImage}
                priority
              />
            </div>
            <p className={styles.orbitCaption}>Un instante de tu vuelta</p>
            <dl className={styles.moonData}>
              <div>
                <dt>Iluminación</dt>
                <dd>{Math.round(lunar.illuminated * 100)}<span>%</span></dd>
              </div>
              <div>
                <dt>Edad lunar</dt>
                <dd>{lunar.age.toLocaleString("es-ES", { maximumFractionDigits: 1 })}<span>días</span></dd>
              </div>
            </dl>
          </div>

          <div className={styles.reading}>
            <section className={styles.phaseMessage} aria-label="Lectura de la fase" aria-busy={loading}>
              {loading ? (
                <p className={styles.loading} role="status">Preparando la lectura de esta luna…</p>
              ) : loadFailed ? (
                <div role="status">
                  <p>No pudimos cargar la lectura. Puedes seguir contemplando la luna de este día.</p>
                  <button type="button" className={styles.retry} onClick={() => setRetry((value) => value + 1)}>
                    <RefreshCcw size={14} aria-hidden="true" /> Reintentar
                  </button>
                </div>
              ) : (
                <p>{fase?.mensaje || "No hay una lectura disponible para este día. Tómate un momento para observar cómo te sientes."}</p>
              )}
            </section>

            <section className={styles.practice} aria-labelledby="lunar-practice-title">
              <h2 id="lunar-practice-title">Una pausa para integrar</h2>
              <ol>
                {PRACTICES.map((item, index) => (
                  <li key={item.title}>
                    <span className={styles.step} aria-hidden="true">0{index + 1}</span>
                    <div><h3>{item.title}</h3><p>{item.text}</p></div>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </div>

        <footer className={styles.footer}>
          <p>Tu ritmo también merece espacio.</p>
          <button type="button" onClick={handleClose} className={styles.returnButton}>
            <ArrowLeft size={17} aria-hidden="true" /> Volver al moonboard
          </button>
        </footer>
      </div>
    </dialog>,
    document.body,
  );
}
