"use client";

import "@/app/globals.css";

export default function ManualPage() {
  return (
    <main className="p-4 md:p-10 max-w-5xl mx-auto flex flex-col gap-6 pb-20">
      <header className="relative text-center bg-pink-100/60 backdrop-blur-md rounded-3xl p-8 shadow-xl overflow-hidden">
        <h1 className="text-4xl md:text-5xl font-extrabold text-pink-800 mb-4 leading-tight">
          🌸 Manual de Usuario <br /> GINERGETICA
        </h1>
        <p className="text-lg md:text-xl text-rose-700 max-w-3xl mx-auto mb-4">
          Bienvenida a <strong>Mujer Chakana</strong>, tu espacio sagrado para
          reconectar con tu ciclo, tus arquetipos y tu energía creadora.
        </p>
        <p className="text-md md:text-lg text-pink-700 max-w-2xl mx-auto">
          Aquí encontrarás toda la guía para explorar tu viaje interior y
          aprovechar todas las herramientas de la plataforma: registros diarios,
          arquetipos, recursos sagrados y mucho más.
        </p>

        {/* Decoración opcional: si quieres agregar un fondo sutil o símbolo */}
        <div className="absolute bottom-0 right-4 opacity-10 text-[8rem] leading-none">
          ✨
        </div>
      </header>

      <section className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-pink-200">
        <h2 className="text-2xl font-semibold text-pink-700 mb-2">
          🌱 Cómo comenzar
        </h2>
        <ul className="list-disc pl-5 space-y-2 text-base">
          <li>Regístrate con tu correo y completa tu perfil inicial.</li>
          <li>Configura tu fecha de inicio del ciclo lunar personal.</li>
          <li>
            Accede al dashboard y comienza a explorar los arquetipos y fases.
          </li>
        </ul>
      </section>

      <section className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-pink-200">
        <h2 className="text-2xl font-semibold text-pink-700 mb-2">
          📂 Recursos descargables
        </h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <a
              href="/mnt/data/INTRO%20MUJER%20CHAKANA.pdf"
              target="_blank"
              className="text-pink-700 underline hover:text-pink-900"
            >
              📄 INTRO GINERGETICA (PDF)
            </a>
          </li>
          <li>
            <a
              href="/mnt/data/Moonboards%20%20MaikU·.pdf"
              target="_blank"
              className="text-pink-700 underline hover:text-pink-900"
            >
              📄 Moonboards MaikU· (PDF)
            </a>
          </li>
        </ul>
      </section>

      <section className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-pink-200">
        <h2 className="text-2xl font-semibold text-pink-700 mb-2">
          🎥 Videos recomendados
        </h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <a
              href="https://www.youtube.com/watch?v=TU_VIDEO_1"
              target="_blank"
              className="text-pink-700 underline hover:text-pink-900"
            >
              ✨ Introducción a la GINERGETICA
            </a>
          </li>
          <li>
            <a
              href="https://www.youtube.com/watch?v=TU_VIDEO_2"
              target="_blank"
              className="text-pink-700 underline hover:text-pink-900"
            >
              🌑 Cómo usar el Moonboard MaikU·
            </a>
          </li>
        </ul>
      </section>

      <section className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-pink-200 space-y-4">
        <h2 className="text-2xl font-semibold text-pink-700 mb-2">
          💎 Contenido Premium
        </h2>
        <p>
          Si deseas profundizar tu viaje cíclico, desbloquea los beneficios
          premium:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-rose-800">
          <li>Lecturas personalizadas de tu ciclo.</li>
          <li>Seguimiento completo con arquetipos y fases.</li>
          <li>
            Acceso prioritario a talleres, meditaciones y comunidad privada.
          </li>
        </ul>

        {/* CTA */}
        <div className="text-center mt-4">
          <a
            href="/suscripcion"
            className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold shadow-lg hover:scale-105 transition-all"
          >
            🌙 Activar mi suscripción y comenzar el viaje
          </a>
        </div>
      </section>
    </main>
  );
}
