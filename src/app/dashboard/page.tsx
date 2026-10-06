"use client";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { ArrowDown, ArrowRight, BookOpen, CalendarDays, Flower2, Leaf, Moon, PenLine, Pause, Play, Settings, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import Moonboard from "@/components/Moonboard";
import RecursosList from "@/components/RecursosList";
import CicloResumen from "@/components/CicloResumen";
import NuevoRegistro from "@/components/NuevoRegistro";
import QuickNav from "@/components/QuickNav";
import { useToast } from "@/components/Toast";
import ArquetiposPanel from "@/components/ArquetiposPanel";
import { GlassCard, PrimaryAction } from "@/components/ui/AppPrimitives";
import { EstadoCiclo, Recurso } from "@/types/index";
import styles from "./dashboard.module.css";

const TOTAL_CYCLE_DAYS = 28;
interface Perfil { display_name: string; avatar_url: string | null; fecha_inicio: string | null; suscripcion_activa?: boolean; }
type DashboardPanel = "ciclo" | "moonboard" | "registro" | "arquetipos" | "recursos";
type SceneId = "inicio" | DashboardPanel;
interface DashboardPanelItem { id: DashboardPanel; label: string; description: string; Icon: LucideIcon; disabled?: boolean; }
const ELEMENT_SCENES: Record<string, { image: string; accent: string; label: string }> = {
 agua: {image:"/agua-ui.webp",accent:"#88e6ef",label:"Agua"}, fuego:{image:"/fuego-ui.webp",accent:"#ffc37a",label:"Fuego"}, tierra:{image:"/tierra-ui.webp",accent:"#e6c07a",label:"Tierra"}, aire:{image:"/cielo-ui.webp",accent:"#ffe0b0",label:"Aire"}, cielo:{image:"/cielo-ui.webp",accent:"#ffe0b0",label:"Cielo"}
};
const CHAPTERS: Record<DashboardPanel, { title: string; line: string; note: string }> = {
 ciclo: {title:"Habita",line:"tu momento.",note:"Cada etapa tiene algo que contarte. Acércate a la energía que te acompaña hoy."},
 moonboard:{title:"Tu ciclo es",line:"una constelación.",note:"Recorre los días que has vivido. Cada uno guarda una forma distinta de ti."},
 registro:{title:"Baja el ruido.",line:"Escúchate.",note:"No hay una forma correcta de sentir. Este espacio es para lo que aparece hoy."},
 arquetipos:{title:"Muchas formas",line:"de ser tú.",note:"Encuentra un espejo en los arquetipos y descubre las historias que te habitan."},
 recursos:{title:"Llévate algo",line:"para el camino.",note:"Audios, rituales y pequeñas prácticas para continuar a tu manera."}
};
const normalizeElement=(value?:string|null)=>(value||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
const getCycleDay=(startDate:Date)=>(((Math.floor((Date.now()-startDate.getTime())/86400000)%28)+28)%28)+1;
const getCyclePhase=(day:number)=>day<=7?"Menstrual":day<=14?"Folicular":day<=21?"Ovulatoria":"Lútea";

export default function DashboardPage() {
 const router=useRouter();
 const reduceMotion=useReducedMotion();
 const [motionPaused,setMotionPaused]=useState(false);
 const still=Boolean(reduceMotion||motionPaused);
 const rootRef=useRef<HTMLDivElement>(null);
 const {scrollYProgress}=useScroll({target:rootRef,offset:["start start","end end"]});
 const smoothProgress=useSpring(scrollYProgress,{stiffness:100,damping:30});
 const {ToastContainer}=useToast();
 const [activeScene,setActiveScene]=useState<SceneId>("inicio");
 const [userName,setUserName]=useState<string|null>(null);
 const [fechaActual]=useState(()=>new Date().toLocaleDateString("es-ES",{weekday:"long",day:"2-digit",month:"long"}));
 const [day,setDay]=useState(1);
 const [estadoCiclo,setEstadoCiclo]=useState<EstadoCiclo|null>(null);
 const [recursosData,setRecursosData]=useState<Recurso[]>([]);
 const [fechaInicioCiclo,setFechaInicioCiclo]=useState<Date|null>(null);
 const [fechaFinCiclo,setFechaFinCiclo]=useState<Date|null>(null);
 const [userId,setUserId]=useState<string|null>(null);
 const [perfil,setPerfil]=useState<Perfil|null>(null);
 const [loading,setLoading]=useState(true);
 const [loadingMessage,setLoadingMessage]=useState("Abriendo tu espacio personal…");
 const [loadError,setLoadError]=useState(false);
 function goToScene(id:SceneId) {
   const target=document.getElementById('journey-'+id);
   target?.scrollIntoView({behavior:still?"instant":"smooth",block:"start"});
   target?.focus({preventScroll:true});
 }
 useEffect(()=>{
   if(loading)return;
   const observer=new IntersectionObserver(entries=>{
     for(const entry of entries)if(entry.isIntersecting)setActiveScene((entry.target as HTMLElement).dataset.sceneId as SceneId);
   },{rootMargin:"-25% 0px -55% 0px",threshold:0});
   rootRef.current?.querySelectorAll('[data-scene-id]').forEach(el=>observer.observe(el));
   return ()=>observer.disconnect();
 },[loading]);
  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
    setLoadingMessage("Conectando con tu perfil...");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/");
      return;
    }

    setUserId(user.id);

    const perfilPromise = supabase
      .from("perfiles")
      .select("display_name, avatar_url, fecha_inicio, suscripcion_activa")
      .eq("user_id", user.id)
      .single();

    const recursosPromise = supabase
      .from("recursos")
      .select("*")
      .eq("activo", true);

    const [{ data: perfilData }, { data: recursos }] = await Promise.all([
      perfilPromise,
      recursosPromise,
    ]);

    setUserName(perfilData?.display_name || "");
    setPerfil(perfilData ?? null);
    setRecursosData(recursos || []);
    if (!perfilData?.fecha_inicio) {
      setEstadoCiclo(null);
      setDay(1);
      setFechaInicioCiclo(null);
      setFechaFinCiclo(null);
      setLoading(false);
      return;
    }

      setLoadingMessage("Calculando tu ciclo...");
    const startDate = new Date(perfilData.fecha_inicio);
    const cycleDay = getCycleDay(startDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + TOTAL_CYCLE_DAYS - 1);

    setDay(cycleDay);
    setFechaInicioCiclo(startDate);
    setFechaFinCiclo(endDate);

    const { data: mujerChakanaData } = await supabase
      .from("mujer_chakana")
      .select("*")
      .eq("dia_ciclo", cycleDay)
      .single();

    setEstadoCiclo(mujerChakanaData || null);
    setLoading(false);
    } catch { setLoadError(true); setLoading(false); }
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const isSubscriber = Boolean(perfil?.suscripcion_activa);
  const diasTranscurridos = fechaInicioCiclo
    ? Math.floor(
        (Date.now() - fechaInicioCiclo.getTime()) / (1000 * 60 * 60 * 24)
      )
    : 0;
  const cicloActual = fechaInicioCiclo
    ? Math.floor(diasTranscurridos / TOTAL_CYCLE_DAYS) + 1
    : 1;

  const descripcionCorta = estadoCiclo?.descripcion
    ? `${estadoCiclo.descripcion.split(".")[0]}.`
    : "Registra tus sensaciones para activar una lectura más personal.";

  const dashboardPanels: DashboardPanelItem[] = useMemo(
    () => [
      {
        id: "ciclo",
        label: "Ciclo",
        description: estadoCiclo
          ? `${estadoCiclo.arquetipo} · ${estadoCiclo.elemento}`
          : "Configura tu fecha de inicio",
        Icon: Moon,
      },
      {
        id: "moonboard",
        label: "Moonboard",
        description: "Mapa visual de 28 días",
        Icon: CalendarDays,
      },
      {
        id: "registro",
        label: "Registro",
        description: "Anota cómo estás hoy",
        Icon: PenLine,
        disabled: !(userId && estadoCiclo && fechaInicioCiclo),
      },
      {
        id: "arquetipos",
        label: "Arquetipos",
        description: isSubscriber ? "Biblioteca activa" : "Vista y desbloqueo",
        Icon: Flower2,
      },
      {
        id: "recursos",
        label: "Recursos",
        description: `${recursosData.length} disponibles`,
        Icon: BookOpen,
      },
    ],
    [estadoCiclo, fechaInicioCiclo, isSubscriber, recursosData.length, userId]
  );

  const renderContent = (panel: DashboardPanel) => {
    switch (panel) {
      case "ciclo":
        return estadoCiclo ? (
          <div className={styles.cycleContent}>
            {fechaInicioCiclo && fechaFinCiclo ? (
              <CicloResumen
                immersive
                day={day}
                fechaInicioCiclo={fechaInicioCiclo}
                fechaFinCiclo={fechaFinCiclo}
                userName={userName ?? undefined}
                mujerChakanaData={estadoCiclo}
                isSubscriber={isSubscriber}
              />
            ) : null}
          </div>
        ) : (
          <GlassCard className="text-center">
            <Sparkles className="mx-auto h-10 w-10 text-rose-500" />
            <h2 className="mt-4 text-2xl font-semibold text-rose-950">
              Configura tu fecha de inicio
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-rose-800/72">
              Necesitamos tu fecha de inicio para calcular el día del ciclo y
              activar la guía diaria.
            </p>
            <PrimaryAction href="/setup" className="mt-6">
              Ir a configuración
            </PrimaryAction>
          </GlassCard>
        );
      case "moonboard":
        return <Moonboard startDate={fechaInicioCiclo} immersive />;
      case "registro":
        return userId && estadoCiclo && fechaInicioCiclo ? (
          <NuevoRegistro
            immersive
            userId={userId}
            nombre={userName ?? "Exploradora"}
            dia_ciclo={day}
            ciclo_actual={cicloActual}
            arquetipo={estadoCiclo.arquetipo ?? "Guia"}
          />
        ) : (
          <GlassCard className="text-center">
            <PenLine className="mx-auto h-10 w-10 text-rose-500" />
            <h2 className="mt-4 text-2xl font-semibold text-rose-950">
              Tu registro se activa con el ciclo
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-rose-800/72">
              Configura tu fecha de inicio para registrar emociones y recibir
              reflexiones diarias.
            </p>
          </GlassCard>
        );
      case "arquetipos":
        return (
          <ArquetiposPanel
            isLoadingProfile={perfil === null}
            isSubscriber={isSubscriber}
            onNavigateToArquetipos={() => router.push("/ciclo")}
            onNavigateToSuscripcion={() => router.push("/suscripcion")}
          />
        );
      case "recursos":
        return (
          <GlassCard className="overflow-hidden p-5 sm:p-8">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="app-kicker">Recursos</p>
                <h2 className="mt-2 text-2xl font-semibold text-rose-950 sm:text-3xl">
                  Biblioteca para tu proceso
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-rose-800/72">
                  Rituales, audios y guías para acompañar el momento del ciclo
                  que estas transitando.
                </p>
              </div>
              <Link
                href="/recursos"
                className="app-focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl border border-white/70 bg-white/46 px-4 py-2 text-sm font-semibold text-rose-800 transition hover:bg-white/72"
              >
                Ver todos
              </Link>
            </div>
            <RecursosList recursos={recursosData} isSubscriber={isSubscriber} />
          </GlassCard>
        );
      default:
        return null;
    }
  };
 const elementScene=ELEMENT_SCENES[normalizeElement(estadoCiclo?.elemento)]||{image:"/mujer-chakana.webp",accent:"#f7b5c8",label:"Chakana"};
 const heroImage=estadoCiclo?.imagen_url||elementScene.image;
 const firstName=userName?.trim().split(/\s+/)[0]||"Exploradora";
 const scenes: Record<SceneId,{image:string;accent:string;tint:string}>={
   inicio:{image:heroImage,accent:"#f7b5c8",tint:"linear-gradient(95deg,rgba(24,5,18,.96),rgba(47,11,33,.66) 55%,rgba(20,5,16,.32))"},
   ciclo:{...elementScene,tint:"linear-gradient(105deg,rgba(24,18,10,.93),rgba(53,37,15,.72),rgba(21,16,8,.84))"},
   moonboard:{image:"/cielo-ui.webp",accent:"#ddd2fa",tint:"linear-gradient(105deg,rgba(19,16,39,.96),rgba(40,34,72,.77),rgba(19,14,36,.9))"},
   registro:{image:"/agua-ui.webp",accent:"#88e6ef",tint:"linear-gradient(105deg,rgba(3,26,38,.96),rgba(4,61,76,.8),rgba(2,26,38,.9))"},
   arquetipos:{image:"/fuego-ui.webp",accent:"#ffc37a",tint:"linear-gradient(105deg,rgba(34,7,4,.96),rgba(101,25,7,.78),rgba(47,8,3,.87))"},
   recursos:{image:"/tierra-ui.webp",accent:"#e6c07a",tint:"linear-gradient(105deg,rgba(25,17,8,.95),rgba(73,43,15,.8),rgba(25,15,5,.87))"}
 };
 const scene=scenes[activeScene];
 const navigation=[{id:"inicio" as SceneId,label:"Tu umbral",Icon:Sparkles},...dashboardPanels];
 const sceneIndex=navigation.findIndex(item=>item.id===activeScene);
 if(loading)return <div className={styles.loadingState}><Moon className={styles.loadingMoon}/><p>{loadingMessage}</p><small>Un momento para volver a ti</small></div>;
 if(loadError)return <div className={styles.loadingState}><p>No pudimos abrir tu espacio.</p><button onClick={()=>void loadData()} className={styles.primaryAction}>Volver a intentar</button></div>;
 return <div ref={rootRef} className={styles.journey} data-motion={still?"paused":"active"} data-active-scene={activeScene} style={{"--scene-accent":scene.accent} as CSSProperties}>
   <div className={styles.stage} aria-hidden="true"><AnimatePresence initial={false}><motion.div key={scene.image+scene.tint} className={styles.stageScene} initial={{opacity:0,scale:still?1:1.045}} animate={{opacity:1,scale:1}} exit={{opacity:0}} transition={{duration:still?0:1.1,ease:"easeOut"}}><Image src={scene.image} alt="" fill sizes="100vw" priority={activeScene==="inicio"} style={{objectPosition:activeScene==="inicio"?"center 28%":"center"}}/><div className={styles.stageTint} style={{background:scene.tint}}/></motion.div></AnimatePresence><div className={styles.vignette}/><div className={styles.grain}/><div className={styles.sigil}/><div className={styles.motes}>{Array.from({length:8},(_,i)=><i key={i} style={{"--i":i} as CSSProperties}/>)}</div></div>
   <motion.div className={styles.progress} style={{scaleX:still?scrollYProgress:smoothProgress}}/>
   <header className={styles.chrome}><Link href="/dashboard" className={styles.brand}><Flower2 size={22}/>Ginergética</Link><div className={styles.chromeMeta}><span>{isSubscriber?"Círculo activo":"Plan gratuito"}</span>{!reduceMotion&&<button onClick={()=>setMotionPaused(value=>!value)} aria-label={motionPaused?"Activar movimiento ambiental":"Pausar movimiento ambiental"} aria-pressed={motionPaused}>{motionPaused?<Play size={16}/>:<Pause size={16}/>}</button>}<Link href="/setup" aria-label="Configurar mi ciclo"><Settings size={17}/></Link></div></header>
   <nav className={styles.sceneNav} aria-label="Capítulos de tu experiencia">{navigation.map(({id,label},index)=><button key={id} onClick={()=>goToScene(id)} aria-current={activeScene===id?"step":undefined} aria-label={label}><span className={styles.navLabel}>{label}</span><span className={styles.navDot}/><small>0{index}</small></button>)}</nav>
   <div className={styles.sceneCounter} aria-hidden="true"><strong>0{sceneIndex}</strong><span>/ 05</span><i/>{navigation[sceneIndex].label}</div>
   <section id="journey-inicio" data-scene-id="inicio" className={styles.intro} tabIndex={-1} aria-labelledby="journey-title">
     <motion.div className={styles.introCopy} initial={still?false:{opacity:0,y:35}} animate={{opacity:1,y:0}} transition={{duration:.9}}><p className={styles.eyebrow}>{fechaActual} · TU UMBRAL</p><h1 id="journey-title">Vuelve a ti,<br/><em>{firstName}.</em></h1><p className={styles.introDescription}>{estadoCiclo?<>Hoy te acompaña <strong>{estadoCiclo.arquetipo}</strong>.<br/>{descripcionCorta}</>:"Cada recorrido comienza por escucharte. Configura tu ciclo y abre tu espacio personal."}</p><div className={styles.introActions}>{fechaInicioCiclo?<button className={styles.primaryAction} onClick={()=>goToScene("registro")}><PenLine size={16}/> Registrar cómo estoy <ArrowRight size={16}/></button>:<Link className={styles.primaryAction} href="/setup">Configurar mi ciclo <ArrowRight size={16}/></Link>}<button className={styles.secondaryAction} onClick={()=>goToScene("moonboard")}>Explorar mi Moonboard <ArrowRight size={16}/></button></div></motion.div>
     {fechaInicioCiclo&&<button className={styles.cyclePortal} onClick={()=>goToScene("moonboard")} aria-label={"Día "+day+" de 28. Explorar mi Moonboard"}><svg viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="97" className={styles.portalTrack}/><motion.circle cx="100" cy="100" r="97" className={styles.portalProgress} initial={still?false:{pathLength:0}} animate={{pathLength:day/28}} transition={{duration:still?0:2,delay:.3}}/></svg><small>ESTÁS AQUÍ</small><strong>{day}</strong><span>{getCyclePhase(day)} · de 28 días</span><em>Abre tu constelación <ArrowRight size={13}/></em></button>}
     <div className={styles.introFooter}><span><Leaf size={14}/>{estadoCiclo?.elemento||"Tu propio ritmo"}{fechaInicioCiclo?" · Ciclo "+cicloActual:""}</span><button onClick={()=>goToScene("ciclo")}>Desliza y entra en tu recorrido <ArrowDown size={16}/></button><small>01 — 05 · A TU RITMO</small></div>
   </section>
   {dashboardPanels.map(({id,label},index)=><section key={id} id={"journey-"+id} data-scene-id={id} className={styles.chapter} tabIndex={-1} aria-labelledby={"chapter-title-"+id}>
     <motion.header className={styles.chapterHeading} initial={still?false:{opacity:0,y:40}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.3}} transition={{duration:.8}}><p className={styles.eyebrow}>0{index+1} / {label}</p><h2 id={"chapter-title-"+id}>{CHAPTERS[id].title}<br/><em>{CHAPTERS[id].line}</em></h2><p className={styles.chapterNote}>{CHAPTERS[id].note}</p></motion.header>
     <motion.div className={styles.chapterContent} initial={still?false:{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.08}} transition={{duration:.7,delay:.1}}>{renderContent(id)}</motion.div>
     <div className={styles.chapterFooter}><Link href="/manual"><BookOpen size={14}/> Abrir guía</Link>{index<dashboardPanels.length-1?<button onClick={()=>goToScene(dashboardPanels[index+1].id)}>Siguiente · {dashboardPanels[index+1].label}<ArrowDown size={15}/></button>:<button onClick={()=>goToScene("inicio")}>Volver a mi umbral <ArrowRight size={15}/></button>}</div>
   </section>)}
   <QuickNav currentDay={day} userName={userName||""}/><ToastContainer/>
 </div>;
}
