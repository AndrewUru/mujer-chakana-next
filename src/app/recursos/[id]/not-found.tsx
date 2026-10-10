import Link from "next/link";
import styles from "./resource.module.css";

export default function ResourceNotFound() {
  return <main className={styles.page}><div className={styles.shell}><section className={styles.error}>
    <p className={styles.eyebrow}>LA BIBLIOTECA</p><h1>Este recurso no está disponible.</h1>
    <p>Puede que ya no forme parte de la biblioteca. Hay otros caminos por explorar.</p>
    <Link href="/recursos" className={styles.secondary}>Explorar la biblioteca</Link>
  </section></div></main>;
}
