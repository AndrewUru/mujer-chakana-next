import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import LoginForm from "@/components/LoginForm";
import styles from "./login.module.css";

export default function LoginPage() {
  return (
    <main className={styles.gateway}>
      <Image src="/cielo-ui.webp" alt="" fill priority sizes="100vw" className={styles.landscape} />
      <div className={styles.veil} aria-hidden="true" />
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>
          <Image src="/logo_chakana.png" alt="" width={38} height={38} />
          Ginergética
        </Link>
        <Link href="/" className={styles.back}><ArrowLeft size={14} /> Volver al inicio</Link>
      </header>

      <div className={styles.stage}>
        <section className={styles.story} aria-labelledby="arrival-title">
          <p className={styles.eyebrow}><span /> Un espacio para volver a ti</p>
          <h1 id="arrival-title">Tu ritmo.<br />{" "}Tu refugio.<br /><em>Tu regreso.</em></h1>
          <p className={styles.intro}>Hay un lugar donde cada parte de tu ciclo tiene sentido. Tus registros, tus rituales y tu próximo descubrimiento te esperan aquí.</p>
          <div className={styles.moon} aria-hidden="true">
            <div className={styles.orbit} />
            <Image src="/Luna-llena.webp" alt="" width={250} height={250} sizes="(max-width: 760px) 120px, 250px" />
            <span>Todo vuelve a comenzar</span>
          </div>
          <div className={styles.chapters}><span>01 / Observar</span><span>02 / Sentir</span><span>03 / Habitar</span></div>
        </section>

        <section className={styles.panel} aria-labelledby="login-title">
          <div className={styles.panelHeading}>
            <span className={styles.eyebrow}>Tu espacio personal</span>
            <h2 id="login-title">Bienvenida<br />{" "}<em>de vuelta.</em></h2>
            <p>Inicia sesión para continuar tu recorrido.</p>
          </div>
          <LoginForm />
          <p className={styles.note}>¿Es tu primera visita? Revisa tu correo para confirmar tu cuenta antes de entrar.</p>
        </section>
      </div>

      <footer className={styles.footer}>
        <span>Un ciclo a la vez. A tu manera.</span>
        <Link href="/auth/register">Comienza tu recorrido <ArrowUpRight size={15} /></Link>
      </footer>
    </main>
  );
}
