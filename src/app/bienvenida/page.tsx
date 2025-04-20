"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Bienvenida() {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      // redirecciona en 10 seg si no clickea
      router.prefetch("/dashboard");
    }, 10000);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex flex-col justify-center items-center text-center text-pink-800 p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2 }}
        className="max-w-xl"
      >
        <Image
          src="/luna-llena.png" // pon tu imagen lunar aquí
          alt="Luna Chakana"
          width={120}
          height={120}
          className="mx-auto mb-6 animate-pulse"
        />
        <h1 className="text-3xl font-bold mb-4">🌕 Bienvenida al círculo</h1>
        <p className="text-lg leading-relaxed">
          Has comenzado un viaje de 28 días hacia ti misma. Desde el agua que
          purifica, hasta el fuego que transforma, honrarás tu ritmo sagrado con
          cada paso.
        </p>

        <p className="mt-4 text-sm text-pink-600 italic">
          Que la Chakana Rubí guíe tu corazón en espiral.
        </p>

        <button
          onClick={() => router.push("/dashboard")}
          className="mt-8 bg-pink-700 text-white px-6 py-2 rounded-lg hover:bg-pink-800 transition"
        >
          🌸 Iniciar mi camino
        </button>
      </motion.div>
    </div>
  );
}
