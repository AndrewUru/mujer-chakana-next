import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import styles from "./AccountGateway.module.css";

interface AccountGatewayProps {
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
  formTitle: string;
  children: ReactNode;
}

export default function AccountGateway({ eyebrow, title, accent, description, formTitle, children }: AccountGatewayProps) {
  return (
    <main className={styles.page}>
      <Image src="/cielo-ui.webp" alt="" fill priority sizes="100vw" className={styles.backdrop} />
      <div className={styles.veil} aria-hidden="true" />
      <header className={styles.header}>
        <Link href="/" className={styles.brand}><Image src="/logo_chakana.png" alt="" width={36} height={36} />Mujer Chakana</Link>
        <Link href="/auth/login"><ArrowLeft size={15} /> Iniciar sesión</Link>
      </header>
      <div className={styles.layout}>
        <section className={styles.story}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1>{title}<br /><em>{accent}</em></h1>
          <p className={styles.description}>{description}</p>
          <div className={styles.moon} aria-hidden="true"><Image src="/Luna-creciente.webp" alt="" width={180} height={180} sizes="180px" /><span>Un nuevo comienzo, a tu ritmo.</span></div>
        </section>
        <section className={styles.panel} aria-labelledby="account-form-title">
          <p className={styles.eyebrow}>Tu espacio personal</p>
          <h2 id="account-form-title">{formTitle}</h2>
          {children}
        </section>
      </div>
    </main>
  );
}
