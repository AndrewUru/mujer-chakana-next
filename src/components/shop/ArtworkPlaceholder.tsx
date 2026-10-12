import styles from "./shop.module.css";
export default function ArtworkPlaceholder({ name }: { name: string }) {
  return <div className={styles.placeholder} role="img" aria-label={`${name}: imagen pendiente`}><span>Archivo de obra</span><strong>{name}</strong><small>Ilustración por incorporar</small></div>;
}
