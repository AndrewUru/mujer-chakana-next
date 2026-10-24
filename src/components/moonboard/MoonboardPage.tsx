"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Moonboard from "@/components/Moonboard";
import JourneyLink from "@/components/JourneyLink";
import { supabase } from "@/lib/supabaseClient";
import styles from "./moonboard-page.module.css";

export default function MoonboardPage() {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const router = useRouter();
  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true); setError("");
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (!user) { router.replace("/auth/login"); return; }
        if (authError) throw authError;
        const { data, error: profileError } = await supabase.from("perfiles").select("fecha_inicio").eq("user_id", user.id).maybeSingle();
        if (profileError) throw profileError;
        if (active) {
          const date = data?.fecha_inicio ? new Date(`${data.fecha_inicio.slice(0, 10)}T00:00:00`) : null;
          setStartDate(date && Number.isFinite(date.getTime()) ? date : null);
        }
      } catch { if (active) setError("No pudimos abrir tu mapa. Vuelve a intentarlo."); }
      finally { if (active) setLoading(false); }
    }
    void load(); return () => { active = false; };
  }, [router, attempt]);
  return <main className={styles.page}><div className={styles.container}><nav className={styles.navigation} aria-label="Recorrido lunar"><JourneyLink href="/dashboard" label="Mi espacio">← Mi espacio</JourneyLink><JourneyLink href="/dashboard#journey-registro" label="Mi registro">Dejar una huella ↗</JourneyLink></nav><header className={styles.heading}><p>Ginergética · Observatorio personal</p><h1>Tu tiempo.<br /><em>Tu constelación.</em></h1><span>No tienes que llegar a ningún lugar.<br />Empieza por estar aquí.</span></header>{loading ? <p className={styles.status} role="status">Preparando tu cielo lunar…</p> : error ? <div className={styles.status} role="alert"><p>{error}</p><button onClick={() => setAttempt(value => value + 1)}>Reintentar</button></div> : <Moonboard startDate={startDate} immersive standalone />}<footer className={styles.footer}><p>Las cuatro etapas son un recorrido simbólico de 28 días. Las fases lunares se calculan por fecha.</p><JourneyLink href="/registros" label="Mi diario">Volver a lo que has vivido ↗</JourneyLink></footer></div></main>;
}
