"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowUpRight, BookOpen, Flower2, Headphones, Leaf, LockKeyhole, Moon, Play, RefreshCcw, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import ResourceContent from "./resource-content";
import styles from "./resource.module.css";

type Tier = "gratuito" | "mensual" | "anual";
interface Recurso {
  id: string;
  tipo: string;
  titulo: string;
  url: string;
  descripcion: string;
  tipo_suscripcion: Tier | Tier[];
  imagen_url?: string;
  fase?: string;
  arquetipo?: string;
  elemento?: string;
}

const formats = {
  audio: { label: "Audio", icon: Headphones, invitation: "Dale espacio a la escucha.", preparation: "Busca un lugar tranquilo y, si te apetece, usa auriculares. Puedes pausar y volver cuando lo necesites." },
  pdf: { label: "Guía PDF", icon: BookOpen, invitation: "Abre una nueva perspectiva.", preparation: "Ten cerca tu cuaderno. Lee con calma y quédate con las ideas que resuenen contigo hoy." },
  video: { label: "Vídeo", icon: Play, invitation: "Regálate este momento.", preparation: "Prepara un espacio cómodo. Puedes ampliar el vídeo a pantalla completa y seguirlo a tu propio ritmo." },
};

export default function RecursoPage() {
  const params = useParams<{ id: string }>();
  return <ResourceDetail key={params.id} id={params.id} />;
}

function ResourceDetail({ id }: { id: string }) {
  const [resource, setResource] = useState<Recurso | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<"missing" | "connection" | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [available, setAvailable] = useState(false);
  const [coverFailed, setCoverFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { data, error: resourceError } = await supabase.from("recursos").select("*").eq("id", id).eq("activo", true).abortSignal(controller.signal).maybeSingle();
        if (resourceError) throw resourceError;
        if (!data) {
          if (!cancelled) setError("missing");
          return;
        }
        const result = data as Recurso;
        const tiers = Array.isArray(result.tipo_suscripcion) ? result.tipo_suscripcion : [result.tipo_suscripcion];
        let canAccess = tiers.includes("gratuito");
        // Mirror the library's access rules. Storage/RLS remains responsible for authorization.
        if (!canAccess && tiers.some(tier => tier === "mensual" || tier === "anual")) {
          const { data: { user }, error: authError } = await supabase.auth.getUser();
          if (authError && authError.name !== "AuthSessionMissingError") throw authError;
          if (user) {
            const { data: profile, error: profileError } = await supabase.from("perfiles").select("suscripcion_activa").eq("user_id", user.id).abortSignal(controller.signal).maybeSingle();
            if (profileError) throw profileError;
            canAccess = Boolean(profile?.suscripcion_activa);
          }
        }
        if (!cancelled) { setResource(result); setAvailable(canAccess); }
      } catch {
        if (!cancelled) setError("connection");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; controller.abort(); };
  }, [id, attempt]);

  const type = resource?.tipo?.trim().toLowerCase();
  const format = type === "audio" || type === "pdf" || type === "video" ? formats[type] : { label: "Recurso", icon: Sparkles, invitation: "Un espacio para volver a ti.", preparation: "Acércate a este recurso con curiosidad y dedica a tu práctica el tiempo que necesites." };
  const Icon = format.icon;
  const tiers = resource ? (Array.isArray(resource.tipo_suscripcion) ? resource.tipo_suscripcion : [resource.tipo_suscripcion]) : [];
  const free = tiers.includes("gratuito");
  const knownAccess = free || tiers.includes("mensual") || tiers.includes("anual");
  const plan = free ? "Acceso gratuito" : tiers.includes("mensual") && tiers.includes("anual") ? "Planes mensual y anual" : tiers.includes("anual") ? "Plan anual" : tiers.includes("mensual") ? "Plan mensual" : "Acceso por confirmar";

  return <main className={styles.page}>
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <Link href="/recursos" className={styles.back}><ArrowLeft size={16} aria-hidden="true" /><span>Biblioteca</span></Link>
        <Link href="/dashboard" className={styles.brand} aria-label="Ginergética · Mi espacio"><Flower2 size={23} strokeWidth={1.2} aria-hidden="true" /> Ginergética</Link>
        <span className={styles.topNote}>TU ESPACIO DE PRÁCTICA</span>
      </header>

      {loading ? <div className={styles.loading} role="status" aria-live="polite">
        <p className={styles.eyebrow}>Preparando tu momento…</p>
        <div className={styles.skeletonLayout} aria-hidden="true"><div /><div><i /><i /><i /><span /></div></div>
      </div> : error || !resource ? <section className={styles.error} aria-labelledby="error-title">
        <BookOpen size={36} strokeWidth={1} aria-hidden="true" />
        <p className={styles.eyebrow}>HAGAMOS UNA PAUSA</p>
        <h1 id="error-title">{error === "missing" ? "Este recurso no está disponible." : "No pudimos preparar tu recurso."}</h1>
        <p role="alert">{error === "missing" ? "Puede que ya no forme parte de la biblioteca. Hay otros caminos por explorar." : "No hemos podido cargar el contenido o comprobar tu acceso. Revisa tu conexión y vuelve a intentarlo."}</p>
        <div className={styles.errorActions}>{error !== "missing" && <button className={styles.primary} onClick={() => setAttempt(value => value + 1)}><RefreshCcw size={16} aria-hidden="true" /> Reintentar</button>}<Link href="/recursos" className={styles.secondary}>Explorar la biblioteca <ArrowUpRight size={16} aria-hidden="true" /></Link></div>
      </section> : <>
        <nav aria-label="Ruta del recurso" className={styles.breadcrumb}><Link href="/recursos">La biblioteca</Link><span aria-hidden="true">/</span><span aria-current="page">{format.label}</span></nav>
        <div className={styles.layout}>
          <aside className={styles.companion} aria-label="Sobre este recurso">
            <div className={styles.cover}>
              {resource.imagen_url && !coverFailed ? <Image src={resource.imagen_url} alt={`Portada de ${resource.titulo}`} fill priority sizes="(max-width: 760px) 100vw, 42vw" className={styles.coverImage} onError={() => setCoverFailed(true)} /> : <div className={styles.coverArt} aria-hidden="true"><span /><span /><Flower2 size={90} strokeWidth={.65} /><p>Un encuentro<br /><em>contigo.</em></p></div>}
              <div className={styles.coverShade} />
              <span className={styles.coverBadge}><Icon size={15} aria-hidden="true" /> {format.label}</span>
              <div className={styles.coverCaption}><span>GINERGÉTICA</span><p>Escuchar. Sentir. Integrar.</p></div>
            </div>
            <div className={styles.preparation}><span className={styles.smallIcon}><Leaf size={19} strokeWidth={1.3} aria-hidden="true" /></span><div><h2>Antes de empezar</h2><p>{format.preparation}</p></div></div>
            <p className={styles.marginNote}>Sin prisa. Sin exigencias. A tu ritmo.</p>
          </aside>

          <article className={styles.detail}>
            <div className={styles.accessLabel}><span className={styles.eyebrow}>{free ? "BIBLIOTECA ABIERTA" : knownAccess ? "COLECCIÓN PREMIUM" : "LA BIBLIOTECA"}</span><span className={styles.accessPill}>{available ? <><span /> Disponible para ti</> : <><LockKeyhole size={12} aria-hidden="true" /> {knownAccess ? "Con suscripción" : "Próximamente"}</>}</span></div>
            <h1>{resource.titulo}</h1>
            <p className={styles.description}>{resource.descripcion || "Una invitación a hacer una pausa, explorar tu mundo interior y acompañar tu propio recorrido."}</p>
            {[resource.fase, resource.elemento, resource.arquetipo].some(Boolean) && <dl className={styles.metadata}>
              {resource.fase && <div><dt><Moon size={14} aria-hidden="true" /> Fase</dt><dd>{resource.fase}</dd></div>}
              {resource.elemento && <div><dt><Leaf size={14} aria-hidden="true" /> Elemento</dt><dd>{resource.elemento}</dd></div>}
              {resource.arquetipo && <div><dt><Sparkles size={14} aria-hidden="true" /> Arquetipo</dt><dd>{resource.arquetipo}</dd></div>}
            </dl>}

            <section className={styles.experience} aria-labelledby="experience-title">
              <div className={styles.experienceHeading}><p className={styles.eyebrow}>TU MOMENTO</p><Icon size={20} strokeWidth={1.3} aria-hidden="true" /></div>
              <h2 id="experience-title">{format.invitation}</h2>
              {available ? <ResourceContent key={resource.id} type={type ?? ""} url={resource.url} title={resource.titulo} poster={coverFailed ? undefined : resource.imagen_url} /> : <div className={styles.locked}><LockKeyhole size={24} strokeWidth={1.3} aria-hidden="true" /><p>{knownAccess ? "Este recurso forma parte de la colección para suscriptoras. Entra en tu cuenta o descubre los planes para disfrutarlo." : "Estamos preparando el acceso a este recurso. Mientras tanto, puedes seguir explorando la biblioteca."}</p>{knownAccess && <div className={styles.lockedActions}><Link href="/suscripcion" className={styles.primary}>Descubrir los planes <ArrowUpRight size={16} aria-hidden="true" /></Link><Link href="/auth/login" className={styles.textLink}>Ya tengo una cuenta</Link></div>}</div>}
              <div className={styles.experienceFooter}><span>{plan}</span><span>{format.label}</span></div>
            </section>

            <details className={styles.reflection}><summary><span><Sparkles size={17} strokeWidth={1.3} aria-hidden="true" /> Después de tu práctica</span><span className={styles.expand} aria-hidden="true">+</span></summary><div><p>Tómate un instante antes de continuar. ¿Cómo te sientes? ¿Qué te gustaría llevar contigo de este momento?</p><Link href="/registros" className={styles.textLink}>Ir a mi diario <ArrowUpRight size={15} aria-hidden="true" /></Link></div></details>
          </article>
        </div>
        <footer className={styles.footer}><div><Flower2 size={22} strokeWidth={1} aria-hidden="true" /><p>Cada pausa también es parte del camino.</p></div><Link href="/recursos">Seguir explorando <ArrowUpRight size={17} aria-hidden="true" /></Link></footer>
      </>}
    </div>
  </main>;
}
