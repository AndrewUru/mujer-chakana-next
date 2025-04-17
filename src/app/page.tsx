"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        router.push("/dashboard");
      }
    });
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-pink-50 text-pink-900 px-4 py-12">
      <div className="max-w-xl w-full text-center space-y-6">
        <h1 className="text-5xl font-extrabold tracking-tight">
          Mujer Chakana
        </h1>

        <p className="text-lg text-pink-700">
          Bienvenida a tu espacio de reconexión cíclica. Aquí cada día te ofrece
          una oportunidad para escucharte, escribirte y florecer desde adentro.
        </p>

        <p className="text-base">
          🌿 Desde el primer día hasta el retorno, cada ciclo es sagrado.
          Explora tus energías, regístralas y permite que esta herramienta te
          acompañe con dulzura.
        </p>

        <p className="text-sm italic text-pink-600">
          “Cuando me escucho, recuerdo quién soy.”
        </p>

        <button
          onClick={() => router.push("/dashboard")}
          className="mt-4 px-6 py-2 bg-pink-700 text-white rounded-lg hover:bg-pink-800 transition"
        >
          Comenzar mi viaje ✨
        </button>
      </div>
    </main>
  );
}
