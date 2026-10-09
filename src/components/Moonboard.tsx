"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, CalendarRange, Lock, Moon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getLunarImageForDate } from "@/lib/lunarImages";
import LunarModal from "./LunarModal";
import styles from "./Moonboard.module.css";

const TOTAL_DAYS = 28;
const DAY_MS = 86_400_000;
const WEEK_NAMES = ["Descenso", "Impulso", "Expansión", "Integración"];

interface MoonboardProps { startDate: Date | null; immersive?: boolean; }

export default function Moonboard({ startDate, immersive = false }: MoonboardProps) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const today = useMemo(() => new Date(), []);

  const cycle = useMemo(() => {
    if (!startDate) return null;
    const normalizedStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const elapsed = Math.floor((normalizedToday.getTime() - normalizedStart.getTime()) / DAY_MS);
    const completed = Math.floor(elapsed / TOTAL_DAYS);
    const currentDay = ((elapsed % TOTAL_DAYS) + TOTAL_DAYS) % TOTAL_DAYS + 1;
    const currentStart = new Date(normalizedStart);
    currentStart.setDate(currentStart.getDate() + completed * TOTAL_DAYS);
    return { currentDay, completed: Math.max(0, completed), currentStart };
  }, [startDate, today]);

  const weeks = useMemo(() => Array.from({ length: 4 }, (_, week) =>
    Array.from({ length: 7 }, (_, index) => {
      const day = week * 7 + index + 1;
      return { day, isToday: day === cycle?.currentDay, isPast: cycle ? day < cycle.currentDay : false, isFuture: cycle ? day > cycle.currentDay : true };
    })
  ), [cycle]);

  function openDay(day: number) {
    if (!cycle || day > cycle.currentDay) return;
    setSelectedDay(day);
  }

  const selectedDate = useMemo(() => {
    if (!cycle || selectedDay === null) return null;
    const date = new Date(cycle.currentStart);
    date.setDate(date.getDate() + selectedDay - 1);
    return date;
  }, [cycle, selectedDay]);

  const todayMoon = getLunarImageForDate(new Date(today.getFullYear(), today.getMonth(), today.getDate()));

  return (
    <>
      <section className={`${styles.board} ${immersive ? styles.immersive : ""}`} aria-labelledby="moonboard-title">
        <header className={styles.header}>
          <div className={styles.copy}>
            <span><Moon size={15} aria-hidden="true" /> Tu mapa lunar</span>
            <h2 id="moonboard-title">Cada luna es una puerta.<br /><em>Abre la tuya.</em></h2>
            <p>Descubre la fase que acompaña cada día y encuentra una pausa para volver a ti.</p>
          </div>
          {cycle && (
            <button
              type="button"
              className={styles.todayCard}
              onClick={() => openDay(cycle.currentDay)}
              aria-label={`Ver mi luna de hoy, día ${cycle.currentDay}, ${todayMoon.name}`}
              aria-haspopup="dialog"
            >
              <span className={styles.todayVisual} aria-hidden="true">
                <Image src={todayMoon.src} alt="" width={120} height={120} sizes="(max-width: 600px) 80px, 100px" />
              </span>
              <span className={styles.todayCopy}>
                <span className={styles.todayEyebrow}>Empieza por hoy · Día {cycle.currentDay}</span>
                <strong>{todayMoon.name}</strong>
                <span className={styles.todayAction}>Ver mi luna de hoy <ArrowUpRight size={18} aria-hidden="true" /></span>
              </span>
            </button>
          )}
        </header>

        {!cycle ? (
          <div className={styles.noDate}>
            <CalendarRange aria-hidden="true" /><div><h3>Tu mapa necesita un punto de partida</h3><p>Configura la fecha de inicio para activar los 28 días de esta vuelta.</p><Link href="/setup">Configurar mi ciclo <ArrowUpRight size={16} aria-hidden="true" /></Link></div>
          </div>
        ) : (
          <div className={styles.map}>
            <div className={styles.mapMeta}>
              <div><h3>Explora tus días</h3><p>Toca una luna disponible para abrir su lectura.</p></div>
              <span className={styles.cycleMeta}>Vuelta {cycle.completed + 1} · Desde el {cycle.currentStart.toLocaleDateString("es-ES", { day: "numeric", month: "short" })}</span>
            </div>

            <div className={styles.weekList}>
              {weeks.map((days, weekIndex) => (
                <div className={styles.week} key={WEEK_NAMES[weekIndex]}>
                  <div className={styles.weekLabel}><span>0{weekIndex + 1}</span><strong>{WEEK_NAMES[weekIndex]}</strong></div>
                  <div className={styles.dayPath}>
                    {days.map(({ day, isToday, isPast, isFuture }) => {
                      const available = !isFuture;
                      const date = new Date(cycle.currentStart);
                      date.setDate(date.getDate() + day - 1);
                      const lunarImage = getLunarImageForDate(date);
                      const label = `Día ${day}${isToday ? ", hoy" : isPast ? ", disponible" : ", próximo"}`;
                      return (
                        <button type="button" key={day} disabled={!available} onClick={() => openDay(day)} className={`${styles.day} ${isToday ? styles.today : isPast ? styles.past : styles.future}`} aria-label={`${available ? "Abrir " : ""}${label}, ${lunarImage.name}`} aria-haspopup={available ? "dialog" : undefined} aria-current={isToday ? "date" : undefined} title={`${label}, ${lunarImage.name}`}>
                          <span className={styles.dayNumber}>{String(day).padStart(2, "0")}{isToday && <small>Hoy</small>}</span>
                          <Image src={lunarImage.src} alt="" width={64} height={64} className={styles.phaseImage} sizes="64px" />
                          <span className={styles.dayAction} aria-hidden="true">{available ? <>Abrir <ArrowUpRight size={12} /></> : <><Lock size={10} /> Pronto</>}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <p className={styles.mapNote}><Lock size={13} aria-hidden="true" /> Los próximos días se abren a medida que avanzas en tu ciclo.</p>
          </div>
        )}
      </section>

      {selectedDate && <LunarModal fecha={selectedDate} onClose={() => setSelectedDay(null)} />}
    </>
  );
}
