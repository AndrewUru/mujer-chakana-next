"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { MoreHorizontal, Sparkles, Trash2 } from "lucide-react";
import { cicloEnFecha, DIAS_CICLO } from "@/lib/cicloUtils";
import styles from "./RegistrosDiario.module.css";

export interface RegistroDiario {
  id: string;
  fecha: string;
  emociones?: string;
  energia?: number;
  creatividad?: number;
  espiritualidad?: number;
  notas?: string;
  mensaje?: string;
}

export type DiaArquetipo = { arquetipo: string; elemento: string };

const ELEMENT_COLORS: Record<string, string> = {
  agua: "#88e6ef", fuego: "#ffc37a", tierra: "#e6c07a", aire: "#ffe0b0", cielo: "#ffe0b0",
};
const elementColor = (elemento?: string) =>
  ELEMENT_COLORS[(elemento ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim()] ?? "#eab1c8";

const DIA_MS = 86_400_000;
const fechaCorta = (time: number) =>
  new Date(time).toLocaleDateString("es-ES", { day: "numeric", month: "short", timeZone: "UTC" });

interface Grupo {
  key: string;
  titulo: string;
  detalle: string;
  registros: RegistroDiario[];
}

/** Agrupa por vuelta del ciclo (o por mes si no hay fecha de inicio), conservando el orden. */
function agrupar(registros: RegistroDiario[], fechaInicio: string | null): Grupo[] {
  const grupos: Grupo[] = [];
  for (const registro of registros) {
    const ciclo = fechaInicio ? cicloEnFecha(fechaInicio, registro.fecha) : null;
    let key: string;
    let titulo: string;
    let detalle: string;
    if (ciclo && fechaInicio) {
      const desde = Date.parse(fechaInicio.slice(0, 10)) + (ciclo.vuelta - 1) * DIAS_CICLO * DIA_MS;
      key = `vuelta-${ciclo.vuelta}`;
      titulo = `Vuelta ${ciclo.vuelta}`;
      detalle = `${fechaCorta(desde)} – ${fechaCorta(desde + (DIAS_CICLO - 1) * DIA_MS)}`;
    } else if (fechaInicio) {
      key = "antes";
      titulo = "Antes de tu ciclo actual";
      detalle = "Registros anteriores a tu fecha de inicio";
    } else {
      key = registro.fecha.slice(0, 7);
      titulo = new Date(registro.fecha).toLocaleDateString("es-ES", { month: "long", year: "numeric", timeZone: "UTC" });
      detalle = "";
    }
    const last = grupos[grupos.length - 1];
    if (last?.key === key) last.registros.push(registro);
    else grupos.push({ key, titulo, detalle, registros: [registro] });
  }
  return grupos;
}

export default function RegistrosDiario({ registros, fechaInicio, arquetipos, onDelete }: {
  registros: RegistroDiario[];
  fechaInicio: string | null;
  arquetipos: Record<number, DiaArquetipo>;
  /** Recibe también el botón del menú, para devolverle el foco si se cancela. */
  onDelete: (id: string, trigger: HTMLButtonElement | null) => void;
}) {
  const [menuAbierto, setMenuAbierto] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // El menú se cierra al pulsar fuera o con Escape.
  useEffect(() => {
    if (!menuAbierto) return;
    const cerrarFuera = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuAbierto(null);
    };
    const cerrarEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      menuRef.current?.querySelector<HTMLButtonElement>("button[aria-haspopup]")?.focus();
      setMenuAbierto(null);
    };
    document.addEventListener("pointerdown", cerrarFuera);
    document.addEventListener("keydown", cerrarEscape);
    return () => {
      document.removeEventListener("pointerdown", cerrarFuera);
      document.removeEventListener("keydown", cerrarEscape);
    };
  }, [menuAbierto]);

  return (
    <div className={styles.diario}>
      {agrupar(registros, fechaInicio).map((grupo) => (
        <section key={grupo.key} className={styles.grupo} aria-labelledby={`grupo-${grupo.key}`}>
          <header className={styles.grupoHeader}>
            <h2 id={`grupo-${grupo.key}`}>{grupo.titulo}</h2>
            <p>{grupo.detalle}{grupo.detalle ? " · " : ""}{grupo.registros.length} {grupo.registros.length === 1 ? "registro" : "registros"}</p>
          </header>

          <ol className={styles.timeline}>
            {grupo.registros.map((registro) => {
              const ciclo = fechaInicio ? cicloEnFecha(fechaInicio, registro.fecha) : null;
              const arquetipo = ciclo ? arquetipos[ciclo.dia] : undefined;
              const fecha = new Date(registro.fecha);
              const fechaLarga = fecha.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
              const metricas: Array<[string, number | undefined]> = [
                ["Energía", registro.energia], ["Creatividad", registro.creatividad], ["Espiritualidad", registro.espiritualidad],
              ];

              return (
                <li key={registro.id} className={styles.entry} style={{ "--element": elementColor(arquetipo?.elemento) } as CSSProperties}>
                  <span className={styles.node} aria-hidden="true" />
                  <article aria-label={`Registro del ${fechaLarga}`}>
                    <header className={styles.entryHeader}>
                      <div>
                        <time dateTime={registro.fecha.slice(0, 10)}>
                          {fecha.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" })}
                        </time>
                        {ciclo ? (
                          <p className={styles.context}>
                            <strong>Día {ciclo.dia}</strong> · {ciclo.fase}
                            {arquetipo ? ` · ${arquetipo.arquetipo.replace(/^\d+\s*/, "")}` : ""}
                          </p>
                        ) : null}
                      </div>

                      <div className={styles.menu} data-menu ref={menuAbierto === registro.id ? menuRef : undefined}>
                        <button
                          type="button"
                          aria-haspopup="menu"
                          aria-expanded={menuAbierto === registro.id}
                          aria-label={`Más opciones para el registro del ${fechaLarga}`}
                          onClick={() => setMenuAbierto((actual) => (actual === registro.id ? null : registro.id))}
                        >
                          <MoreHorizontal size={18} aria-hidden="true" />
                        </button>
                        {menuAbierto === registro.id && (
                          <div role="menu" className={styles.menuList}>
                            <button
                              type="button"
                              role="menuitem"
                              autoFocus
                              onClick={(event) => {
                                const trigger = event.currentTarget.closest("[data-menu]")?.querySelector<HTMLButtonElement>("button[aria-haspopup]") ?? null;
                                setMenuAbierto(null);
                                onDelete(registro.id, trigger);
                              }}
                            >
                              <Trash2 size={15} aria-hidden="true" /> Eliminar registro
                            </button>
                          </div>
                        )}
                      </div>
                    </header>

                    <p className={styles.emotions}>{registro.emociones || "Emociones sin registrar"}</p>

                    <dl className={styles.metrics}>
                      {metricas.map(([label, value]) => (
                        <div key={label}>
                          <dt>{label}</dt>
                          <dd>{value ?? "—"}<span aria-hidden="true">/5</span><span className="sr-only"> de 5</span></dd>
                        </div>
                      ))}
                    </dl>

                    {registro.notas && <blockquote className={styles.notes}>{registro.notas}</blockquote>}

                    {registro.mensaje && (
                      <details className={styles.reflection}>
                        <summary>
                          <span className={styles.reflectionLabel}><Sparkles size={14} aria-hidden="true" /> Reflejo de Samari</span>
                          <span className={styles.preview} aria-hidden="true">{registro.mensaje}</span>
                        </summary>
                        <p>{registro.mensaje}</p>
                      </details>
                    )}
                  </article>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
