import Link from "next/link";
import type { CSSProperties } from "react";
import { cicloEnFecha, type FaseCiclo } from "@/lib/cicloUtils";
import styles from "./RitmoPorFase.module.css";

type Entry = { id: string; fecha: string; energia?: number | null; creatividad?: number | null; espiritualidad?: number | null };
type MetricKey = "energia" | "creatividad" | "espiritualidad";

// "corta" se muestra en pantallas estrechas; el nombre completo sigue disponible para lectores de pantalla.
const FASES: ReadonlyArray<{ fase: FaseCiclo; corta: string; dias: string }> = [
  { fase: "Menstrual", corta: "Mens.", dias: "Días 1–7" },
  { fase: "Folicular", corta: "Folic.", dias: "Días 8–14" },
  { fase: "Ovulatoria", corta: "Ovul.", dias: "Días 15–21" },
  { fase: "Lútea", corta: "Lútea", dias: "Días 22–28" },
];
const METRICS: ReadonlyArray<{ key: MetricKey; label: string }> = [
  { key: "energia", label: "Energía" },
  { key: "creatividad", label: "Creatividad" },
  { key: "espiritualidad", label: "Espiritualidad" },
];
// Una media solo cuenta para conclusiones con al menos 2 registros en la fase,
// y solo se nombra una diferencia de 1 punto o más (en una escala de 1 a 5).
const MIN_POR_FASE = 2;
const DIFERENCIA_MINIMA = 1;

const valid = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value) && value >= 1 && value <= 5;
const format = (value: number) => value.toLocaleString("es-ES", { maximumFractionDigits: 1 });
const conArticulo = (fase: FaseCiclo) => `la fase ${fase.toLowerCase()}`;

export default function RitmoPorFase({ registros, periodo, fechaInicio }: { registros: Entry[]; periodo: string; fechaInicio: string | null }) {
  if (!fechaInicio) {
    return (
      <section className={styles.section} aria-labelledby="ritmo-title">
        <p className={styles.eyebrow}>Tu ritmo, fase a fase</p>
        <h2 id="ritmo-title">Cómo cambias en cada fase</h2>
        <p className={styles.note}>
          Configura la fecha de inicio de tu ciclo para ver cómo se mueven tu energía, tu creatividad y tu espiritualidad en cada fase.
        </p>
        <Link href="/setup" className={styles.link}>Configurar mi ciclo</Link>
      </section>
    );
  }

  const conFase = registros.flatMap((registro) => {
    const ciclo = cicloEnFecha(fechaInicio, registro.fecha);
    return ciclo ? [{ ...registro, fase: ciclo.fase }] : [];
  });
  const fueraDelCiclo = registros.length - conFase.length;

  // Media y número de registros por métrica y fase.
  const tabla = METRICS.map(({ key, label }) => ({
    key,
    label,
    fases: FASES.map(({ fase }) => {
      const valores = conFase.filter((registro) => registro.fase === fase).map((registro) => registro[key]).filter(valid);
      return { fase, n: valores.length, media: valores.length ? valores.reduce((a, b) => a + b, 0) / valores.length : null };
    }),
  }));
  const registrosPorFase = FASES.map(({ fase }) => conFase.filter((registro) => registro.fase === fase).length);
  const fasesConMuestra = registrosPorFase.filter((n) => n >= MIN_POR_FASE).length;

  const hallazgos = tabla.flatMap(({ label, fases }) => {
    const fiables = fases.filter((celda) => celda.n >= MIN_POR_FASE && celda.media !== null) as Array<{ fase: FaseCiclo; n: number; media: number }>;
    if (fiables.length < 2) return [];
    const alta = fiables.reduce((a, b) => (b.media > a.media ? b : a));
    const baja = fiables.reduce((a, b) => (b.media < a.media ? b : a));
    if (alta.media - baja.media < DIFERENCIA_MINIMA) return [];
    return [`Tu ${label.toLowerCase()} tiende a ser más alta en ${conArticulo(alta.fase)} (${format(alta.media)}) y más baja en ${conArticulo(baja.fase)} (${format(baja.media)}).`];
  });

  const hoy = cicloEnFecha(fechaInicio, new Date().toISOString().slice(0, 10));

  return (
    <section className={styles.section} aria-labelledby="ritmo-title">
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Tu ritmo, fase a fase</p>
          <h2 id="ritmo-title">Cómo cambias en cada fase</h2>
        </div>
        <p className={styles.period}>{periodo === "todos" ? "Todos los meses" : periodo} · {conFase.length} {conFase.length === 1 ? "registro" : "registros"} con fase</p>
      </header>

      <div className={styles.insight} role="status">
        {hallazgos.length ? (
          <ul>{hallazgos.map((texto) => <li key={texto}>{texto}</li>)}</ul>
        ) : fasesConMuestra < 2 ? (
          <p>
            Tu patrón aparecerá cuando tengas al menos {MIN_POR_FASE} registros en dos fases distintas
            {" "}(ahora: {fasesConMuestra} de 2).
            {hoy ? <> Hoy estás en {conArticulo(hoy.fase)}: registrar cómo estás suma a esa fase.</> : null}
          </p>
        ) : (
          <p>Tus niveles se mantienen estables entre fases: ninguna diferencia llega a {DIFERENCIA_MINIMA} punto.</p>
        )}
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <caption className="sr-only">Media de cada nivel (de 1 a 5) por fase del ciclo y número de registros en cada fase</caption>
          <thead>
            <tr>
              <td />
              {FASES.map(({ fase, corta, dias }, index) => (
                <th key={fase} scope="col">
                  <span className={styles.phase}><span className={styles.full}>{fase}</span><span className={styles.short} aria-hidden="true">{corta}</span></span>
                  <span className={`${styles.phaseMeta} ${styles.days}`}>{dias}</span>
                  <span className={styles.phaseMeta}><span className={styles.full}>{registrosPorFase[index]} {registrosPorFase[index] === 1 ? "registro" : "registros"}</span><span className={styles.short} aria-hidden="true">{registrosPorFase[index]} reg.</span></span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tabla.map(({ key, label, fases }) => (
              <tr key={key}>
                <th scope="row">{label}</th>
                {fases.map(({ fase, n, media }) => (
                  <td
                    key={fase}
                    data-scarce={n > 0 && n < MIN_POR_FASE ? "" : undefined}
                    title={media === null ? `${label}, fase ${fase.toLowerCase()}: sin registros` : `${label}, fase ${fase.toLowerCase()}: media ${format(media)} de 5 en ${n} ${n === 1 ? "registro" : "registros"}`}
                  >
                    {media === null ? (
                      <span className={styles.empty}>—<span className="sr-only"> sin registros</span></span>
                    ) : (
                      <>
                        <span className={styles.value}>{format(media)}</span>
                        <span className={styles.track} aria-hidden="true">
                          <span className={styles.fill} style={{ "--level": `${(media / 5) * 100}%` } as CSSProperties} />
                        </span>
                      </>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className={styles.note}>
        Media de 1 a 5. Las fases con un solo registro aparecen atenuadas: todavía no son una tendencia.
        {" "}Calculado con tu fecha de inicio actual
        {fueraDelCiclo > 0 ? `; ${fueraDelCiclo} ${fueraDelCiclo === 1 ? "registro anterior" : "registros anteriores"} a esa fecha no ${fueraDelCiclo === 1 ? "entra" : "entran"} en este mapa.` : "."}
      </p>
    </section>
  );
}
