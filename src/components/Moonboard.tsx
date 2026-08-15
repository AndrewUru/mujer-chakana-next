"use client";

import { useMemo, useState, type MouseEvent } from "react";
import { CalendarRange, Clock, Lock, Moon, Sparkles } from "lucide-react";
import LunarModal from "./LunarModal";
import styles from "./Moonboard.module.css";

const TOTAL_DAYS = 28;
const DAY_MS = 86_400_000;
const WEEK_NAMES = ["Descenso", "Impulso", "Expansión", "Integración"];

interface MoonboardProps { startDate: Date | null; }

export default function Moonboard({ startDate }: MoonboardProps) {
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

  function handleDay(event: MouseEvent<HTMLButtonElement>, day: number) {
    event.preventDefault();
    if (selectedDay === day) {
      setSelectedDay(null);
      window.setTimeout(() => setSelectedDay(day), 40);
    } else setSelectedDay(day);
  }

  const selectedDate = useMemo(() => {
    if (!cycle || selectedDay === null) return null;
    const date = new Date(cycle.currentStart);
    date.setDate(date.getDate() + selectedDay - 1);
    return date;
  }, [cycle, selectedDay]);

  return (
    <>
      <section className={styles.board} aria-labelledby="moonboard-title">
        <header className={styles.header}>
          <div className={styles.copy}>
            <span><Moon aria-hidden="true" /> Cartografía lunar</span>
            <h2 id="moonboard-title">Tu vuelta, vista como una constelación.</h2>
            <p>Cada punto guarda un día. Abre los que ya viviste y observa la fase lunar que acompañó ese momento.</p>
          </div>
          <div className={styles.current}>
            <span>Ahora</span><strong>{cycle ? String(cycle.currentDay).padStart(2, "0") : "—"}</strong><small>de 28 días</small>
          </div>
        </header>

        {!cycle ? (
          <div className={styles.noDate}>
            <CalendarRange aria-hidden="true" /><div><h3>Tu mapa necesita un punto de partida</h3><p>Configura la fecha de inicio para activar los 28 días de esta vuelta.</p></div>
          </div>
        ) : (
          <div className={styles.map}>
            <div className={styles.mapMeta}>
              <p><CalendarRange /> Inicio de vuelta <strong>{cycle.currentStart.toLocaleDateString("es-ES", { day: "2-digit", month: "long" })}</strong></p>
              <p><Clock /> Recorrido <strong>Vuelta {cycle.completed + 1}</strong></p>
            </div>

            <div className={styles.weekList}>
              {weeks.map((days, weekIndex) => (
                <div className={styles.week} key={WEEK_NAMES[weekIndex]}>
                  <div className={styles.weekLabel}><span>0{weekIndex + 1}</span><strong>{WEEK_NAMES[weekIndex]}</strong></div>
                  <div className={styles.dayPath}>
                    {days.map(({ day, isToday, isPast, isFuture }) => {
                      const available = !isFuture;
                      const label = `Día ${day}${isToday ? ", hoy" : isPast ? ", disponible" : ", próximo"}`;
                      return (
                        <button type="button" key={day} disabled={!available} onClick={(event) => available && handleDay(event, day)} className={`${styles.day} ${isToday ? styles.today : isPast ? styles.past : styles.future}`} aria-label={label} title={label}>
                          <span>{String(day).padStart(2, "0")}</span>
                          <i aria-hidden="true">{isToday ? <Moon /> : isPast ? <Sparkles /> : <Lock />}</i>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.legend} aria-label="Leyenda">
              <span><i className={styles.legendToday} /> Hoy</span><span><i className={styles.legendPast} /> Día vivido</span><span><i className={styles.legendFuture} /> Próximo</span>
            </div>
          </div>
        )}
      </section>

      {selectedDate && <LunarModal fecha={selectedDate} onClose={() => setSelectedDay(null)} />}
    </>
  );
}
