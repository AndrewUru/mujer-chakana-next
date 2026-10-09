"use client";

import { Suspense, useId, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { ArrowUpRight, BookOpen, Check, Headphones, Lock, Play, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import styles from "./RecursosList.module.css";

type Tier = "gratuito" | "mensual" | "anual";
type Recurso = {
  id: string;
  tipo: string;
  titulo: string;
  url: string;
  descripcion: string;
  imagen_url?: string;
  fase?: string;
  arquetipo?: string;
  elemento?: string;
  tipo_suscripcion: Tier | Tier[];
};
type Format = "audio" | "pdf" | "video" | "otro";
type Access = "todos" | "disponibles" | "exclusivos";
type Filters = { q: string; formato: Format | "todos"; acceso: Access };
const formats = {
  audio: { label: "Audios", singular: "Audio", action: "Explorar audio", icon: Headphones },
  pdf: { label: "Guías PDF", singular: "Guía PDF", action: "Abrir guía", icon: BookOpen },
  video: { label: "Vídeos", singular: "Vídeo", action: "Explorar vídeo", icon: Play },
  otro: { label: "Otros recursos", singular: "Recurso", action: "Explorar recurso", icon: Sparkles },
};
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
function getFormat(value: string): Format {
  const type = normalize(value);
  return type === "audio" || type === "pdf" || type === "video" ? type : "otro";
}

export default function RecursosList(props: { recursos: Recurso[]; isSubscriber: boolean }) {
  return <Suspense fallback={<p role="status">Preparando tus filtros…</p>}><ResourceLibrary {...props} /></Suspense>;
}

function ResourceLibrary({ recursos, isSubscriber }: { recursos: Recurso[]; isSubscriber: boolean }) {
  const searchId = useId();
  const searchRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const requestedFormat = searchParams.get("formato");
  const format = requestedFormat === "audio" || requestedFormat === "pdf" || requestedFormat === "video" || requestedFormat === "otro" ? requestedFormat : "todos";
  const requestedAccess = searchParams.get("acceso");
  const access = requestedAccess === "disponibles" || requestedAccess === "exclusivos" ? requestedAccess : "todos";
  const normalizedQuery = normalize(query);

  function updateFilters(changes: Partial<Filters>) {
    const url = new URL(window.location.href);
    Object.entries(changes).forEach(([key, value]) => {
      if (value === "" || (key !== "q" && value === "todos")) url.searchParams.delete(key);
      else url.searchParams.set(key, value);
    });
    // Keep one history entry for the library and avoid refetching on each keystroke.
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }
  const library = useMemo(() => Array.from(new Map(recursos.map(resource => [resource.id, resource])).values()).map(resource => {
    const tiers = (Array.isArray(resource.tipo_suscripcion) ? resource.tipo_suscripcion : [resource.tipo_suscripcion]).map(tier => typeof tier === "string" ? normalize(tier) : "");
    const free = tiers.includes("gratuito");
    const paid = tiers.includes("mensual") || tiers.includes("anual");
    return {
      ...resource,
      format: getFormat(resource.tipo),
      available: free || (paid && isSubscriber),
      knownAccess: free || paid,
      plan: free ? "Gratuito" : tiers.includes("mensual") && tiers.includes("anual") ? "Mensual · Anual" : tiers.includes("mensual") ? "Plan mensual" : tiers.includes("anual") ? "Plan anual" : "Acceso por confirmar",
    };
  }), [recursos, isSubscriber]);
  const availableCount = library.filter(resource => resource.available).length;
  const visible = library.filter(resource =>
    (format === "todos" || resource.format === format) &&
    (access === "todos" || (access === "disponibles" ? resource.available : !resource.available && resource.knownAccess)) &&
    normalize([resource.titulo, resource.descripcion, resource.fase, resource.arquetipo, resource.elemento].filter(Boolean).join(" ")).includes(normalizedQuery)
  );
  const hasFilters = query !== "" || format !== "todos" || access !== "todos";
  const reset = () => {
    updateFilters({ q: "", formato: "todos", acceso: "todos" });
    searchRef.current?.focus();
  };

  return (
    <div className={styles.library}>
      <div className={styles.intro}>
        <span className={styles.eyebrow}><Sparkles size={14} aria-hidden="true" /> Pequeñas pausas, nuevas perspectivas</span>
        <span className={styles.inventory}>{availableCount} de {library.length} disponibles para ti</span>
      </div>
      {library.length > 0 && <>
        <div className={styles.toolbar}>
          <div className={styles.search}>
            <Search size={18} aria-hidden="true" />
            <label className={styles.srOnly} htmlFor={searchId}>Buscar en la biblioteca</label>
            <input ref={searchRef} id={searchId} type="search" placeholder="¿Qué necesitas hoy?" value={query} onChange={event => updateFilters({ q: event.target.value })} />
            {query && <button type="button" onClick={() => { updateFilters({ q: "" }); searchRef.current?.focus(); }} aria-label="Borrar búsqueda"><X size={16} aria-hidden="true" /></button>}
          </div>
          <label className={styles.access}>
            <SlidersHorizontal size={16} aria-hidden="true" />
            <span className={styles.srOnly}>Filtrar por acceso</span>
            <select value={access} onChange={event => updateFilters({ acceso: event.target.value as Access })}>
              <option value="todos">Todo el contenido</option>
              <option value="disponibles">Disponible para mí</option>
              <option value="exclusivos">Por desbloquear</option>
            </select>
          </label>
        </div>
        <div className={styles.filterRow}>
          <div className={styles.filters} role="group" aria-label="Filtrar por formato">
            <button type="button" aria-pressed={format === "todos"} onClick={() => updateFilters({ formato: "todos" })}>Todo <span>{library.length}</span></button>
            {(Object.keys(formats) as Format[]).filter(key => library.some(resource => resource.format === key)).map(key => {
              const Icon = formats[key].icon;
              return <button key={key} type="button" aria-pressed={format === key} onClick={() => updateFilters({ formato: key })}><Icon size={14} aria-hidden="true" />{formats[key].label}</button>;
            })}
          </div>
          <div className={styles.filterSummary}>
            <span className={styles.resultCount} role="status" aria-live="polite">{visible.length} {visible.length === 1 ? "recurso" : "recursos"}</span>
            {hasFilters && <button type="button" className={styles.reset} onClick={reset}><X size={16} aria-hidden="true" /> Limpiar filtros</button>}
          </div>
        </div>
      </>}
      <div className={styles.grid}>
        {visible.map(resource => {
          const meta = formats[resource.format];
          const Icon = meta.icon;
          return <article key={resource.id} className={styles.card} data-format={resource.format}>
            <div className={styles.art} aria-hidden="true">
              {resource.imagen_url && <Image src={resource.imagen_url} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw" className={styles.cover} />}
              <span className={styles.orbit} /><span className={styles.orbitInner} />
              {resource.format === "audio" && <div className={styles.wave}>{[18, 32, 22, 48, 65, 38, 76, 48, 28, 58, 36, 20, 30].map((height, index) => <i key={index} style={{ height }} />)}</div>}
              <span className={styles.artIcon}><Icon size={30} strokeWidth={1.2} /></span>
              <span className={styles.formatLabel}>{meta.singular}</span>
              <span className={styles.artNumber}>{resource.available ? <Check size={15} /> : <Lock size={14} />}</span>
            </div>
            <div className={styles.body}>
              <div className={styles.metadata}><span>{resource.plan}</span><span>{resource.available ? "Disponible" : resource.knownAccess ? "Exclusivo" : "Próximamente"}</span></div>
              <h3>{resource.titulo}</h3>
              <p>{resource.descripcion || "Un espacio para acompañar tu práctica y volver a ti."}</p>
              {[resource.fase, resource.arquetipo, resource.elemento].some(Boolean) && <div className={styles.tags}>{[resource.fase, resource.arquetipo, resource.elemento].filter(Boolean).map((tag, index) => <span key={index}>{tag}</span>)}</div>}
              {resource.knownAccess ? <Link className={styles.cardLink} href={resource.available ? `/recursos/${resource.id}` : "/suscripcion"} aria-label={`${resource.available ? meta.action : "Conocer planes"}: ${resource.titulo}`}>
                <span>{resource.available ? meta.action : "Conocer planes"}</span>
                {resource.available ? <ArrowUpRight size={18} aria-hidden="true" /> : <Lock size={16} aria-hidden="true" />}
              </Link> : <span className={styles.pending}>Estamos preparando su acceso</span>}
            </div>
          </article>;
        })}
      </div>
      {visible.length === 0 && <div className={styles.empty}>
        <BookOpen size={32} strokeWidth={1} aria-hidden="true" />
        <h3>{library.length ? "Probemos otro camino" : "Tu biblioteca está creciendo"}</h3>
        <p>{library.length ? "No hay recursos que coincidan con esta selección. Prueba otra palabra o explora todos los formatos." : "Estamos preparando audios, guías y nuevas prácticas para acompañarte. Vuelve pronto."}</p>
        {hasFilters && <button type="button" onClick={reset}>Ver todos los recursos <ArrowUpRight size={16} aria-hidden="true" /></button>}
      </div>}
    </div>
  );
}
