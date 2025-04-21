"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function BienvenidaPage() {
  const router = useRouter();

  // 🚨 Aquí pon tu lógica de autenticación real más adelante
  const isLoggedIn = true;

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.prefetch("/dashboard");
    }, 10000);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex flex-col justify-center items-center text-center text-pink-800 p-6">
      {isLoggedIn && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2 }}
          className="max-w-xl"
        >
          <Image
            src="/logo_chakana.png"
            alt="Luna Chakana"
            width={220}
            height={220}
            className="mx-auto mb-6 animate-pulse"
          />
          <h1 className="text-3xl font-bold mb-4">Bienvenida al círculo</h1>
          <p className="text-lg leading-relaxed">
            Has comenzado un viaje de 28 días hacia ti misma. Desde el agua que
            purifica, hasta el fuego que transforma, honrarás tu ritmo sagrado
            con cada paso.
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
      )}
    </div>
  );
}
