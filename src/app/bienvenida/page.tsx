"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";

export default function BienvenidaPage() {
  const router = useRouter();
  const [inicioCiclo, setInicioCiclo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInicioCiclo() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/"); // Redirigir si no está logueada
        return;
      }

      const { data, error } = await supabase
        .from("perfiles")
        .select("inicio_ciclo")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error obteniendo el perfil:", error.message);
      } else {
        setInicioCiclo(data?.inicio_ciclo || null);
      }

      setLoading(false);
    }

    fetchInicioCiclo();
    router.prefetch("/dashboard");
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-pink-700">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center text-center text-pink-800 px-4 py-8 overflow-hidden">
      <Image
        src="/fondo_chakana_sutil.png" // opcional si tienes fondo
        alt=""
        fill
        className="object-cover opacity-10 absolute z-0"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="w-full max-w-md space-y-6 z-10 backdrop-blur-sm bg-white/60 rounded-3xl p-6 shadow-xl border border-pink-200"
      >
        <Image
          src="/logo_chakana.png"
          alt="Luna Chakana"
          width={160}
          height={160}
          className="mx-auto mb-2 animate-pulse"
        />

        <h1 className="text-3xl font-bold text-pink-800">
          Bienvenida al círculo
        </h1>

        <p className="text-base leading-relaxed text-pink-700">
          Has comenzado un viaje de <strong>28 días</strong> hacia ti misma.
          Desde el agua que purifica hasta el fuego que transforma, honrarás tu
          ritmo sagrado con cada paso.
        </p>

        <p className="mt-2 text-sm text-pink-600 italic">
          Que la Chakana Rubí guíe tu corazón en espiral.
        </p>

        {/* 🔥 Advertencia si falta el inicio de ciclo */}
        {!inicioCiclo && (
          <div className="p-3 bg-yellow-100 border-l-4 border-yellow-400 text-yellow-800 rounded-md text-sm">
            ⚠️ Recuerda registrar tu <strong>fecha de comienzo de ciclo</strong>{" "}
            para que el sistema funcione correctamente.
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push("/dashboard")}
          className="mt-4 bg-pink-700 text-white py-3 px-6 rounded-full hover:bg-pink-800 transition"
        >
          🌸 Continuar mi camino
        </motion.button>
      </motion.div>
    </div>
  );
}
