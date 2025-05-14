"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { SparklesIcon, StarIcon } from "@heroicons/react/24/outline";

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[url('/bg-chakana.png')] bg-cover bg-center rounded-2xl text-pink-900 px-4 py-2 sm:py-2 relative pb-30">
      <div className="max-w-4xl mx-auto rounded-2xl space-y-12">
        {/* Logo y bienvenida - Versión Mejorada */}
        <div className="relative overflow-hidden">
          {/* Luna atravesando el fondo oscuro */}
          <div className="absolute inset-0 bg-transparent z-[-1] overflow-hidden">
            <div className="absolute top-1/2 -translate-y-1/2 w-20 h-20 animate-[moon-pass_10s_linear_infinite]">
              <Image
                src="/luna.png"
                alt="Luna fondo"
                width={566}
                height={566}
                className="object-contain opacity-30 blur-sm"
              />
            </div>
          </div>
          {/* Fondo blur general */}
          <div className="absolute inset-0 bg-white/50 backdrop-blur-4xl z-0" />

          {/* Fondos decorativos con luces suaves */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-rose-200 opacity-30 rounded-full blur-[120px] z-0" />
          <div className="absolute top-1/2 -right-20 w-72 h-72 bg-rose-300 opacity-20 rounded-full blur-[100px] z-0" />

          {/* Luna atravesando el fondo oscuro */}
          <div className="absolute inset-0 bg-transparent z-[-1] blur-md overflow-hidden">
            <div className="absolute top-1/2 -translate-y-1/2 w-20 h-20 animate-[moon-pass_10s_linear_infinite]">
              <Image
                src="/luna.png"
                alt="Luna fondo"
                width={566}
                height={566}
                className="object-contain opacity-60 blur-sm"
              />
            </div>
          </div>

          {/* Contenido principal */}
          <div className="relative flex flex-col items-center text-center space-y-8 py-8 px-6 rounded-2xl max-w-4xl mx-auto z-10">
            {/* Logo circular con glow y sombra */}
            <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full backdrop-blur-lg overflow-hidden">
              <Image
                src="/logo_chakana.png"
                alt="Logo Mujer Chakana"
                fill
                priority
                className="object-contain p-4 rounded-full hover:scale-[1.03] transition-transform duration-300"
              />
            </div>

            {/* Título con imagen de luna */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-700 to-rose-900 flex items-center gap-4 drop-shadow-lg">
              Mujer Chakana
            </h1>

            {/* Descripción con fondo suave y blur */}
            <p className="text-lg sm:text-xl text-rose-900 max-w-2xl bg-white/50 backdrop-blur-md px-8 py-5 rounded-2xl shadow-md leading-relaxed">
              Una guía espiritual y cíclica para reconectar con tu sabiduría
              femenina a través del registro emocional, creativo y lunar.
            </p>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                onClick={() => router.push("/auth/register")}
                className="group inline-flex items-center justify-center gap-2 px-10 py-4 bg-gradient-to-br from-rose-600 to-rose-700 text-white font-medium rounded-2xl shadow-xl hover:scale-105 transition transform active:scale-95"
              >
                <SparklesIcon className="w-6 h-6 group-hover:animate-pulse" />
                <span>Regístrate GRATIS</span>
              </button>

              <button
                onClick={() => router.push("/auth/login")}
                className="group inline-flex items-center justify-center gap-2 px-10 py-4 bg-white/60 text-rose-800 font-medium border border-rose-200 rounded-2xl shadow-md hover:bg-white hover:scale-105 transition transform active:scale-95"
              >
                <StarIcon className="w-6 h-6 group-hover:animate-spin" />
                <span>Ya tengo cuenta</span>
              </button>
            </div>
          </div>
        </div>

        {/* Qué es esta app */}
        <section className="space-y-4 bg-white/60 backdrop-blur-lg p-6 rounded-2xl shadow-md">
          <h2 className="text-2xl font-semibold text-pink-700">
            ¿Qué es esta app?
          </h2>
          <p>
            Mujer Chakana es un sistema de autoconocimiento basado en el ciclo
            menstrual, inspirado en la metafísica nativa femenina. Ofrece
            herramientas como el <strong>moonboard</strong>, un mandala lunar
            donde puedes registrar tus emociones, energía y estados internos a
            lo largo del ciclo.
          </p>
          <p>
            La app digitaliza este recorrido sagrado para que cada mujer pueda
            vivir su proceso a su ritmo, con amor y conciencia.
          </p>
        </section>

        {/* Suscripción y precio */}
        <section className="space-y-4 bg-white/60 backdrop-blur-lg p-6 rounded-2xl shadow-md">
          <h2 className="text-2xl font-semibold text-pink-700">
            ¿Por qué una suscripción?
          </h2>
          <p>
            El mantenimiento, desarrollo y expansión de esta app requiere
            tiempo, amor y recursos. Hemos decidido fijar un precio accesible de{" "}
            <strong>2,99€/mes</strong> para cubrir costos técnicos y seguir
            mejorándola.
          </p>
          <p>
            Esta contribución no solo mantiene vivo el proyecto, también apoya
            la misión de expandir el conocimiento cíclico y ancestral que tanto
            necesitamos recuperar.
          </p>
        </section>

        {/* Código abierto */}
        <section className="space-y-4 bg-white/60 backdrop-blur-lg p-6 rounded-2xl shadow-md">
          <h2 className="text-2xl font-semibold text-pink-700">
            Código abierto 🌱
          </h2>
          <p>
            Hemos liberado el código de Mujer Chakana en{" "}
            <a
              href="https://github.com/AndrewUru/mujer-chakana-next"
              className="underline text-rose-700"
              target="_blank"
            >
              GitHub
            </a>{" "}
            para que cualquier persona pueda aportar, mejorar, o incluso crear
            su propia versión de esta herramienta.
          </p>
          <p>
            Si te inspira esta misión, te invitamos a unirte como colaboradora,
            programadora o multiplicadora del conocimiento.
          </p>
        </section>
      </div>
    </main>
  );
}
