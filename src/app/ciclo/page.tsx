"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { DURATION, enter } from "@/lib/motion";
import { AlertTriangle, ArrowDown, ArrowUpRight, AudioLines, FileText, Sparkles } from "lucide-react";
import ArchetypeImmersion, { WEEK_META, type ArquetipoDia } from "./ArchetypeImmersion";
import { supabase } from "@/lib/supabaseClient";
import styles from "./ciclo.module.css";

export default function CicloPage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [ciclo, setCiclo] = useState<ArquetipoDia[]>([]);
  const [loading, setLoading] = useState(true);
  // Día del ciclo de la usuaria (1–28) y arquetipo abierto en la vista inmersiva.
  const [today, setToday] = useState<number | null>(null);
  const [openDay, setOpenDay] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    async function loadAtlas() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.replace("/auth/login");

      const { data: perfil, error: perfilError } = await supabase
        .from("perfiles").select("suscripcion_activa, fecha_inicio")
        .eq("user_id", session.user.id).maybeSingle();
      if (perfilError || !perfil?.suscripcion_activa) return router.replace("/suscripcion");

      const { data, error } = await supabase.from("mujer_chakana")
        .select("id, dia_ciclo, semana, arquetipo, descripcion, imagen_url, elemento, audio_url, ritual_pdf, tip_extra")
        .order("dia_ciclo", { ascending: true });
      if (error) console.error("Error al cargar el ciclo:", error.message);
      const inicio = perfil.fecha_inicio ? new Date(`${String(perfil.fecha_inicio).slice(0, 10)}T00:00:00`) : null;
      const dias = inicio && Number.isFinite(inicio.getTime()) ? Math.floor((Date.now() - inicio.getTime()) / 86400000) : null;
      if (active) { setCiclo(data ?? []); setToday(dias === null ? null : ((dias % 28) + 28) % 28 + 1); setLoading(false); }
    }
    void loadAtlas();
    return () => { active = false; };
  }, [router]);

  const sections = useMemo(() => {
    const grouped = ciclo.reduce<Record<number, ArquetipoDia[]>>((result, item) => {
      (result[item.semana] ??= []).push(item);
      return result;
    }, {});
    return Object.entries(grouped).sort(([a], [b]) => Number(a) - Number(b));
  }, [ciclo]);

  const todayItem = today ? ciclo.find(item => item.dia_ciclo === today) : undefined;

  if (loading) return (
    <main className={styles.loading} role="status" aria-live="polite">
      <div className={styles.loadingOrbit}><Sparkles aria-hidden="true" /></div>
      <p>Abriendo el atlas cíclico</p><span>28 voces · 4 umbrales · una vuelta</span>
    </main>
  );

  if (!ciclo.length) return (
    <main className={styles.empty}>
      <AlertTriangle aria-hidden="true" /><h1>El atlas está en pausa</h1>
      <p>No encontramos arquetipos disponibles en este momento.</p>
      <Link href="/dashboard">Volver al observatorio</Link>
    </main>
  );

  return (
    <main className={styles.atlas}>
      <header className={styles.hero}>
        <div className={styles.heroTexture} aria-hidden="true" />
        <div className={styles.heroTopline}>
          <Link href="/dashboard">Ginergética · Observatorio</Link><span>Archivo vivo / 01—28</span>
        </div>
        <div className={styles.heroGrid}>
          <motion.div className={styles.heroCopy} initial={reduceMotion ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={enter(DURATION.reveal)}>
            <p>Atlas cíclico</p><h1>Veintiocho voces.<em>Una sola vuelta.</em></h1>
            <div className={styles.heroIntro}><span>01</span><p>No vienes a elegir un arquetipo. Vienes a reconocer cuál de ellos ya está hablando en ti.</p></div>
            {todayItem && <button type="button" className={styles.todayCue} onClick={() => setOpenDay(todayItem.dia_ciclo)}><span>Hoy · Día {String(todayItem.dia_ciclo).padStart(2, "0")}</span><strong>{todayItem.arquetipo}</strong><ArrowUpRight aria-hidden="true" /></button>}
          </motion.div>
          <motion.div className={styles.orbit} initial={reduceMotion ? false : { opacity: 0, scale: .82 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...enter(DURATION.reveal), delay: .15 }} aria-hidden="true">
            <div className={styles.orbitRing}>{Array.from({ length: 28 }, (_, index) => <i key={index} style={{ "--index": index } as CSSProperties} />)}</div>
            <strong>28</strong><span>días para volver a ti</span>
          </motion.div>
        </div>
        <a className={styles.scrollCue} href="#semana-1"><ArrowDown aria-hidden="true" /> Comenzar el recorrido</a>
      </header>

      <nav className={styles.chapterNav} aria-label="Capítulos del ciclo">
        {sections.map(([week]) => <a key={week} href={`#semana-${week}`}><span>0{week}</span>{WEEK_META[Number(week)]?.name ?? `Semana ${week}`}</a>)}
      </nav>

      <div className={styles.chapters}>
        {sections.map(([week, items], sectionIndex) => {
          const weekNumber = Number(week);
          const meta = WEEK_META[weekNumber] ?? { name: `Semana ${week}`, action: "Observar", copy: "Escucha el ritmo de esta etapa." };
          const elements = Array.from(new Set(items.map((item) => item.elemento)));
          return (
            <motion.section id={`semana-${week}`} key={week} className={styles.chapter} initial={reduceMotion ? false : { opacity: 0, y: 35 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={enter(DURATION.reveal)}>
              <div className={styles.chapterHeading}>
                <span className={styles.chapterNumber}>0{week}</span>
                <div><p>Umbral {week} · {elements.join(" / ")}</p><h2>{meta.name}</h2></div>
                <div className={styles.chapterIntent}><strong>{meta.action}</strong><span>{meta.copy}</span></div>
              </div>
              <div className={styles.cardGrid}>
                {items.map((day, index) => (
                  <article key={day.id} className={`${styles.card} ${index === 0 && sectionIndex % 2 === 0 ? styles.cardFeatured : ""}`} data-today={day.dia_ciclo === today}>
                    <div className={styles.cardVisual}>
                      {day.imagen_url ? (
                        <Image src={day.imagen_url} alt={`Arquetipo ${day.arquetipo}`} fill sizes="(max-width: 720px) 88vw, (max-width: 1100px) 45vw, 28vw" className={styles.cardImage} style={{ objectFit: "contain" }} />
                      ) : (
                        <div className={styles.imageFallback} role="img" aria-label={`Arquetipo ${day.arquetipo}: imagen no disponible`}>
                          <Sparkles aria-hidden="true" />
                        </div>
                      )}
                      <button type="button" className={styles.cardEnter} tabIndex={-1} aria-hidden="true" onClick={() => setOpenDay(day.dia_ciclo)} />
                      {day.dia_ciclo === today && <span className={styles.todayBadge}>Tu día de hoy</span>}
                      <div className={styles.cardVeil} /><span className={styles.dayIndex}>{String(day.dia_ciclo).padStart(2, "0")}</span>
                      <span className={styles.element}>{day.elemento === "Cielo" ? "Aire · Cielo" : day.elemento}</span>
                    </div>
                    <div className={styles.cardBody}>
                      <p>Día {day.dia_ciclo} · Semana {day.semana}</p><h3>{day.arquetipo}</h3><div className={styles.divider} />
                      <p className={styles.description}>{day.descripcion}</p>
                      {day.tip_extra && <p className={styles.tip}><Sparkles aria-hidden="true" />{day.tip_extra}</p>}
                      <div className={styles.resources}>
                        <button type="button" className={styles.enter} onClick={() => setOpenDay(day.dia_ciclo)} aria-label={`Entrar en ${day.arquetipo}, día ${day.dia_ciclo}`}>Entrar <ArrowUpRight aria-hidden="true" /></button>
                        {day.audio_url && <span className={styles.inside}><AudioLines aria-hidden="true" /> Audio</span>}
                        {day.ritual_pdf && <span className={styles.inside}><FileText aria-hidden="true" /> Ritual</span>}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </motion.section>
          );
        })}
      </div>

      {openDay !== null && <ArchetypeImmersion days={ciclo} day={openDay} today={today} onChange={setOpenDay} onClose={() => setOpenDay(null)} />}

      <footer className={styles.footer}><span>Fin del atlas / Inicio de otra vuelta</span><h2>La observación continúa en ti.</h2><Link href="/dashboard">Volver a mi día <ArrowUpRight /></Link></footer>
    </main>
  );
}
