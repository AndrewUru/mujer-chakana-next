"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, AudioLines, BookOpen, Pause, Play, Sparkles, X } from "lucide-react";
import { DURATION, enter } from "@/lib/motion";
import ElementAtmosphere, { type Mood } from "./ElementAtmosphere";
import styles from "./immersion.module.css";

export interface ArquetipoDia {
  id: number;
  dia_ciclo: number;
  semana: number;
  arquetipo: string;
  descripcion: string;
  imagen_url?: string | null;
  elemento: string;
  audio_url?: string;
  ritual_pdf?: string;
  tip_extra?: string;
}

export const WEEK_META: Record<number, { name: string; action: string; copy: string }> = {
  1: { name: "Descenso", action: "Sentir", copy: "Escuchar el cuerpo antes de buscar respuestas." },
  2: { name: "Impulso", action: "Encender", copy: "Reconocer la energía que pide movimiento y expresión." },
  3: { name: "Expansión", action: "Crear", copy: "Dar forma, voz y dirección a lo que está naciendo." },
  4: { name: "Integración", action: "Enraizar", copy: "Cerrar la vuelta con presencia y memoria." },
};

const MOODS: Record<Mood, { accent: string; landscape: string; rgb: string }> = {
  agua: { accent: "#88e6ef", landscape: "/agua-ui.webp", rgb: "136, 230, 239" },
  tierra: { accent: "#e6c07a", landscape: "/tierra-ui.webp", rgb: "230, 192, 122" },
  fuego: { accent: "#ffb27a", landscape: "/fuego-ui.webp", rgb: "255, 178, 122" },
  aire: { accent: "#c6c2e8", landscape: "/cielo-ui.webp", rgb: "198, 194, 232" },
};
function moodOf(element: string): Mood {
  const value = element.trim().toLowerCase();
  return value === "agua" || value === "tierra" || value === "fuego" ? value : "aire";
}

const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;

function AudioPlayer({ src, title }: { src: string; title: string }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [failed, setFailed] = useState(false);
  const toggle = () => {
    const node = audio.current;
    if (!node) return;
    if (node.paused) node.play().catch(() => setFailed(true));
    else node.pause();
  };
  return (
    <div className={styles.player} data-playing={playing}>
      <audio ref={audio} src={src} preload="metadata"
        onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)}
        onTimeUpdate={event => setTime(event.currentTarget.currentTime)}
        onLoadedMetadata={event => setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)}
        onError={() => setFailed(true)} />
      <button type="button" className={styles.playButton} onClick={toggle} aria-label={playing ? `Pausar el audio de ${title}` : `Escuchar el audio de ${title}`}>
        {playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
      </button>
      <div className={styles.playerBody}>
        <p><AudioLines aria-hidden="true" /> {playing ? "Sonando ahora" : "Audio del arquetipo"}</p>
        <input type="range" min={0} max={duration || 1} step={0.1} value={Math.min(time, duration || 1)} disabled={!duration}
          aria-label="Posición del audio" aria-valuetext={`${clock(time)} de ${clock(duration)}`}
          style={{ "--progress": `${duration ? (time / duration) * 100 : 0}%` } as CSSProperties}
          onChange={event => { const value = Number(event.target.value); if (audio.current) audio.current.currentTime = value; setTime(value); }} />
        <span>{clock(time)} / {duration ? clock(duration) : "–:––"}</span>
      </div>
      {failed && <p className={styles.playerError} role="alert">No se pudo reproducir el audio. <a href={src} target="_blank" rel="noopener noreferrer">Abrirlo en otra pestaña</a></p>}
    </div>
  );
}

type Props = {
  days: ArquetipoDia[];
  /** dia_ciclo del arquetipo abierto. */
  day: number;
  /** Día del ciclo de la usuaria, si se conoce. */
  today?: number | null;
  onChange: (day: number) => void;
  onClose: () => void;
};

export default function ArchetypeImmersion({ days, day, today, onChange, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const still = Boolean(reduceMotion);
  const [ritualOpen, setRitualOpen] = useState(false);
  const index = Math.max(0, days.findIndex(item => item.dia_ciclo === day));
  const current = days[index];
  const mood = MOODS[moodOf(current.elemento)];
  const week = WEEK_META[current.semana];

  const go = useCallback((offset: number) => {
    const next = days[(index + offset + days.length) % days.length];
    setRitualOpen(false);
    onChange(next.dia_ciclo);
  }, [days, index, onChange]);

  useEffect(() => {
    const node = dialog.current;
    if (node && !node.open) node.showModal();
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      // Las flechas dentro del deslizador de audio mueven el audio, no el día.
      if ((event.target as HTMLElement | null)?.tagName === "INPUT") return;
      if (event.key === "ArrowRight") go(1);
      if (event.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  // La imagen acompaña suavemente al puntero.
  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (still || event.pointerType !== "mouse" || !stage.current) return;
    const rect = stage.current.getBoundingClientRect();
    stage.current.style.setProperty("--px", String((event.clientX - rect.left) / rect.width - 0.5));
    stage.current.style.setProperty("--py", String((event.clientY - rect.top) / rect.height - 0.5));
  }

  return (
    <dialog ref={dialog} className={styles.dialog} aria-labelledby="immersion-title"
      style={{ "--accent": mood.accent, "--accent-rgb": mood.rgb } as CSSProperties}
      onCancel={event => { event.preventDefault(); onClose(); }} onClose={onClose}>
      <AnimatePresence initial={false}>
        <motion.div key={mood.landscape} className={styles.landscape} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={enter(still ? 0 : DURATION.reveal)} aria-hidden="true">
          <Image src={mood.landscape} alt="" fill sizes="100vw" priority />
        </motion.div>
      </AnimatePresence>
      <div className={styles.shade} aria-hidden="true" />
      <ElementAtmosphere mood={moodOf(current.elemento)} still={still} className={styles.atmosphere} />

      <header className={styles.topbar}>
        <p>Atlas cíclico <span>·</span> Umbral 0{current.semana} {week?.name}</p>
        <button type="button" className={styles.close} onClick={onClose}><X aria-hidden="true" /> Volver al atlas</button>
      </header>

      <div className={styles.scene}>
        <div className={styles.stage} ref={stage} onPointerMove={onPointerMove}>
          <span className={styles.bigNumber} aria-hidden="true">{String(current.dia_ciclo).padStart(2, "0")}</span>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={current.id} className={styles.portrait}
              initial={still ? false : { opacity: 0, scale: 0.94, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: still ? 1 : 1.03 }}
              transition={enter(still ? 0 : DURATION.slow)}>
              <div className={styles.halo} aria-hidden="true" />
              {current.imagen_url
                ? <Image src={current.imagen_url} alt={`Arquetipo ${current.arquetipo}`} fill sizes="(max-width: 900px) 90vw, 48vw" priority />
                : <div className={styles.portraitEmpty} role="img" aria-label={`Arquetipo ${current.arquetipo}: imagen no disponible`}><Sparkles aria-hidden="true" /></div>}
            </motion.div>
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.article key={current.id} className={styles.panel}
            initial={still ? false : { opacity: 0, x: 26 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: still ? 0 : -14 }}
            transition={enter(still ? 0 : DURATION.slow)}>
            <p className={styles.eyebrow}>
              Día {current.dia_ciclo} de 28 <span>·</span> {current.elemento === "Cielo" ? "Aire · Cielo" : current.elemento}
              {today === current.dia_ciclo && <em>Tu día de hoy</em>}
            </p>
            <h2 id="immersion-title">{current.arquetipo}</h2>
            {week && <p className={styles.intent}><strong>{week.action}.</strong> {week.copy}</p>}
            <p className={styles.description}>{current.descripcion}</p>
            {current.tip_extra && <p className={styles.tip}><Sparkles aria-hidden="true" /><span>{current.tip_extra}</span></p>}

            {current.audio_url && <AudioPlayer key={current.audio_url} src={current.audio_url} title={current.arquetipo} />}

            {current.ritual_pdf && (
              <section className={styles.ritual} aria-label="Ritual del día">
                <div className={styles.ritualActions}>
                  <button type="button" aria-expanded={ritualOpen} aria-controls="immersion-ritual" onClick={() => setRitualOpen(open => !open)}>
                    <BookOpen aria-hidden="true" /> {ritualOpen ? "Cerrar el ritual" : "Leer el ritual aquí"}
                  </button>
                  <a href={current.ritual_pdf} target="_blank" rel="noopener noreferrer">Abrir PDF <ArrowUpRight aria-hidden="true" /></a>
                </div>
                <div id="immersion-ritual" hidden={!ritualOpen}>
                  {ritualOpen && <iframe src={current.ritual_pdf} title={`Ritual de ${current.arquetipo}`} />}
                </div>
              </section>
            )}
          </motion.article>
        </AnimatePresence>
      </div>

      <footer className={styles.rail}>
        <button type="button" className={styles.step} onClick={() => go(-1)} aria-label="Día anterior"><ArrowLeft aria-hidden="true" /></button>
        <div className={styles.days} role="group" aria-label="Días del ciclo">
          {days.map(item => (
            <button key={item.id} type="button" aria-label={`Día ${item.dia_ciclo}: ${item.arquetipo}${item.dia_ciclo === today ? " (hoy)" : ""}`}
              aria-current={item.dia_ciclo === current.dia_ciclo ? "true" : undefined} data-today={item.dia_ciclo === today}
              onClick={() => { setRitualOpen(false); onChange(item.dia_ciclo); }}>
              <i />
            </button>
          ))}
        </div>
        <button type="button" className={styles.step} onClick={() => go(1)} aria-label="Día siguiente"><ArrowRight aria-hidden="true" /></button>
      </footer>
    </dialog>
  );
}
