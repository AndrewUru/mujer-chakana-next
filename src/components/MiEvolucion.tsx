import styles from "./MiEvolucion.module.css";

type Entry = { id: string; fecha: string; energia?: number | null; creatividad?: number | null; espiritualidad?: number | null };
const metrics = [{ key: "energia", label: "Energía" }, { key: "creatividad", label: "Creatividad" }, { key: "espiritualidad", label: "Espiritualidad" }] as const;
const valid = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value) && value >= 1 && value <= 5;
const format = (value: number) => value.toLocaleString("es-ES", { maximumFractionDigits: 1 });

export default function MiEvolucion({ registros, periodo }: { registros: Entry[]; periodo: string }) {
  const ordered = [...registros].filter(entry => Number.isFinite(Date.parse(entry.fecha))).sort((a, b) => Date.parse(a.fecha) - Date.parse(b.fecha));
  return <section className={styles.section} aria-labelledby="evolution-title">
    <header><div><p className={styles.eyebrow}>Tu recorrido, en perspectiva</p><h2 id="evolution-title">Mi evolución</h2></div><p>{periodo === "todos" ? "Todos los meses" : periodo} · {ordered.length} registros</p></header>
    <p className={styles.description}>Observa tus ritmos sin juzgarlos. Cada punto representa un registro; los días sin datos no cuentan como cero.</p>
    {!ordered.length ? <p>Aún no hay datos para este periodo. Tu primer registro dará comienzo a tu evolución.</p> : <div className={styles.grid}>{metrics.map(({ key, label }) => {
      const points = ordered.filter(entry => valid(entry[key]));
      const average = points.length ? points.reduce((sum, entry) => sum + entry[key]!, 0) / points.length : null;
      const start = Date.parse(ordered[0].fecha);
      const span = Date.parse(ordered[ordered.length - 1].fecha) - start;
      const x = (date: string) => span ? 20 + (Date.parse(date) - start) / span * 260 : 150;
      return <article key={key} className={styles.metric}><h3>{label}</h3><p className={styles.average}>{average === null ? "—" : format(average)}<span> / 5 · media</span></p>
        {points.length ? <><svg viewBox="0 0 300 120" role="img" aria-label={`${label}: media ${format(average!)} de 5, ${points.length} registros. Valores detallados debajo.`}>
          {[1, 3, 5].map(value => <g key={value}><line x1="20" x2="280" y1={105 - (value - 1) * 23} y2={105 - (value - 1) * 23} stroke="currentColor" opacity=".15" /><text x="1" y={109 - (value - 1) * 23} fill="currentColor" fontSize="10">{value}</text></g>)}
          {points.map(entry => <circle key={entry.id} cx={x(entry.fecha)} cy={105 - (entry[key]! - 1) * 23} r="4" fill="currentColor"><title>{`${entry.fecha.slice(0, 10)}: ${entry[key]} de 5`}</title></circle>)}
        </svg><div className={styles.dates}><span>{ordered[0].fecha.slice(0, 10)}</span><span>{ordered[ordered.length - 1].fecha.slice(0, 10)}</span></div>
        <details><summary>Ver valores ({points.length})</summary><ul>{points.map(entry => <li key={entry.id}>{entry.fecha.slice(0, 10)}: <strong>{entry[key]} / 5</strong></li>)}</ul></details></> : <p>Sin valores registrados.</p>}
      </article>;
    })}</div>}
  </section>;
}
