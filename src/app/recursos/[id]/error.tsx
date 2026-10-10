"use client";

import Link from "next/link";
import styles from "./resource.module.css";

export default function ResourceError({ reset }: { reset: () => void }) {
  return <main className={styles.page}><div className={styles.shell}><section className={styles.error}>
    <h1>No pudimos preparar tu recurso.</h1><p role="alert">La biblioteca no responde en este momento. Vuelve a intentarlo en unos instantes.</p>
    <div className={styles.errorActions}><button type="button" className={styles.primary} onClick={reset}>Reintentar</button><Link href="/recursos" className={styles.secondary}>Volver a la biblioteca</Link></div>
  </section></div></main>;
}
