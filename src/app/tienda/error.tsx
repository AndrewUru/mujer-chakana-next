"use client";
import Link from "next/link";
import styles from "@/components/shop/shop.module.css";
export default function ShopError({ reset }: { reset: () => void }) {
  return <main className={styles.page}><div className={styles.empty}><p className={styles.eyebrow}>Arte de Samari</p><h1>La galería está en pausa.</h1><p>No pudimos cargar las obras. Vuelve a intentarlo en un momento.</p><button className={styles.primary} onClick={reset}>Reintentar</button><p><Link href="/dashboard">Volver a mi espacio</Link></p></div></main>;
}
