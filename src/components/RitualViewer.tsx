"use client";

import { useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Flower2, Headphones, Leaf, Play, ScrollText, Sparkles } from "lucide-react";
import ResourceContent from "@/app/recursos/[id]/resource-content";
import BrandLogo from "@/components/ui/BrandLogo";
import styles from "./RitualViewer.module.css";

// Mismo orden y textos que la tarjeta «Pequeños rituales» del dashboard, que enlaza aquí.
const FORMATS = [
  { id: "audio", label: "Audio guía", hint: "Un momento para conectar hacia dentro", icon: Headphones, invitation: "Dale espacio a la escucha.", preparation: "Busca un lugar tranquilo y, si te apetece, usa auriculares. Puedes pausar y volver cuando lo necesites." },
  { id: "pdf", label: "Ritual escrito", hint: "Lleva tu intención a un pequeño gesto", icon: ScrollText, invitation: "Lleva tu intención a un gesto.", preparation: "Ten cerca tu cuaderno y lo que el ritual te pida. Léelo con calma antes de empezar." },
  { id: "video", label: "Vídeo", hint: "Una invitación para explorar y sentir", icon: Play, invitation: "Regálate este momento en movimiento.", preparation: "Prepara un espacio cómodo donde puedas moverte. Puedes ampliar el vídeo a pantalla completa." },
] as const;

type FormatId = (typeof FORMATS)[number]["id"];

function Topbar() {
  return <header className={styles.topbar}>
    <Link href="/dashboard" className={styles.back}><ArrowLeft size={16} aria-hidden="true" /><span>Mi espacio</span></Link>
    <BrandLogo href="/dashboard" aria-label="Ginergética · Mi espacio" />
    <span className={styles.topNote}>TU RITUAL DE HOY</span>
  </header>;
}

export function RitualLoading() {
  return <main className={styles.page}><div className={styles.shell}><Topbar /><p className={styles.loading} role="status">Preparando tu ritual…</p></div></main>;
}

export default function RitualViewer({ pdfUrl, audioUrl, videoUrl }: { pdfUrl?: string; audioUrl?: string; videoUrl?: string }) {
  const urls: Record<FormatId, string | undefined> = { audio: audioUrl, pdf: pdfUrl, video: videoUrl };
  const available = FORMATS.filter(format => urls[format.id]);
  const [activeId, setActiveId] = useState<FormatId | undefined>(available[0]?.id);
  const active = available.find(format => format.id === activeId) ?? available[0];
  const hasTabs = available.length > 1;

  // Patrón de pestañas ARIA: las flechas, Inicio y Fin mueven la selección y el foco.
  function handleTabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const targets: Record<string, number> = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: available.length - 1 };
    if (!(event.key in targets)) return;
    event.preventDefault();
    const nextIndex = (targets[event.key] + available.length) % available.length;
    setActiveId(available[nextIndex].id);
    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("[role=tab]")[nextIndex]?.focus();
  }

  if (!active) return <main className={styles.page}>
    <div className={styles.shell}>
      <Topbar />
      <section className={styles.empty} aria-labelledby="ritual-title">
        <Leaf size={36} strokeWidth={1} aria-hidden="true" />
        <p className={styles.eyebrow}>HAGAMOS UNA PAUSA</p>
        <h1 id="ritual-title">Hoy no hay un ritual preparado.</h1>
        <p>Es un buen momento para escucharte sin guion. Puedes dejar una huella en tu diario o explorar la biblioteca.</p>
        <div className={styles.actions}><Link href="/dashboard" className={styles.primary}>Volver a mi espacio</Link><Link href="/recursos" className={styles.secondary}>Explorar la biblioteca <ArrowUpRight size={16} aria-hidden="true" /></Link></div>
      </section>
    </div>
  </main>;

  const ActiveIcon = active.icon;

  return <main className={styles.page}>
    <div className={styles.shell}>
      <Topbar />
      <div className={styles.layout}>
        <div className={styles.intro}>
          <div className={styles.heading}>
            <p className={styles.eyebrow}>UN RITUAL PARA HOY</p>
            <h1>Un gesto pequeño.<br /><em>Un tiempo tuyo.</em></h1>
            <p className={styles.lead}>{hasTabs && "Elige cómo quieres vivirlo hoy. "}Dedícale el tiempo que necesites: puedes pausar y volver cuando quieras.</p>
          </div>
          {hasTabs && <div role="tablist" aria-label="Formato del ritual" className={styles.tabs}>
            {available.map((format, index) => {
              const Icon = format.icon;
              const selected = format.id === active.id;
              return <button key={format.id} type="button" role="tab" id={`ritual-tab-${format.id}`} aria-selected={selected} aria-controls="ritual-panel" tabIndex={selected ? 0 : -1} className={styles.tab} onClick={() => setActiveId(format.id)} onKeyDown={event => handleTabKey(event, index)}>
                <span className={styles.tabIcon}><Icon size={18} strokeWidth={1.5} aria-hidden="true" /></span>
                <span><strong>{format.label}</strong><small>{format.hint}</small></span>
              </button>;
            })}
          </div>}
          <div className={styles.preparation}><span className={styles.smallIcon}><Leaf size={19} strokeWidth={1.3} aria-hidden="true" /></span><div><h2>Antes de empezar</h2><p>{active.preparation}</p></div></div>
        </div>

        <div className={styles.practice}>
          <section id="ritual-panel" className={styles.experience} role={hasTabs ? "tabpanel" : undefined} aria-labelledby={hasTabs ? `ritual-tab-${active.id}` : "experience-title"}>
            <div className={styles.experienceHeading}><p className={styles.eyebrow}>TU MOMENTO</p><ActiveIcon size={20} strokeWidth={1.3} aria-hidden="true" /></div>
            <h2 id="experience-title">{active.invitation}</h2>
            <ResourceContent key={active.id} type={active.id} url={urls[active.id] ?? ""} title={`Ritual del día · ${active.label}`} />
            <div className={styles.experienceFooter}><span>Ritual del día</span><span>{active.label}</span></div>
          </section>
          <details className={styles.reflection}><summary><span><Sparkles size={17} strokeWidth={1.3} aria-hidden="true" /> Después de tu práctica</span><span className={styles.expand} aria-hidden="true">+</span></summary><div><p>Tómate un instante antes de continuar. ¿Cómo te sientes? ¿Qué te gustaría llevar contigo de este momento?</p><Link href="/registros" className={styles.textLink}>Ir a mi diario <ArrowUpRight size={15} aria-hidden="true" /></Link></div></details>
        </div>
      </div>
      <footer className={styles.footer}><div><Flower2 size={22} strokeWidth={1} aria-hidden="true" /><p>Cada pausa también es parte del camino.</p></div><Link href="/dashboard">Volver a mi espacio <ArrowUpRight size={17} aria-hidden="true" /></Link></footer>
    </div>
  </main>;
}
