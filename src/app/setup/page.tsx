"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import SetupPerfil from "@/components/SetupPerfil";

export default function SetupPage() {
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/"); // 🔁 Redirige a la home si no está logueado
      }
    }

    checkAuth();
  }, [router]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-pink-100 flex flex-col items-center text-pink-900 px-4 py-12">
      <div className="max-w-xl w-full text-center space-y-6 mb-10">
        <h1 className="text-3xl font-bold">🌕 Estás comenzando tu viaje</h1>

        <p className="text-base">
          Configura tu perfil para que esta herramienta te acompañe en tu
          recorrido personal y energético.
        </p>

        <p className="italic text-pink-600">
          “Cada ciclo es una oportunidad para florecer.”
        </p>
      </div>

      <section className="w-full max-w-lg space-y-10">
        <SetupPerfil />
      </section>
    </main>
  );
}
