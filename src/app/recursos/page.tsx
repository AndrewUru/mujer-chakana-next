"use client";

import { useEffect, useRef, useState, type ComponentProps } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { motion, useReducedMotion, useScroll } from "framer-motion";
import { ArrowDown, ArrowLeft, ArrowUpRight, BookOpen, Flower2, Pause, Play, RefreshCcw } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import RecursosList from "@/components/RecursosList";
import styles from "./recursos.module.css";

const JourneyScene = dynamic(() => import("@/components/DashboardJourneyScene"), { ssr: false });
type Recurso = ComponentProps<typeof RecursosList>["recursos"][number];

export default function RecursosPage() {
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [isSubscriber, setIsSubscriber] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [paused, setPaused] = useState(false);
  const libraryRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(false);
      try {
        const [resources, subscriber] = await Promise.all([
          supabase.from("recursos").select("*").eq("activo", true).order("creado_en", { ascending: false }),
          (async () => {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (!user) return false;
            if (authError) throw authError;
            const { data, error: profileError } = await supabase.from("perfiles").select("suscripcion_activa").eq("user_id", user.id).maybeSingle();
            if (profileError) throw profileError;
            return Boolean(data?.suscripcion_activa);
          })(),
        ]);
        if (resources.error) throw resources.error;
        if (!cancelled) { setRecursos(resources.data ?? []); setIsSubscriber(subscriber); }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [attempt]);

  const explore = () => {
    libraryRef.current?.focus({ preventScroll: true });
    libraryRef.current?.scrollIntoView({ behavior: reduced ? "instant" : "smooth", block: "start" });
  };

  return <main className={styles.page}>
    <div className={styles.stage} aria-hidden="true">
      <Image src="/tierra-ui.webp" alt="" fill sizes="100vw" priority className={styles.background} />
      <div className={styles.shade} />
      <JourneyScene scene={5} color="#d9bd87" paused={Boolean(paused || reduced)} progress={scrollYProgress} />
    </div>
    <motion.div className={styles.progress} style={{ scaleX: scrollYProgress }} />
    <header className={styles.topbar}>
      <Link href="/dashboard" className={styles.back}><ArrowLeft size={15} aria-hidden="true" /> Mi espacio</Link>
      <span className={styles.brand}><Flower2 size={21} aria-hidden="true" /> Ginergética</span>
      <button type="button" className={styles.motionButton} aria-label={paused ? "Activar movimiento ambiental" : "Pausar movimiento ambiental"} aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? <Play size={15} /> : <Pause size={15} />}</button>
    </header>
    <div className={styles.content}>
      <section className={styles.hero} aria-labelledby="library-title">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: reduced ? 0 : .7 }}>
          <p className={styles.eyebrow}>LA BIBLIOTECA · UN ESPACIO PARA NUTRIRTE</p>
          <h1 id="library-title">Vuelve a ti.<br /><em>De mil maneras.</em></h1>
          <p className={styles.lead}>Una voz que acompaña. Una práctica que abre espacio. Una guía para escuchar lo que necesitas hoy.</p>
          <button type="button" className={styles.explore} onClick={explore}>Explorar la biblioteca <ArrowDown size={17} aria-hidden="true" /></button>
        </motion.div>
        <div className={styles.seal} aria-hidden="true"><div /><div /><BookOpen size={54} strokeWidth={.8} /><span>ESCUCHAR · EXPLORAR · INTEGRAR</span></div>
      </section>
      <section className={styles.collection} ref={libraryRef} tabIndex={-1} aria-labelledby="collection-title">
        <div className={styles.collectionHeading}><div><p className={styles.eyebrow}>A TU RITMO</p><h2 id="collection-title">Encuentra tu próxima pausa.</h2></div><Link href="/manual">Cómo usar tus recursos <ArrowUpRight size={16} aria-hidden="true" /></Link></div>
        {loading ? <div role="status" aria-live="polite"><p className={styles.loadingLabel}>Preparando tu biblioteca…</p><div className={styles.skeletons} aria-hidden="true">{[0, 1, 2].map(index => <div key={index}><span /><i /><i /></div>)}</div></div> : error ? <div className={styles.error} role="alert"><BookOpen size={30} strokeWidth={1} aria-hidden="true" /><h3>Volvamos a intentarlo</h3><p>No pudimos cargar la biblioteca y verificar tu acceso en este momento.</p><button type="button" onClick={() => setAttempt(value => value + 1)}><RefreshCcw size={16} aria-hidden="true" /> Reintentar</button></div> : <RecursosList recursos={recursos} isSubscriber={isSubscriber} />}
      </section>
      <footer className={styles.footer}><span>No hace falta hacerlo todo. Empieza por lo que resuena contigo.</span><Link href="/dashboard">Volver a mi recorrido <ArrowUpRight size={15} aria-hidden="true" /></Link></footer>
    </div>
  </main>;
}
