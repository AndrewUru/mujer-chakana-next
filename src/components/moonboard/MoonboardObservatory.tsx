"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Pause, Play } from "lucide-react";
import { getLunarImageForDate } from "@/lib/lunarImages";
import styles from "./observatory.module.css";

const Scene = dynamic(() => import("./MoonboardScene"), { ssr: false });
const WEEKS = [
  { name: "Descenso", verb: "Escuchar", line: "Hay un lugar para bajar el ruido.", color: "#c6c2e8" },
  { name: "Impulso", verb: "Despertar", line: "Acércate a lo que empieza a moverse.", color: "#c7dacb" },
  { name: "Expansión", verb: "Expresar", line: "Dale espacio a tu manera de estar.", color: "#e6cda3" },
  { name: "Integración", verb: "Volver", line: "Recoge lo vivido. Vuelve a tu centro.", color: "#dfb9ca" },
];
export default function MoonboardObservatory({ currentDay, currentStart, onOpen, motionPaused = false }: { currentDay: number; currentStart: Date; onOpen: (day: number) => void; motionPaused?: boolean }) {
  const [week, setWeek] = useState(Math.floor((currentDay - 1) / 7));
  const [preview, setPreview] = useState(currentDay);
  const [paused, setPaused] = useState(false);
  const [entered, setEntered] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState("");
  const surface = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const still = Boolean(reduce || paused || motionPaused);
  useEffect(() => {
    const node = surface.current; if (!node) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setEntered(true); observer.disconnect(); } }, { rootMargin: "150px" });
    observer.observe(node); return () => observer.disconnect();
  }, []);
  const date = new Date(currentStart); date.setDate(date.getDate() + preview - 1);
  const moon = getLunarImageForDate(date);
  const chapter = WEEKS[week];
  const available = preview <= currentDay;
  async function download() {
    setExporting(true); setExportMessage("");
    try { const { downloadLunarCard } = await import("./downloadLunarCard"); await downloadLunarCard(date); setExportMessage("Postal preparada para descargar. Solo incluye la luna y la fecha, sin datos de tu ciclo."); }
    catch { setExportMessage("No pudimos crear la postal. Vuelve a intentarlo."); }
    finally { setExporting(false); }
  }
  function chooseWeek(index: number) { setWeek(index); setPreview(Math.floor((currentDay - 1) / 7) === index ? currentDay : index * 7 + 1); }
  return <div className={styles.observatory} style={{ "--moon-accent": chapter.color } as CSSProperties} data-still={still}>
    <div className={styles.topline}><span>28 días · 4 umbrales · tu propio ritmo</span><button type="button" aria-label={paused ? "Activar movimiento lunar" : "Pausar movimiento lunar"} aria-pressed={paused} disabled={Boolean(reduce)} onClick={() => setPaused(value => !value)}>{paused ? <Play size={14} /> : <Pause size={14} />}<span>{reduce ? "Sin movimiento" : paused ? "Activar" : "Pausar"}</span></button></div>
    <div className={styles.experience}>
      <div className={styles.editorial}><p className={styles.eyebrow}>Umbral 0{week + 1} / {chapter.name}</p><AnimatePresence mode="wait" initial={false}><motion.div key={week} initial={still ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: still ? 0 : -8 }} transition={{ duration: still ? 0 : .2 }}><h3>{chapter.verb}<em>también es avanzar.</em></h3><p className={styles.chapterLine}>{chapter.line}</p></motion.div></AnimatePresence><div className={styles.reading} aria-live="polite"><span>{date.toLocaleDateString("es-ES", { day: "numeric", month: "long" })} · Día {preview}</span><strong>{moon.name}</strong><p>{available ? "Elige una luna y abre su lectura." : "Este día se abrirá cuando llegue su momento."}</p></div><button type="button" className={styles.enter} disabled={!available} onClick={() => onOpen(preview)}>{available ? "Entrar en esta luna" : "Todavía por vivir"}<ArrowUpRight size={16} aria-hidden="true" /></button><button className={styles.backToday} type="button" onClick={() => { chooseWeek(Math.floor((currentDay - 1) / 7)); }}>Volver a hoy · Día {currentDay}</button></div>
      <div className={styles.surface} ref={surface}>
        {entered && reduce === false && <Scene week={week} paused={still} />}
        <div className={styles.staticOrbit} aria-hidden="true" />
        <button type="button" className={styles.centralMoon} disabled={!available} onClick={() => onOpen(preview)} aria-label={`Abrir ${moon.name}, día ${preview}`} aria-haspopup="dialog"><AnimatePresence mode="wait" initial={false}><motion.span key={moon.src} initial={still ? false : { opacity: 0, scale: .92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: still ? 1 : 1.05 }} transition={{ duration: still ? 0 : .24 }}><Image src={moon.src} alt="" width={240} height={240} sizes="(max-width: 600px) 130px, 200px" /></motion.span></AnimatePresence><small>{preview === currentDay ? "ESTÁS AQUÍ" : `DÍA ${String(preview).padStart(2, "0")}`}</small></button>
        <div className={styles.satellites} role="group" aria-label={`Días de ${chapter.name}`}>
          {Array.from({ length: 7 }, (_, index) => {
            const day = week * 7 + index + 1; const angle = index / 7 * Math.PI * 2 - Math.PI / 2;
            return <button key={index} type="button" className={styles.satellite} style={{ left: `${50 + Math.cos(angle) * 40}%`, top: `${50 + Math.sin(angle) * 40}%` }} aria-label={`Seleccionar día ${day}${day === currentDay ? ", hoy" : day > currentDay ? ", próximo" : ""}`} aria-pressed={day === preview} aria-current={day === currentDay ? "date" : undefined} onClick={() => setPreview(day)} data-future={day > currentDay}><span>{String(day).padStart(2, "0")}</span><i aria-hidden="true" /></button>;
          })}
        </div>
        <p className={styles.orbitCaption}>Una luna. Una pausa. Una puerta.</p>
      </div>
    </div>
    <div className={styles.chapters} role="group" aria-label="Explorar las cuatro etapas">{WEEKS.map((item, index) => <button key={item.name} type="button" aria-pressed={week === index} onClick={() => chooseWeek(index)}><span>0{index + 1}</span><strong>{item.name}</strong><small>{index * 7 + 1}–{index * 7 + 7}</small><i /></button>)}</div>
    <div className={styles.share}><div><strong>Llévate un poco de este cielo.</strong><p>Una postal con la luna y la fecha. Sin tu diario ni datos personales.</p></div><button type="button" disabled={exporting || !available} onClick={() => void download()}>{exporting ? "Preparando…" : "Guardar postal lunar"}<ArrowUpRight size={15} aria-hidden="true" /></button></div>
    {exportMessage && <p className={styles.exportMessage} role="status">{exportMessage}</p>}
  </div>;
}
