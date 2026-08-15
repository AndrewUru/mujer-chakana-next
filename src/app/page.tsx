"use client";

import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  Flame,
  Leaf,
  LogIn,
  Moon,
  Sparkles,
  Waves,
  Wind,
} from "lucide-react";
import styles from "./home-story.module.css";

interface StoryScene {
  id: string;
  number: string;
  shortLabel: string;
  image: string;
  imageAlt: string;
  objectPosition?: string;
  accent: string;
  overlay: string;
}

const STORY_SCENES: StoryScene[] = [
  {
    id: "umbral",
    number: "00",
    shortLabel: "Umbral",
    image: "/mujer-chakana.webp",
    imageAlt: "Ilustración de una mujer conectada con la luna y la naturaleza",
    objectPosition: "center 28%",
    accent: "#f7b5c8",
    overlay:
      "linear-gradient(100deg, rgba(35, 7, 22, .94) 2%, rgba(55, 9, 31, .76) 48%, rgba(28, 7, 20, .38) 100%)",
  },
  {
    id: "agua",
    number: "01",
    shortLabel: "Escuchar",
    image: "/agua-ui.webp",
    imageAlt: "Superficie profunda del agua",
    accent: "#88e6ef",
    overlay:
      "linear-gradient(105deg, rgba(3, 26, 38, .96), rgba(4, 61, 76, .72) 56%, rgba(2, 26, 38, .54))",
  },
  {
    id: "fuego",
    number: "02",
    shortLabel: "Nombrar",
    image: "/fuego-ui.webp",
    imageAlt: "Llamas en movimiento",
    accent: "#ffc37a",
    overlay:
      "linear-gradient(100deg, rgba(34, 7, 4, .97), rgba(101, 25, 7, .76) 56%, rgba(47, 8, 3, .58))",
  },
  {
    id: "tierra",
    number: "03",
    shortLabel: "Enraizar",
    image: "/tierra-ui.webp",
    imageAlt: "Textura orgánica de tierra",
    accent: "#e6c07a",
    overlay:
      "linear-gradient(105deg, rgba(25, 17, 8, .97), rgba(73, 43, 15, .74) 58%, rgba(25, 15, 5, .6))",
  },
  {
    id: "cielo",
    number: "04",
    shortLabel: "Integrar",
    image: "/cielo-ui.webp",
    imageAlt: "Nubes doradas atravesadas por la luz",
    accent: "#ffe0b0",
    overlay:
      "linear-gradient(105deg, rgba(38, 26, 34, .94), rgba(79, 55, 66, .66) 54%, rgba(49, 33, 39, .54))",
  },
  {
    id: "altar",
    number: "05",
    shortLabel: "Comenzar",
    image: "/mujer-chakana.webp",
    imageAlt: "Mujer frente a un paisaje lunar",
    objectPosition: "center 28%",
    accent: "#ffd5df",
    overlay:
      "radial-gradient(circle at 50% 34%, rgba(112, 34, 69, .18), rgba(20, 5, 15, .9) 72%), linear-gradient(rgba(31, 5, 20, .68), rgba(18, 3, 12, .94))",
  },
];

const ORACLE_RESPONSES = {
  claridad:
    "Hoy no necesitas resolverlo todo. Nombra una sola verdad y deja que ordene el resto.",
  descanso:
    "Tu pausa no interrumpe el camino: también es camino. Baja el ritmo y escucha lo que permanece.",
  movimiento:
    "La energía quiere circular. Elige un gesto pequeño, hazlo presente y permite que abra espacio.",
};

const MOONBOARD_DAYS = Array.from({ length: 28 }, (_, index) => index + 1);

interface StoryChapterProps {
  scene: StoryScene;
  index: number;
  align?: "left" | "right" | "center";
  onActive: (index: number) => void;
  children: ReactNode;
}

function StoryChapter({
  scene,
  index,
  align = "left",
  onActive,
  children,
}: StoryChapterProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { amount: 0.56 });
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (isInView) onActive(index);
  }, [index, isInView, onActive]);

  const alignmentClass = {
    left: styles.chapterLeft,
    right: styles.chapterRight,
    center: styles.chapterCenter,
  }[align];

  return (
    <section
      ref={ref}
      id={`scene-${scene.id}`}
      className={`${styles.chapter} ${alignmentClass}`}
      aria-labelledby={`title-${scene.id}`}
    >
      <motion.div
        className={styles.chapterInner}
        initial={reduceMotion ? false : { opacity: 0, y: 48 }}
        whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.38 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </section>
  );
}

function OracleMoment() {
  const [prompt, setPrompt] = useState<keyof typeof ORACLE_RESPONSES>("claridad");

  return (
    <div className={styles.oracle} aria-label="Una muestra de la guía de Samari">
      <p className={styles.oracleQuestion}>¿Qué necesita tu energía ahora?</p>
      <div className={styles.oracleChoices}>
        {(Object.keys(ORACLE_RESPONSES) as Array<keyof typeof ORACLE_RESPONSES>).map(
          (choice) => (
            <button
              key={choice}
              type="button"
              className={prompt === choice ? styles.oracleChoiceActive : styles.oracleChoice}
              aria-pressed={prompt === choice}
              onClick={() => setPrompt(choice)}
            >
              {choice}
            </button>
          ),
        )}
      </div>
      <AnimatePresence mode="wait">
        <motion.blockquote
          key={prompt}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
        >
          “{ORACLE_RESPONSES[prompt]}”
        </motion.blockquote>
      </AnimatePresence>
      <p className={styles.oracleNote}>
        Una pequeña muestra. Dentro, Samari conversa con tus propios registros.
      </p>
    </div>
  );
}

function MoonboardOrbit() {
  return (
    <div className={styles.moonboardOrbit} aria-label="Un ciclo lunar de 28 días">
      {MOONBOARD_DAYS.map((day, index) => (
        <span
          key={day}
          className={styles.orbitDay}
          style={{ "--day-index": index } as CSSProperties}
        >
          {day}
        </span>
      ))}
      <div className={styles.orbitCenter}>
        <Moon aria-hidden="true" />
        <span>tu ciclo</span>
      </div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [supabase] = useState(() => createClientComponentClient());
  const [activeScene, setActiveScene] = useState(0);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  const activateScene = useCallback((index: number) => {
    setActiveScene((current) => (current === index ? current : index));
  }, []);

  const goToScene = useCallback(
    (sceneId: string) => {
      document.getElementById(`scene-${sceneId}`)?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
    },
    [reduceMotion],
  );

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted && session) router.replace("/dashboard");
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) router.replace("/dashboard");
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  useEffect(() => {
    const nextScene = STORY_SCENES[activeScene + 1];
    if (!nextScene) return;

    const image = new window.Image();
    image.src = nextScene.image;
  }, [activeScene]);

  const scene = STORY_SCENES[activeScene];

  return (
    <main
      className={styles.story}
      data-story-scene={scene.id}
      style={{ "--scene-accent": scene.accent } as CSSProperties}
    >
      <div className={styles.stage} aria-hidden="true">
        <AnimatePresence mode="sync">
          <motion.div
            key={scene.id}
            className={styles.stageScene}
            initial={reduceMotion ? false : { opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 1.1, ease: "easeOut" }}
          >
            <Image
              src={scene.image}
              alt=""
              fill
              priority={activeScene === 0}
              quality={88}
              sizes="100vw"
              className={styles.stageImage}
              style={{ objectPosition: scene.objectPosition ?? "center" }}
            />
            <div className={styles.stageOverlay} style={{ background: scene.overlay }} />
          </motion.div>
        </AnimatePresence>
        <div className={styles.vignette} />
        <div className={styles.grain} />
        <motion.div
          className={styles.sigil}
          animate={reduceMotion ? undefined : { rotate: activeScene * 18, scale: [1, 1.035, 1] }}
          transition={{ rotate: { duration: 1.1 }, scale: { duration: 8, repeat: Infinity } }}
        />
      </div>

      <div className={styles.storyLayer}>
        <motion.div className={styles.progress} style={{ scaleX: progress }} />

        <div className={styles.storyChrome}>
          <Link href="/" className={styles.brand} aria-label="Mujer Chakana, inicio">
            <span className={styles.brandMark}>✦</span>
            <span>
              Mujer <em>Chakana</em>
            </span>
          </Link>
          <Link href="/login" className={styles.loginLink}>
            <LogIn size={15} aria-hidden="true" />
            Entrar
          </Link>
          <nav className={styles.sceneNav} aria-label="Capítulos de la experiencia">
            {STORY_SCENES.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className={activeScene === index ? styles.sceneNavActive : styles.sceneNavItem}
                aria-current={activeScene === index ? "step" : undefined}
                aria-label={`Ir al capítulo ${item.number}: ${item.shortLabel}`}
                onClick={() => goToScene(item.id)}
              >
                <span>{item.number}</span>
                <strong>{item.shortLabel}</strong>
              </button>
            ))}
          </nav>
        </div>

        <StoryChapter scene={STORY_SCENES[0]} index={0} onActive={activateScene}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Una experiencia cíclica · Capítulo 00</p>
            <h1 id="title-umbral">
              No vienes a medir tus días.
              <em>Vienes a escucharlos.</em>
            </h1>
            <p className={styles.lead}>
              Un espacio íntimo para leer tu energía, reconocer tus ritmos y convertir
              cada vuelta del ciclo en sabiduría propia.
            </p>
            <div className={styles.heroActions}>
              <button type="button" className={styles.primaryAction} onClick={() => goToScene("agua")}>
                Cruzar el umbral
                <ArrowDown size={17} aria-hidden="true" />
              </button>
              <Link href="/register" className={styles.secondaryAction}>
                Crear mi espacio
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </div>
          <p className={styles.scrollWhisper}>
            Desliza para entrar <span>↓</span>
          </p>
        </StoryChapter>

        <StoryChapter scene={STORY_SCENES[1]} index={1} align="right" onActive={activateScene}>
          <div className={styles.splitScene}>
            <div className={styles.sceneCopy}>
              <div className={styles.elementGlyph}>
                <Waves aria-hidden="true" />
              </div>
              <p className={styles.eyebrow}>01 · Escuchar</p>
              <h2 id="title-agua">Todo comienza en lo que sientes.</h2>
              <p>
                Antes de interpretar, registrar. Antes de corregir, sentir. Tu Moonboard
                recoge señales pequeñas para que puedas mirar el ciclo completo.
              </p>
              <div className={styles.whisperList} aria-label="Preguntas para escuchar tu cuerpo">
                <span>¿Cómo habita hoy tu cuerpo?</span>
                <span>¿Dónde se mueve tu energía?</span>
                <span>¿Qué emoción pide espacio?</span>
              </div>
            </div>
            <aside className={styles.miniMoonboard}>
              <span className={styles.moonPhase}>◒</span>
              <div>
                <small>Día 17 · Menguante</small>
                <strong>energía serena</strong>
                <p>escucha · pausa · claridad</p>
              </div>
            </aside>
          </div>
        </StoryChapter>

        <StoryChapter scene={STORY_SCENES[2]} index={2} onActive={activateScene}>
          <div className={styles.fireLayout}>
            <div className={styles.sceneCopy}>
              <div className={styles.elementGlyph}>
                <Flame aria-hidden="true" />
              </div>
              <p className={styles.eyebrow}>02 · Nombrar</p>
              <h2 id="title-fuego">
                Cuando lo nombras,
                <em>la energía cambia.</em>
              </h2>
              <p>
                Samari, tu guía con inteligencia artificial, encuentra patrones en tus
                registros y te devuelve preguntas, no recetas. Una voz para acompañar la tuya.
              </p>
            </div>
            <OracleMoment />
          </div>
        </StoryChapter>

        <StoryChapter scene={STORY_SCENES[3]} index={3} align="right" onActive={activateScene}>
          <div className={styles.earthLayout}>
            <MoonboardOrbit />
            <div className={styles.sceneCopy}>
              <div className={styles.elementGlyph}>
                <Leaf aria-hidden="true" />
              </div>
              <p className={styles.eyebrow}>03 · Enraizar</p>
              <h2 id="title-tierra">Lo que observas se convierte en raíz.</h2>
              <p>
                Día a día aparecen tus mapas: ritmos, repeticiones y recursos. No para
                encasillarte, sino para devolverte contexto cuando más lo necesitas.
              </p>
              <dl className={styles.dataPoem}>
                <div>
                  <dt>28</dt>
                  <dd>días de presencia</dd>
                </div>
                <div>
                  <dt>1</dt>
                  <dd>lenguaje propio</dd>
                </div>
                <div>
                  <dt>∞</dt>
                  <dd>formas de volver</dd>
                </div>
              </dl>
            </div>
          </div>
        </StoryChapter>

        <StoryChapter scene={STORY_SCENES[4]} index={4} onActive={activateScene}>
          <div className={styles.skyLayout}>
            <div className={styles.sceneCopy}>
              <div className={styles.elementGlyph}>
                <Wind aria-hidden="true" />
              </div>
              <p className={styles.eyebrow}>04 · Integrar</p>
              <h2 id="title-cielo">Cada vuelta te devuelve distinta.</h2>
              <p>
                Arquetipos, rituales breves y audios se abren según tu momento. La experiencia
                no te empuja hacia delante: camina contigo en espiral.
              </p>
            </div>
            <div className={styles.constellation} aria-label="Los cuatro elementos de tu camino">
              <span><Waves aria-hidden="true" /> Agua</span>
              <span><Flame aria-hidden="true" /> Fuego</span>
              <span><Leaf aria-hidden="true" /> Tierra</span>
              <span><Wind aria-hidden="true" /> Cielo</span>
            </div>
          </div>
        </StoryChapter>

        <StoryChapter
          scene={STORY_SCENES[5]}
          index={5}
          align="center"
          onActive={activateScene}
        >
          <div className={styles.finalScene}>
            <div className={styles.finalMoon} aria-hidden="true">
              <Sparkles />
            </div>
            <p className={styles.eyebrow}>05 · Comenzar</p>
            <h2 id="title-altar">
              Tu ciclo ya está hablando.
              <em>¿Quieres escucharlo?</em>
            </h2>
            <p>
              Empieza con tu Moonboard y tus registros diarios. Es gratis, íntimo y tuyo.
            </p>
            <div className={styles.heroActions}>
              <Link href="/register" className={styles.primaryAction}>
                Crear mi espacio
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <Link href="/login" className={styles.secondaryAction}>Ya tengo cuenta</Link>
            </div>
            <footer className={styles.storyFooter}>
              <span>Mujer Chakana · 2026</span>
              <span>Diseñado para volver a ti.</span>
            </footer>
          </div>
        </StoryChapter>
      </div>
    </main>
  );
}
