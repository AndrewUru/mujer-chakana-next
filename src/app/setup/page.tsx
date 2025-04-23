"use client";

import SetupPerfil from "@/components/SetupPerfil";

export default function SetupPage() {
  return (
    <main className="min-h-screen bg-pink-50 flex flex-col items-center justify-center text-pink-900 px-4 py-12">
      <div className="max-w-xl w-full text-center space-y-6">
        <h1 className="text-3xl font-bold">🌕 Estás comenzando tu viaje</h1>

        <p className="text-base text-pink-700">
          Bienvenida a Mujer Chakana. Este es tu espacio de reconexión.
        </p>

        <p className="text-base">
          Configura tu perfil para que esta herramienta te acompañe en tu
          recorrido personal y energético.
        </p>

        <p className="italic text-pink-600">
          “Cada ciclo es una oportunidad para florecer.”
        </p>
      </div>

      <div className="mt-8 w-full max-w-lg">
        <SetupPerfil />
      </div>
    </main>
  );
}
