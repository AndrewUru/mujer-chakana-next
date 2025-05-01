"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { SparklesIcon, StarIcon } from "@heroicons/react/24/outline";

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
    <main className="min-h-screen flex items-center justify-center bg-pink-50/25 text-pink-900">
      <div className="max-w-2xl w-full text-center space-y-6 bg-white/40 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-xl transition-all hover:shadow-2xl">
        {/* Logo con tamaño responsive y efecto sutil */}
        <div className="mx-auto w-32 h-32 sm:w-40 sm:h-40 relative">
          <Image
            src="/logo_chakana.png"
            alt="Logo Mujer Chakana"
            fill
            priority
            sizes="(max-width: 640px) 128px, 160px"
            className="object-contain opacity-95 hover:opacity-100 transition-opacity"
          />
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold text-pink-800 tracking-tight">
          Mujer Chakana
        </h1>

        <p className="text-lg sm:text-xl text-pink-900 leading-relaxed max-w-prose mx-auto">
          Una guía cíclica y espiritual para conectar contigo misma, registrar
          tu energía y florecer desde el alma.
        </p>

        <p className="text-base sm:text-lg font-semibold text-emerald-800 flex items-center justify-center gap-2">
          <span className="text-xl">🌿</span>
          Desde el primer día hasta el retorno, cada ciclo es sagrado.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6">
          <button
            onClick={() => router.push("/auth/register")}
            className="group w-full sm:w-auto px-8 py-3.5 bg-pink-700 hover:bg-pink-800 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-pink-400/50 flex justify-center items-center gap-2"
          >
            <SparklesIcon className="w-5 h-5 group-hover:animate-bounce transition-all" />
            <span className="text-center">Regístrate GRATIS</span>
          </button>

          <button
            onClick={() => router.push("/auth/login")}
            className="group w-full sm:w-auto px-8 py-3.5 border-2 border-pink-600 hover:border-pink-800 bg-white text-pink-800 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex justify-center items-center gap-2"
          >
            <StarIcon className="w-5 h-5 text-pink-700 group-hover:animate-spin transition-all" />
            <span className="text-center">Ya tengo cuenta</span>
          </button>
        </div>
      </div>
    </main>
  );
}
