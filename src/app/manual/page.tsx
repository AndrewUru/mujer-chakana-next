// src/app/manual/page.tsx
"use client";

import "@/app/globals.css";

export default function ManualPage() {
  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold text-pink-800 mb-4">
        Manual de Usuario
      </h1>

      <p className="text-lg  mb-4">
        ¡Bienvenida a <strong>Mujer Chakana</strong>! Esta app fue creada como
        una guía cíclica y espiritual para reconectar contigo misma.
      </p>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-pink-700 mb-2">
          🌱 Cómo comenzar
        </h2>
        <ul className="list-disc pl-5 text-base">
          <li>Regístrate con tu correo y crea tu perfil.</li>
          <li>Accede al contenido gratuito para comenzar tu camino.</li>
          <li>Explora las funciones del ciclo, dashboard y perfil.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-pink-700 mb-2">
          💎 Contenido Premium
        </h2>
        <p>
          Algunas herramientas están disponibles solo para suscriptoras premium,
          como:
        </p>
        <ul className="list-disc pl-5">
          <li>Lecturas personalizadas.</li>
          <li>Seguimiento de tu ciclo lunar y menstrual con arquetipos.</li>
          <li>Acceso anticipado a talleres y meditaciones.</li>
        </ul>
      </section>

      <footer className="text-green-800 mt-10">
        🌸 Que esta herramienta te acompañe en el retorno a tu energía sagrada
        🌸
      </footer>
    </main>
  );
}
