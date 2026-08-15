"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, ArrowDown, ArrowUpRight, AudioLines, FileText, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import styles from "./ciclo.module.css";

interface MujerChakanaData {
  id: number;
  dia_ciclo: number;
  semana: number;
  arquetipo: string;
  descripcion: string;
  imagen_url?: string;
  elemento: string;
  audio_url?: string;
  ritual_pdf?: string;
  tip_extra?: string;
}

const WEEK_META: Record<number, { name: string; action: string; copy: string }> = {
  1: { name: "Descenso", action: "Sentir", copy: "Escuchar el cuerpo antes de buscar respuestas." },
  2: { name: "Impulso", action: "Encender", copy: "Reconocer la energía que pide movimiento y expresión." },
  3: { name: "Expansión", action: "Crear", copy: "Dar forma, voz y dirección a lo que está naciendo." },
  4: { name: "Integración", action: "Enraizar", copy: "Cerrar la vuelta con presencia y memoria." },
};

export default function CicloPage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [ciclo, setCiclo] = useState<MujerChakanaData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadAtlas() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.replace("/auth/login");

      const { data: perfil, error: perfilError } = await supabase
        .from("perfiles").select("suscripcion_activa")
        .eq("user_id", session.user.id).maybeSingle();
      if (perfilError || !perfil?.suscripcion_activa) return router.replace("/suscripcion");

      const { data, error } = await supabase.from("mujer_chakana")
        .select("id, dia_ciclo, semana, arquetipo, descripcion, imagen_url, elemento, audio_url, ritual_pdf, tip_extra")
        .order("dia_ciclo", { ascending: true });
      if (error) console.error("Error al cargar el ciclo:", error.message);
      if (active) { setCiclo(data ?? []); setLoading(false); }
    }
    void loadAtlas();
    return () => { active = false; };
  }, [router]);

  const sections = useMemo(() => {
    const grouped = ciclo.reduce<Record<number, MujerChakanaData[]>>((result, item) => {
      (result[item.semana] ??= []).push(item);
      return result;
    }, {});
    return Object.entries(grouped).sort(([a], [b]) => Number(a) - Number(b));
  }, [ciclo]);

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
          <Link href="/dashboard">Mujer Chakana · Observatorio</Link><span>Archivo vivo / 01—28</span>
        </div>
        <div className={styles.heroGrid}>
          <motion.div className={styles.heroCopy} initial={reduceMotion ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7 }}>
            <p>Atlas cíclico</p><h1>Veintiocho voces.<em>Una sola vuelta.</em></h1>
            <div className={styles.heroIntro}><span>01</span><p>No vienes a elegir un arquetipo. Vienes a reconocer cuál de ellos ya está hablando en ti.</p></div>
          </motion.div>
          <motion.div className={styles.orbit} initial={reduceMotion ? false : { opacity: 0, scale: .82 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .9, delay: .15 }} aria-hidden="true">
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
            <motion.section id={`semana-${week}`} key={week} className={styles.chapter} initial={reduceMotion ? false : { opacity: 0, y: 35 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: .65 }}>
              <div className={styles.chapterHeading}>
                <span className={styles.chapterNumber}>0{week}</span>
                <div><p>Umbral {week} · {elements.join(" / ")}</p><h2>{meta.name}</h2></div>
                <div className={styles.chapterIntent}><strong>{meta.action}</strong><span>{meta.copy}</span></div>
              </div>
              <div className={styles.cardGrid}>
                {items.map((day, index) => (
                  <article key={day.id} className={`${styles.card} ${index === 0 && sectionIndex % 2 === 0 ? styles.cardFeatured : ""}`}>
                    <div className={styles.cardVisual}>
                      {day.imagen_url ? <Image src={day.imagen_url} alt="" fill sizes="(max-width: 720px) 88vw, (max-width: 1100px) 45vw, 28vw" className={styles.cardImage} /> : <div className={styles.imageFallback}><Sparkles /></div>}
                      <div className={styles.cardVeil} /><span className={styles.dayIndex}>{String(day.dia_ciclo).padStart(2, "0")}</span>
                      <span className={styles.element}>{day.elemento === "Cielo" ? "Aire · Cielo" : day.elemento}</span>
                    </div>
                    <div className={styles.cardBody}>
                      <p>Día {day.dia_ciclo} · Semana {day.semana}</p><h3>{day.arquetipo}</h3><div className={styles.divider} />
                      <p className={styles.description}>{day.descripcion}</p>
                      {day.tip_extra && <p className={styles.tip}><Sparkles aria-hidden="true" />{day.tip_extra}</p>}
                      {(day.audio_url || day.ritual_pdf) && <div className={styles.resources}>
                        {day.audio_url && <a href={day.audio_url} target="_blank" rel="noopener noreferrer"><AudioLines /> Escuchar <ArrowUpRight /></a>}
                        {day.ritual_pdf && <a href={day.ritual_pdf} target="_blank" rel="noopener noreferrer"><FileText /> Ritual <ArrowUpRight /></a>}
                      </div>}
                    </div>
                  </article>
                ))}
              </div>
            </motion.section>
          );
        })}
      </div>

      <footer className={styles.footer}><span>Fin del atlas / Inicio de otra vuelta</span><h2>La observación continúa en ti.</h2><Link href="/dashboard">Volver a mi día <ArrowUpRight /></Link></footer>
    </main>
  );
}
