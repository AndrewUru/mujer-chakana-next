"use client";

import Image from "next/image";
import Link from "next/link";
import { Headphones, BookOpen, Sparkles, ArrowLeft } from "lucide-react";
import styles from "./suscripcion.module.css";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import PayPalSubscriptionButton from "@/components/PayPalSubscriptionButton";
import { PAYPAL_PLANS } from "@/lib/paypalPlans";

export default function SuscripcionPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      setUserId(user.id);

      const { data: perfil } = await supabase
        .from("perfiles")
        .select("tipo_plan, suscripcion_activa")
        .eq("user_id", user.id)
        .single();

      if (perfil?.suscripcion_activa) {
        alert(`Ya tienes una suscripción ${perfil.tipo_plan}.`);
        router.push("/dashboard");
        return;
      }

      setLoading(false);
    };

    fetchUser();
  }, [router]);

  useEffect(() => {
    const loadPayPalScript = () => {
      return new Promise((resolve) => {
        if (document.getElementById("paypal-sdk")) {
          resolve(true);
          return;
        }

        const script = document.createElement("script");
        script.src =
          "https://www.paypal.com/sdk/js?client-id=ASQix2Qu6atiH43_jrk18jeSMDjB_YdTjbfI8jrTJ7x5uagNzUhuNMXacO49ZxJWr_EMpBhrpVPbOvR_&vault=true&intent=subscription";
        script.id = "paypal-sdk";
        script.onload = () => resolve(true);
        document.body.appendChild(script);
      });
    };

    loadPayPalScript().then(() => setSdkReady(true));
  }, []);

  return (
    <main className={styles.page}>
      <Image src="/cielo-ui.webp" alt="" fill priority sizes="100vw" className={styles.backdrop} /><div className={styles.veil} aria-hidden="true" />
      <div className={styles.content}>
        <Link href="/dashboard" className={styles.back}><ArrowLeft size={15} /> Volver a mi espacio</Link>
        <header className={styles.hero}><p className={styles.eyebrow}>Mujer Chakana / Membresía</p><h1>Dale espacio<br /><em>a tu profundidad.</em></h1><p>Rituales, audios y recursos para acompañar cada vuelta. Elige cómo quieres continuar tu recorrido.</p></header>
        <div className={styles.benefits}><span><BookOpen size={20} /> Rituales en PDF</span><span><Headphones size={20} /> Audios diarios exclusivos</span><span><Sparkles size={20} /> Recursos desbloqueados</span></div>
        {loading ? <p className={styles.loading} role="status">Preparando tus opciones...</p> : (
          <div className={styles.plans}>
            <section className={styles.plan} aria-labelledby="monthly-title"><p className={styles.eyebrow}>Un mes a la vez</p><h2 id="monthly-title">A tu ritmo.</h2><p className={styles.price}>2,99 <span>€ / mes</span></p><p className={styles.description}>Una invitación mensual a observar, sentir y conectar contigo.</p><div className={styles.billing}>Suscripción mensual</div>{sdkReady ? <PayPalSubscriptionButton planId={PAYPAL_PLANS.mensual.id} userId={userId} /> : <p className={styles.loading} role="status">Cargando PayPal...</p>}</section>
            <section className={`${styles.plan} ${styles.annual}`} aria-labelledby="annual-title"><span className={styles.badge}>Tu recorrido completo</span><p className={styles.eyebrow}>Un año para ti</p><h2 id="annual-title">Vuelta tras vuelta.</h2><p className={styles.price}>29,99 <span>€ / año</span></p><p className={styles.description}>Un año de acceso para sostener tu práctica y explorar tus ciclos.</p><div className={styles.billing}>Suscripción anual</div>{sdkReady ? <PayPalSubscriptionButton planId={PAYPAL_PLANS.anual.id} userId={userId} /> : <p className={styles.loading} role="status">Cargando PayPal...</p>}</section>
          </div>
        )}
        <p className={styles.note}>Cancela cuando quieras. Pagos procesados con PayPal.</p>
      </div>
    </main>
  );
}
