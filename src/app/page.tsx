"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  SparklesIcon,
  StarIcon,
  MoonIcon,
  HeartIcon,
  PlayCircleIcon,
  BookOpenIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function HomePage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const highlights = [
    {
      title: "Moonboard consciente",
      description:
        "Registra tus emociones y honra tu ritmo interior con un mandala lunar interactivo.",
      icon: MoonIcon,
    },
    {
      title: "Rituales vivos",
      description:
        "Activa prácticas y audio-guías alineadas con cada fase del ciclo para nutrir tu presencia.",
      icon: PlayCircleIcon,
    },
    {
      title: "Acompañamiento amoroso",
      description:
        "Recibe recordatorios, reflexiones y materiales que sostienen cada momento de tu proceso.",
      icon: HeartIcon,
    },
  ];

  const journeySteps = [
    {
      title: "Llega a tu altar digital",
      description:
        "Crea tu espacio personal y accede al moonboard gratuito para comenzar a observarte.",
    },
    {
      title: "Observa tu ciclo con claridad",
      description:
        "Registra energía, emociones y corporalidad para reconocer patrones y necesidades.",
    },
    {
      title: "Profundiza cuando lo sientas",
      description:
        "Suscríbete para activar audio-guías, rituales y nuevos contenidos antes que nadie.",
    },
  ];

  const subscriptionPerks = [
    {
      title: "Funcionalidades anticipadas",
      description:
        "Accede primero a herramientas, contenidos y mejoras que vamos tejiendo cada mes.",
      icon: SparklesIcon,
    },
    {
      title: "Guías y rituales exclusivos",
      description:
        "Explora audio-guías, ceremonias y propuestas profundas para cada momento del ciclo.",
      icon: BookOpenIcon,
    },
    {
      title: "Sostén a la comunidad",
      description:
        "Con tu aporte de 2,99 €/mes ayudas a mantener la plataforma y a expandir su medicina.",
      icon: CheckBadgeIcon,
    },
  ];

  useEffect(() => {
    let active = true;

    const handleRedirectIfLoggedIn = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (active && session) {
        router.replace("/dashboard");
      }
    };

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (active && session) {
          router.replace("/dashboard");
        }
      }
    );

    handleRedirectIfLoggedIn();

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [router, supabase]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[url('/mujer-chakana.webp')] bg-cover bg-center text-pink-900">
      <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/70 to-rose-100/60 backdrop-blur-3xl" />
      <motion.div
        initial={{ opacity: 0.3, scale: 0.9 }}
        animate={{ opacity: 0.45, scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="pointer-events-none absolute -top-28 right-0 h-80 w-80 rounded-full bg-rose-200/40 blur-3xl"
      />
      <motion.div
        initial={{ opacity: 0.3, scale: 0.9 }}
        animate={{ opacity: 0.5, scale: 1 }}
        transition={{ duration: 2.4, ease: "easeOut" }}
        className="pointer-events-none absolute -bottom-32 left-0 h-96 w-96 rounded-full bg-rose-100/60 blur-3xl"
      />

      <div className="relative z-10 px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-16 pb-20">
          <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="flex flex-col items-center gap-4 rounded-2xl border border-rose-100/60 bg-white/60 px-5 py-4 text-center shadow-md backdrop-blur-lg sm:flex-row sm:justify-between sm:text-left"
          >
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.35em] text-rose-500">
                Ginergética
              </span>
              <p className="text-lg font-semibold text-rose-900 sm:text-xl">
                Sabiduría en cada fase de tu ciclo
              </p>
            </div>
            <p className="max-w-md text-sm text-rose-700 sm:text-base">
              Una guía digital para cultivar tu energía femenina y honrar tus
              ritmos naturales.
            </p>
          </motion.nav>

          <motion.section
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="relative grid gap-10 rounded-[32px] border border-rose-100/70 bg-white/70 p-8 shadow-2xl backdrop-blur-xl sm:p-12 lg:grid-cols-[1.05fr_0.95fr]"
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
              className="space-y-6 text-center lg:text-left"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-100/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-rose-600">
                Ritual cotidiano
              </span>
              <h1 className="text-3xl font-extrabold leading-tight text-rose-950 sm:text-4xl lg:text-5xl">
                Reconecta con tu energía cíclica desde un altar digital vivo.
              </h1>
              <p className="text-base leading-relaxed text-rose-800 sm:text-lg">
                Ginergética reúne la metafísica nativa femenina con la
                tecnología consciente. Observa tu moonboard, registra tus
                sensaciones y recibe guía amorosa para transitar cada fase con
                más claridad y autocuidado.
              </p>
              <div className="flex flex-col items-center gap-4 pt-6 sm:flex-row sm:justify-center lg:justify-start">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => router.push("/auth/register")}
                  className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-rose-600 via-rose-700 to-rose-800 px-9 py-4 text-base font-semibold text-white shadow-xl transition"
                >
                  <SparklesIcon className="h-6 w-6 transition group-hover:scale-110 group-hover:text-rose-100" />
                  <span>Regístrate gratis</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => router.push("/auth/login")}
                  className="group inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-white/70 px-8 py-4 text-base font-semibold text-rose-700 shadow-sm transition hover:bg-white"
                >
                  <StarIcon className="h-6 w-6 text-rose-500 transition group-hover:text-rose-600" />
                  <span>Ya tengo cuenta</span>
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.7, ease: "easeOut" }}
              className="relative flex items-center justify-center"
            >
              <div className="relative h-94 w-full max-w-sm overflow-hidden rounded-[28px] border border-rose-100 bg-gradient-to-br from-white/80 via-rose-50/70 to-rose-100/60 shadow-xl backdrop-blur-xl sm:h-72">
                <Image
                  src="/mujer-chakana.webp"
                  alt="Logo Mujer Chakana"
                  fill
                  priority
                  className="object-cover object-top scale-110 transition-transform duration-500 hover:scale-115"
                />
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.6, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.7, ease: "easeOut" }}
                className="absolute -bottom-6 left-8 h-24 w-24 rounded-full bg-rose-200/50 blur-2xl"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.6, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.7, ease: "easeOut" }}
                className="absolute -top-8 right-6 h-28 w-28 rounded-full bg-rose-100/70 blur-2xl"
              />
            </motion.div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: 0.1, duration: 0.8, ease: "easeOut" }}
            className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]"
          >
            <div className="space-y-4 rounded-3xl border border-rose-100 bg-white/70 p-8 shadow-lg backdrop-blur-lg">
              <h2 className="text-2xl font-semibold text-rose-900 sm:text-3xl">
                ¿Qué es esta app?
              </h2>
              <p className="text-base leading-relaxed text-rose-800">
                Ginergética es un sistema de autoconocimiento basado en el ciclo
                menstrual, inspirado en la metafísica nativa femenina. Ofrece
                herramientas como el <strong>moonboard</strong>, un mandala
                lunar donde registras emociones, energía y estados internos a lo
                largo del ciclo.
              </p>
              <p className="text-base leading-relaxed text-rose-800">
                Digitalizamos este recorrido sagrado para que habites cada fase
                a tu ritmo, con amor y conciencia, integrando saberes
                ancestrales a tu día a día.
              </p>
              <motion.blockquote
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="rounded-2xl border border-rose-100 bg-rose-50/70 px-6 py-5 text-sm italic text-rose-700"
              >
                “Tu sabiduría es cíclica: cada vuelta te muestra un rostro nuevo
                de ti. Aquí encuentras un espejo para abrazarlo.”
              </motion.blockquote>
            </div>

            <div className="grid gap-4">
              {highlights.map(({ title, description, icon: Icon }) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="flex flex-col gap-3 rounded-3xl border border-rose-100 bg-white/60 p-6 shadow-md backdrop-blur-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100">
                      <Icon className="h-6 w-6 text-rose-500" />
                    </span>
                    <h3 className="text-lg font-semibold text-rose-900">
                      {title}
                    </h3>
                  </div>
                  <p className="text-sm leading-relaxed text-rose-700">
                    {description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: 0.15, duration: 0.7, ease: "easeOut" }}
            className="rounded-3xl border border-rose-100 bg-white/70 p-8 shadow-lg backdrop-blur-lg"
          >
            <div className="mb-8 space-y-2 text-center">
              <h2 className="text-2xl font-semibold text-rose-900 sm:text-3xl">
                Tu recorrido cíclico dentro de Ginergética
              </h2>
              <p className="text-base text-rose-700">
                Un proceso simple para volver a habitarte con presencia.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              {journeySteps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="flex flex-col gap-3 rounded-3xl border border-rose-100 bg-white/80 p-6 text-center shadow-md"
                >
                  <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-sm font-semibold text-rose-600">
                    {index + 1}
                  </span>
                  <h3 className="text-lg font-semibold text-rose-900">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-rose-700">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: 0.2, duration: 0.7, ease: "easeOut" }}
            className="grid gap-8 lg:grid-cols-[1fr_1fr]"
          >
            <div className="space-y-4 rounded-3xl border border-rose-100 bg-white/70 p-8 shadow-lg backdrop-blur-lg">
              <h2 className="text-2xl font-semibold text-rose-900 sm:text-3xl">
                ¿Por qué ofrecemos una suscripción?
              </h2>
              <p className="text-base leading-relaxed text-rose-800">
                Ginergética es un espacio de conexión con la sabiduría cíclica y
                ancestral. Mantenemos funciones esenciales como el{" "}
                <strong>moonboard</strong> y los{" "}
                <strong>registros personales</strong> totalmente gratuitos, para
                que cualquier mujer pueda iniciar su camino de autoconocimiento
                sin barreras.
              </p>
              <p className="text-base leading-relaxed text-rose-800">
                Sostener y hacer crecer esta plataforma implica dedicación, amor
                y recursos. Por eso, creamos una suscripción accesible de{" "}
                <strong>2,99 €/mes</strong> que permite cubrir los costos
                técnicos y continuar tejiendo nuevas herramientas, contenidos y
                mejoras.
              </p>
              <p className="text-base leading-relaxed text-rose-800">
                Como agradecimiento, las suscriptoras disfrutan de lanzamientos
                anticipados, audio-guías y recursos especiales para profundizar
                su práctica.
              </p>
            </div>

            <div className="grid gap-4">
              {subscriptionPerks.map(({ title, description, icon: Icon }) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="flex gap-4 rounded-3xl border border-rose-100 bg-white/60 p-6 shadow-md backdrop-blur-lg"
                >
                  <span className="mt-1 flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100">
                    <Icon className="h-6 w-6 text-rose-500" />
                  </span>
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-semibold text-rose-900">
                      {title}
                    </h3>
                    <p className="text-sm leading-relaxed text-rose-700">
                      {description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20px" }}
            transition={{ delay: 0.25, duration: 0.7, ease: "easeOut" }}
            className="mx-auto w-full max-w-2xl rounded-3xl border border-rose-100 bg-white/80 px-6 py-6 text-center shadow-lg backdrop-blur-lg"
          >
            <div className="flex flex-col items-center justify-center gap-3">
              <svg
                className="h-6 w-6 text-rose-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 21C12 21 7 16.5 4.5 13.5C2 10.5 3 7 6 5C8.5 3.5 12 6.5 12 6.5C12 6.5 15.5 3.5 18 5C21 7 22 10.5 19.5 13.5C17 16.5 12 21 12 21Z"
                />
              </svg>
              <span className="text-sm font-medium text-rose-700">
                Esta aplicación ha sido creada por
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <a
                  href="https://www.samariluz.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded-xl bg-rose-100/80 px-4 py-1.5 text-sm font-semibold text-rose-800 transition hover:bg-rose-200"
                >
                  Samari Luz
                </a>
                <span className="text-sm text-rose-800">
                  para acompañar y empoderar a mujeres en su viaje de
                  autoconocimiento.
                </span>
              </div>
              <span className="mt-2 block text-xs text-pink-400/80">
                &copy; {new Date().getFullYear()} Ginergética.com · Todos los
                derechos reservados.
              </span>
            </div>
          </motion.section>
        </div>
      </div>
    </main>
  );
}
