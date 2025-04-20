"use client";

//import { useEffect } from "react";
import { useRouter } from "next/navigation";
//import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";

export default function HomePage() {
  const router = useRouter();

  //useEffect(() => {
  //supabase.auth.getSession().then(({ data: { session } }) => {
  //if (session?.user) {
  //router.push("/dashboard");
  //}
  //});
  //}, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-pink-50 text-pink-900 px-4 py-12">
      <div className="max-w-2xl w-full text-center space-y-8 bg-white p-8 rounded-2xl shadow-lg">
        {/* Logo centrado */}
        <Image
          src="/logo_chakana.png"
          alt="Logo Mujer Chakana"
          width={140}
          height={140}
          className="mx-auto mb-2 opacity-95"
        />

        <h1 className="text-4xl font-extrabold text-pink-800">Mujer Chakana</h1>

        <p className="text-md text-pink-600">
          🔵 Una guía cíclica y espiritual para conectar contigo misma,
          registrar tu energía y florecer desde el alma.
        </p>

        <p className="text-base text-green-800">
          🌿 Desde el primer día hasta el retorno, cada ciclo es sagrado.
          Explora tus energías, regístralas y permite que esta herramienta te
          acompañe con dulzura.
        </p>

        <p className="text-sm italic text-pink-600">
          “Cuando me escucho, recuerdo quién soy.”
        </p>

        <div className="flex justify-center gap-4 pt-4">
          <button
            onClick={() => router.push("/auth/register")}
            className="flex items-center gap-2 px-5 py-2 bg-pink-700 text-white rounded-lg hover:bg-pink-800 transition"
          >
            ✨ Registrate
          </button>
          <button
            onClick={() => router.push("/auth/login")}
            className="px-5 py-2 border border-pink-400 text-pink-700 rounded-lg hover:bg-pink-100 transition"
          >
            Ya tengo cuenta
          </button>
          <button
            onClick={() => router.push("/manual")}
            className="px-5 py-2 text-sm text-pink-600 underline hover:text-pink-800 transition"
          >
            📘 Ver Manual de Usuario
          </button>
        </div>
      </div>
    </main>
  );
}
