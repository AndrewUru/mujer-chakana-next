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

      if (!user) router.push("/");
    }

    checkAuth();
  }, [router]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-pink-100 flex flex-col items-center justify-start px-6 py-12">
      <div className="max-w-2xl w-full space-y-10">
        <header className="text-center">
          <h1 className="text-4xl font-extrabold text-pink-800 mb-3 tracking-tight">
            🌕 Conecta con tu Ciclo
          </h1>

          <p className="text-lg text-pink-700">
            Para comenzar tu recorrido, necesitamos saber en qué momento estás
            de tu ciclo lunar personal. Esta fecha será la base para acompañarte
            con mensajes, rituales y arquetipos sincronizados con la luna.
          </p>

          <p className="italic text-pink-500 mt-4">
            “Cuando eliges tu inicio, el universo te acompaña.” ✨
          </p>
        </header>

        <section className="bg-white/70 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-pink-200">
          <h2 className="text-2xl font-semibold text-pink-700 mb-4 text-center">
            📅 Configura la fecha de inicio de tu ciclo
          </h2>
          <SetupPerfil />
        </section>
      </div>
    </main>
  );
}
