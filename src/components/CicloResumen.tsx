"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Droplets, Flame, Mountain, Wind, Sparkles, Lock, Music2, ScrollText, Clapperboard, BookOpen } from "lucide-react";
import styles from "./CicloResumen.module.css";

interface MujerChakanaData {
  elemento: string;
  semana?: string;
  audio_url?: string;
  ritual_pdf?: string;
  video_url?: string;
  tip_extra?: string;
}
const elements = {
  Agua: { Icon: Droplets, phrase: "Haz espacio para lo que sientes.", description: "Fluye con sensibilidad y encuentra un momento para escuchar tu intuición." },
  Fuego: { Icon: Flame, phrase: "Dale espacio a tu chispa.", description: "Explora tu creatividad y encuentra una forma de expresar lo que llevas dentro." },
  Tierra: { Icon: Mountain, phrase: "Vuelve a lo que te sostiene.", description: "Baja el ritmo, conecta con tu cuerpo y cuida los pequeños gestos de cada día." },
  Aire: { Icon: Wind, phrase: "Abre una ventana a lo nuevo.", description: "Respira, ordena tus pensamientos y encuentra palabras para tu propia voz." },
};

export default function CicloResumen({ mujerChakanaData, isSubscriber, day }: {
  day: number;
  fechaInicioCiclo: Date;
  fechaFinCiclo: Date;
  userName?: string;
  mujerChakanaData: MujerChakanaData;
  isSubscriber: boolean;
}) {
  const [showAccess, setShowAccess] = useState(false);
  const key = mujerChakanaData.elemento === "Cielo" ? "Aire" : mujerChakanaData.elemento;
  const element = elements[key as keyof typeof elements] || { Icon: Sparkles, phrase: "Encuentra tu propia forma de estar.", description: "Escucha lo que necesitas hoy y deja espacio para descubrirlo sin prisa." };
  const { Icon } = element;
  const resources = [
    { id: "audio", label: "Escucha tu audio guía", description: "Un momento para conectar hacia dentro", Icon: Music2, url: mujerChakanaData.audio_url },
    { id: "ritual", label: "Un ritual para este día", description: "Lleva tu intención a un pequeño gesto", Icon: ScrollText, url: mujerChakanaData.ritual_pdf },
    { id: "video", label: "Inspírate en movimiento", description: "Una invitación para explorar y sentir", Icon: Clapperboard, url: mujerChakanaData.video_url },
  ].filter(resource => resource.url);
  const dailyContentHref = `/ritual?pdf=${encodeURIComponent(mujerChakanaData.ritual_pdf || "")}&audio=${encodeURIComponent(mujerChakanaData.audio_url || "")}&video=${encodeURIComponent(mujerChakanaData.video_url || "")}`;
  return <div className={styles.summary}>
    <section className={styles.elementCard}>
      <div className={styles.elementTop}><span><Icon size={15} /> {mujerChakanaData.elemento}</span><small>DÍA {day}</small></div>
      <Icon className={styles.elementArt} aria-hidden="true" strokeWidth={.7} />
      <div className={styles.elementCopy}><p>UNA INVITACIÓN PARA HOY</p><h3>{element.phrase}</h3><span>{element.description}</span></div>
      {mujerChakanaData.semana && <small className={styles.week}>Semana lunar · {mujerChakanaData.semana}</small>}
    </section>
    <section className={styles.practices} aria-labelledby="daily-practices">
      <p className={styles.eyebrow}>A TU MANERA, SIN PRISA</p><h3 id="daily-practices">Pequeños rituales.<br /><em>Tiempo para ti.</em></h3>
      <div className={styles.resourceList}>
        {resources.map(({ id, label, description, Icon: ResourceIcon }) => isSubscriber ? <Link className={styles.resource} key={id} href={dailyContentHref}><span className={styles.resourceIcon}><ResourceIcon size={20} /></span><span><strong>{label}</strong><small>{description}</small></span><ArrowUpRight size={18} /></Link> : <button type="button" className={styles.resource} key={id} onClick={() => setShowAccess(value => !value)} aria-expanded={showAccess} aria-controls="cycle-subscription"><span className={styles.resourceIcon}><ResourceIcon size={20} /></span><span><strong>{label}</strong><small>Disponible con suscripción</small></span><Lock size={15} /></button>)}
        {!resources.length && <p className={styles.empty}>Todavía no hay recursos para este día. Puedes encontrar inspiración en la guía práctica.</p>}
        <Link href="/manual" className={styles.resource}><span className={styles.resourceIcon}><BookOpen size={20} /></span><span><strong>Explora la guía práctica</strong><small>Ideas para acompañar tu propio ritmo</small></span><ArrowUpRight size={18} /></Link>
      </div>
      {showAccess && <div className={styles.access} id="cycle-subscription"><p>Estos rituales forman parte de la suscripción. Descubre qué incluye y elige cómo continuar.</p><Link href="/suscripcion">Ver suscripciones <ArrowUpRight size={14} /></Link><button type="button" onClick={() => setShowAccess(false)}>Cerrar</button></div>}
    </section>
    {mujerChakanaData.tip_extra && <aside className={styles.dailyTip}><Sparkles size={19} aria-hidden="true" /><div><p>Una idea para llevarte</p><span>{mujerChakanaData.tip_extra}</span></div></aside>}
  </div>;
}
