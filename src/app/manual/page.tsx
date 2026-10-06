"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { AnimatePresence, motion, useReducedMotion, useScroll } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowDown, BookOpen, CalendarDays, Compass, FileText, Flower2, Headphones, Moon, Pause, Play, Settings, Sparkles } from "lucide-react";
import styles from "./manual.module.css";

const JourneyScene = dynamic(() => import("@/components/DashboardJourneyScene"), { ssr: false });
const chapters = [
  { id: "comenzar", label: "Comenzar", image: "/mujer-chakana.webp", color: "#f7b5c8", tint: "#260b20" },
  { id: "moonboard", label: "Tu Moonboard", image: "/cielo-ui.webp", color: "#ddd2fa", tint: "#1a1534" },
  { id: "recursos", label: "Tus recursos", image: "/tierra-ui.webp", color: "#e6c07a", tint: "#251a0e" },
  { id: "profundizar", label: "Profundizar", image: "/agua-ui.webp", color: "#88e6ef", tint: "#042733" },
];

export default function ManualPage() {
  const rootRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();
  const still = Boolean(reduced || paused);
  const { scrollYProgress } = useScroll();
  const chapter = chapters[active];
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.chapter)); });
    }, { rootMargin: "-20% 0px -55% 0px", threshold: 0 });
    rootRef.current?.querySelectorAll("[data-chapter]").forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, []);
  function jump(id: string) {
    const target = document.getElementById(id);
    target?.scrollIntoView({ behavior: still ? "instant" : "smooth", block: "start" });
    target?.focus({ preventScroll: true });
  }
  const entrance = { initial: still ? false as const : { opacity: 0, y: 28 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: .15 }, transition: { duration: .7 } };
  return <main ref={rootRef} className={styles.manual} style={{ "--manual-accent": chapter.color, "--scene-accent": chapter.color } as CSSProperties} data-manual-scene={chapter.id}>
    <div className={styles.stage} aria-hidden="true"><AnimatePresence initial={false}><motion.div className={styles.backdrop} key={chapter.id} initial={{ opacity: 0, scale: still ? 1 : 1.035 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: still ? 0 : 1 }}><Image src={chapter.image} alt="" fill sizes="100vw" priority={active === 0} /><div style={{ background: `linear-gradient(100deg, ${chapter.tint}f5, ${chapter.tint}cc 60%, ${chapter.tint}b0)` }} /></motion.div></AnimatePresence><JourneyScene scene={active} color={chapter.color} paused={still} progress={scrollYProgress}/></div>
    <motion.div className={styles.progress} style={{ scaleX: scrollYProgress }}/>
    <header className={styles.topbar}><Link href="/dashboard" className={styles.back}><ArrowLeft size={15}/> Volver a mi espacio</Link><span><Flower2 size={18}/> Ginergética · Guía práctica</span>{!reduced && <button type="button" onClick={() => setPaused(value => !value)} aria-label={paused ? "Activar movimiento ambiental" : "Pausar movimiento ambiental"} aria-pressed={paused}>{paused ? <Play size={15}/> : <Pause size={15}/>}</button>}</header>
    <div className={styles.content}>
      <section className={styles.hero} data-chapter="0"><motion.div {...entrance}><p className={styles.eyebrow}><Compass size={15}/> UNA GUÍA PARA TU RECORRIDO</p><h1>No necesitas<br/>saber el camino.<br/><em>Solo comenzar.</em></h1><p className={styles.lead}>Este es tu espacio para conocer tu ciclo, explorar tus arquetipos y escuchar lo que sientes. Aquí encontrarás cómo dar cada paso.</p><button className={styles.primary} onClick={() => jump("comenzar")}>Abre tu guía <ArrowDown size={16}/></button></motion.div><div className={styles.heroMark} aria-hidden="true"><Moon strokeWidth={.7}/><span>OBSERVAR · SENTIR · INTEGRAR</span></div></section>
      <div className={styles.readingLayout}>
        <aside className={styles.index}><p>EN ESTA GUÍA</p><nav aria-label="Índice del manual">{chapters.map((item, index) => <button key={item.id} onClick={() => jump(item.id)} aria-current={active === index ? "step" : undefined}><span>0{index + 1}</span>{item.label}<ArrowRight size={13}/></button>)}</nav><span className={styles.indexNote}>Vuelve aquí siempre<br/>que lo necesites.</span></aside>
        <div className={styles.chapters}>
          <section id="comenzar" data-chapter="0" className={styles.chapter} tabIndex={-1} aria-labelledby="start-title"><motion.div {...entrance}><p className={styles.eyebrow}>01 / COMENZAR</p><h2 id="start-title">Un punto de partida.<br/><em>Tu propio ritmo.</em></h2><p className={styles.description}>Empieza por lo esencial. Tu fecha de inicio permite situarte en el recorrido personal de 28 días de la plataforma.</p><ol className={styles.steps}><li><span>01</span><div><h3>Crea tu espacio</h3><p>Regístrate con tu correo y completa tu perfil. Si ya tienes cuenta, entra con tus datos habituales.</p><Link href="/setup">Ir a mi perfil <ArrowRight size={14}/></Link></div></li><li><span>02</span><div><h3>Marca tu inicio</h3><p>Guarda la fecha de inicio en la configuración. Desde ese momento podrás ver el día de tu ciclo y su arquetipo guía.</p><Link href="/setup"><Settings size={14}/> Configurar mi ciclo</Link></div></li><li><span>03</span><div><h3>Haz una pausa para escucharte</h3><p>En tu espacio personal, recorre las escenas o utiliza el índice lateral. En Registro puedes anotar emociones, energía, creatividad y lo que quieras recordar.</p><Link href="/dashboard">Entrar en mi espacio <ArrowRight size={14}/></Link></div></li></ol><div className={styles.note}><Sparkles size={19}/><p>No tienes que completarlo todo. Una frase sobre cómo te sientes también es una forma de empezar.</p></div></motion.div></section>
          <section id="moonboard" data-chapter="1" className={styles.chapter} tabIndex={-1} aria-labelledby="map-title"><motion.div {...entrance}><p className={styles.eyebrow}>02 / TU MOONBOARD</p><h2 id="map-title">Cada día,<br/><em>una nueva mirada.</em></h2><p className={styles.description}>El Moonboard reúne los 28 días de tu vuelta. Te ayuda a situarte y a explorar la fase lunar que acompaña cada fecha.</p><div className={styles.moonIllustration} aria-hidden="true"><i/><i/><i/><i/><i/><i/><i/></div><dl className={styles.legend}><div><dt><span className={styles.todayDot}/> Hoy</dt><dd>El día resaltado indica dónde estás en tu ciclo.</dd></div><div><dt><span className={styles.pastDot}/> Días vividos</dt><dd>Abre un día disponible para consultar su información lunar.</dd></div><div><dt><span className={styles.futureDot}/> Lo que viene</dt><dd>Los próximos días se irán habilitando a medida que avances.</dd></div></dl><Link className={styles.textLink} href="/dashboard#journey-moonboard"><CalendarDays size={16}/> Explorar mi Moonboard <ArrowRight size={15}/></Link><details className={styles.faq}><summary>¿Por qué no veo mi mapa?</summary><p>Comprueba que has guardado la fecha de inicio en tu perfil. El mapa necesita ese dato para calcular tu recorrido.</p><Link href="/setup">Revisar mi fecha de inicio <ArrowRight size={14}/></Link></details></motion.div></section>
          <section id="recursos" data-chapter="2" className={styles.chapter} tabIndex={-1} aria-labelledby="resources-title"><motion.div {...entrance}><p className={styles.eyebrow}>03 / TUS RECURSOS</p><h2 id="resources-title">Pequeñas prácticas.<br/><em>Espacio para ti.</em></h2><p className={styles.description}>Explora los materiales de la biblioteca y los recursos sugeridos para tu día. Cada contenido indica el acceso disponible.</p><div className={styles.resourceRows}><Link href="/recursos"><FileText size={24}/><span><strong>Guías y rituales en PDF</strong><small>Consulta los documentos disponibles en la biblioteca.</small></span><ArrowRight size={16}/></Link><Link href="/recursos"><Headphones size={24}/><span><strong>Audios y contenidos audiovisuales</strong><small>Encuentra un acompañamiento para tu práctica.</small></span><ArrowRight size={16}/></Link><Link href="/ciclo"><Flower2 size={24}/><span><strong>Arquetipos para explorar</strong><small>Acércate a sus símbolos, elementos y enseñanzas.</small></span><ArrowRight size={16}/></Link></div><div className={styles.note}><BookOpen size={19}/><p>Los materiales se consultan desde la biblioteca. La disponibilidad depende del recurso y de tu suscripción.</p></div></motion.div></section>
          <section id="profundizar" data-chapter="3" className={styles.chapter} tabIndex={-1} aria-labelledby="deeper-title"><motion.div {...entrance}><p className={styles.eyebrow}>04 / PROFUNDIZAR</p><h2 id="deeper-title">Sigue el hilo.<br/><em>A tu manera.</em></h2><p className={styles.description}>Si quieres ampliar tu recorrido, la suscripción da acceso a audios, rituales y recursos exclusivos. Consulta las opciones para elegir cómo continuar.</p><div className={styles.membership}><Sparkles size={27}/><h3>Un espacio para seguir descubriendo.</h3><p>Revisa los planes y el contenido incluido antes de decidir. Puedes volver a tus registros y a tu mapa cuando quieras.</p><Link href="/suscripcion" className={styles.primary}>Explorar suscripciones <ArrowRight size={16}/></Link></div><details className={styles.faq}><summary>¿Qué significa el candado en un recurso?</summary><p>Indica que el contenido requiere una suscripción. Puedes consultar los planes desde el propio recurso o en la página de suscripciones.</p></details><Link className={styles.textLink} href="/dashboard"><ArrowLeft size={15}/> Volver a mi recorrido</Link></motion.div></section>
        </div>
      </div>
    </div>
  </main>;
}

