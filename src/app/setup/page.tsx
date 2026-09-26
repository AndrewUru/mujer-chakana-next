"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import SetupPerfil from "@/components/SetupPerfil";
import Link from "next/link";
import Image from "next/image";

import { ArrowUpRight, BookOpen, CalendarDays } from "lucide-react";
import styles from "./setup.module.css";

export default function SetupPage() {
  const router = useRouter();

  const [perfil, setPerfil] = useState<{
    tipo_plan: string | null;
    suscripcion_activa: boolean | null;
    fecha_expiracion?: string | null;
    display_name: string;
    avatar_url: string | null;
    email: string;
    fecha_inicio: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserAndPerfil() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/");
        return;
      }

      const { data, error } = await supabase
        .from("perfiles")
        .select(
          "tipo_plan, suscripcion_activa, fecha_expiracion, display_name, avatar_url, email, fecha_inicio"
        )
        .eq("user_id", user.id)
        .single();

      if (!error && data) {
        setPerfil(data);
      } else {
        console.warn("No se encontró perfil o hubo un error", error);
        setPerfil(null);
      }

      setLoading(false);
    }

    fetchUserAndPerfil();
  }, [router]);

  return (
    <main className={styles.page}>
      <Image src="/tierra-ui.webp" alt="" fill priority sizes="100vw" className={styles.backdrop} />
      <div className={styles.veil} aria-hidden="true" />
      <nav className={styles.nav} aria-label="Navegación de perfil">
        <Link href="/dashboard">Mujer Chakana <span>/ Tu espacio</span></Link>
        <Link href="/manual"><BookOpen size={16} /> Guía de uso</Link>
      </nav>
      <div className={styles.layout}>
        <section className={styles.story} aria-labelledby="setup-title">
          <p className={styles.eyebrow}>01 / Un punto de partida</p>
          <h1 id="setup-title">Tu ciclo empieza<br /><em>contigo.</em></h1>
          <p className={styles.intro}>Dale un nombre a este espacio y un comienzo a tu recorrido. Puedes volver aquí cuando necesites ajustar tu perfil.</p>
          {loading ? <p className={styles.loading} role="status">Preparando tu espacio...</p> : perfil ? (
            <div className={styles.summary}>
              <div className={styles.identity}>
                <Image src={perfil.avatar_url || "/Luna-nueva.webp"} alt="" width={64} height={64} />
                <div><span>Tu identidad</span><h2>{perfil.display_name || "Tu nuevo comienzo"}</h2><p>{perfil.email}</p></div>
              </div>
              <div className={styles.detail}><CalendarDays size={19} /><div><span>Inicio de ciclo</span><strong>{perfil.fecha_inicio ? new Date(`${perfil.fecha_inicio.slice(0, 10)}T12:00:00`).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }) : "Por definir"}</strong></div></div>
              <div className={styles.subscription}>
                <div><span>Tu membresía</span><strong>{perfil.suscripcion_activa ? `Plan ${perfil.tipo_plan || "activo"}` : "Acceso gratuito"}</strong></div>
                <Link href={perfil.suscripcion_activa ? "/suscripcion/gestionar" : "/suscripcion"}>{perfil.suscripcion_activa ? "Gestionar plan" : "Explorar planes"}<ArrowUpRight size={16} /></Link>
              </div>
            </div>
          ) : <p className={styles.intro}>Completa tus datos para preparar tu espacio personal.</p>}
          <p className={styles.footnote}>Cada vuelta es distinta. Este es tu punto de partida.</p>
        </section>
        <section className={styles.panel} aria-labelledby="profile-title">
          <p className={styles.eyebrow}>02 / A tu manera</p>
          <h2 id="profile-title">Habita tu <em>espacio.</em></h2>
          <p className={styles.panelIntro}>Tu nombre, tu imagen y el inicio de esta vuelta.</p>
          <SetupPerfil />
        </section>
      </div>
    </main>
  );
}
