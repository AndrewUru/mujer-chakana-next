"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { SparklesIcon, StarIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function HomePage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

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
    <main className="min-h-screen bg-[url('/bg-chakana.png')] bg-cover bg-center text-pink-900 px-4 py-2 sm:py-2">
      <div className="max-w-4xl mx-auto rounded-2xl space-y-12 pb-20">
        {/* Fondo blur general */}
        <div className="absolute inset-0 bg-white/50 backdrop-blur-4xl z-0" />

        {/* Contenido principal */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="relative flex flex-col items-center text-center space-y-3 py-2 px-6 max-w-4xl mx-auto z-10"
        >
          {/* Logo circular */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.6, ease: "easeOut" }}
            className="relative w-44 h-44 sm:w-52 sm:h-52 overflow-hidden"
          >
            <Image
              src="/logo_chakana.png"
              alt="Logo Mujer Chakana"
              fill
              priority
              className="object-contain hover:scale-[1.03] transition-transform duration-300"
            />
          </motion.div>

          {/* Descripción con fondo suave y blur */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7, ease: "easeOut" }}
            className="max-w-2xl mx-auto my-10 px-6 py-4 bg-white/60 backdrop-blur-md rounded-3xl shadow-2xl flex flex-col items-center"
          >
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.7 }}
              className="text-3xl sm:text-4xl font-extrabold bg-clip-text bg-gradient-to-r from-rose-700 to-rose-900 text-transparent drop-shadow mb-4 text-center"
            >
              GINERGETICA
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.7 }}
              className="text-lg sm:text-xl text-rose-900 leading-relaxed text-center"
            >
              Una guía para reconectar con tu energía femenina.
            </motion.p>
          </motion.div>

          {/* Botones de acción */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 pt-6"
          >
            <motion.button
              whileHover={{ scale: 1.07 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push("/auth/register")}
              className="group inline-flex items-center justify-center gap-2 px-10 py-4 bg-gradient-to-br from-rose-600 to-rose-700 text-white font-medium rounded-2xl shadow-xl transition"
            >
              <SparklesIcon className="w-6 h-6 group-hover:animate-pulse" />
              <span>Regístrate GRATIS</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.07 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push("/auth/login")}
              className="group inline-flex items-center justify-center gap-2 px-10 py-4 bg-white/60 text-rose-800 font-medium border border-rose-200 rounded-2xl shadow-md hover:bg-white transition"
            >
              <StarIcon className="w-6 h-6 group-hover:animate-spin" />
              <span>Ya tengo cuenta</span>
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Secciones informativas (opcionalmente animadas también) */}
        <motion.section
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
          className="space-y-4 bg-white/60 backdrop-blur-lg p-6 rounded-2xl shadow-md"
        >
          <h2 className="text-2xl font-semibold text-pink-700">
            ¿Qué es esta app?
          </h2>
          <p>
            GINERGETICA es un sistema de autoconocimiento basado en el ciclo
            menstrual, inspirado en la metafísica nativa femenina. Ofrece
            herramientas como el <strong>moonboard</strong>, un mandala lunar
            donde puedes registrar tus emociones, energía y estados internos a
            lo largo del ciclo.
          </p>
          <p>
            La app digitaliza este recorrido sagrado para que cada mujer pueda
            vivir su proceso a su ritmo, con amor y conciencia.
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
          className="space-y-4 bg-white/60 backdrop-blur-lg p-6 rounded-2xl shadow-md"
        >
          <h2 className="text-2xl font-semibold text-pink-700">
            ¿Por qué ofrecemos una suscripción?
          </h2>
          <p>
            Ginergética es un espacio de conexión con la sabiduría cíclica y
            ancestral. Mantenemos funciones esenciales como el{" "}
            <strong>moonboard</strong> y los{" "}
            <strong>registros personales</strong> completamente gratuitas, para
            que cualquier mujer pueda iniciar su camino de autoconocimiento, sin
            barreras.
          </p>
          <p>
            Sin embargo, sostener y hacer crecer esta plataforma implica
            dedicación, amor y recursos. Por eso, hemos creado una suscripción
            accesible de <strong>2,99 €/mes</strong>, que permite cubrir los
            costos técnicos y continuar tejiendo nuevas herramientas, contenidos
            y mejoras.
          </p>
          <p>
            Como agradecimiento, las suscriptoras acceden{" "}
            <strong>de forma anticipada</strong> a nuevos contenidos,{" "}
            <strong>audio-guías</strong> y recursos especiales para profundizar
            su práctica.
          </p>
          <p>
            Tu apoyo hace posible que esta medicina llegue más lejos,
            sosteniendo la misión de reconectar con nuestra naturaleza
            cambiante, intuitiva y luminosa.
          </p>
        </motion.section>

        {/* Créditos y referencia a la creadora */}
        <motion.section
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
          className="mx-auto mt-8 mb-4 max-w-lg w-full flex flex-col items-center bg-white/80 backdrop-blur-lg px-6 py-5 rounded-2xl shadow-md border border-rose-100"
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <svg
              className="w-5 h-5 text-rose-400"
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
            <span className="text-rose-800 text-sm font-medium">
              Esta aplicación ha sido creada por
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-1">
            <a
              href="https://www.samariluz.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-3 py-1 bg-rose-100/80 text-rose-800 font-semibold rounded-xl hover:bg-rose-200 transition text-sm"
            >
              Samari Luz
            </a>
            <span className="text-sm text-rose-800">
              para acompañar y empoderar a mujeres en su viaje de
              autoconocimiento.
            </span>
          </div>
          <span className="block mt-2 text-xs text-pink-400/80 text-center">
            &copy; {new Date().getFullYear()} Ginergética.com · Todos los
            derechos reservados.
          </span>
        </motion.section>
      </div>
    </main>
  );
}
