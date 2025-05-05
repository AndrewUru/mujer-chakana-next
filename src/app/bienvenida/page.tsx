"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import EstrellasFondo from "@/components/EstrellasFondo";

export default function BienvenidaPage() {
  const router = useRouter();

  const isLoggedIn = true;

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.prefetch("/dashboard");
    }, 5000);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="relative h-screen bg-cover bg-center flex flex-col justify-center bg-pink-50/25 items-center text-center text-pink-800 px-4 py-8 overflow-hidden">
      {isLoggedIn && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="w-full max-w-md space-y-6 z-10"
        >
          {/* Fondo de estrellas y cometas */}
          <div className="absolute inset-0 z-10">
            <EstrellasFondo />
          </div>
          <Image
            src="/logo_chakana.png"
            alt="Luna Chakana"
            width={180}
            height={180}
            className="mx-auto mb-4 animate-pulse"
          />
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-amber-50">
            Bienvenida al círculo
          </h1>
          <p className="text-base md:text-lg leading-relaxed text-amber-50">
            Has comenzado un viaje de 28 días hacia ti misma. Desde el agua que
            purifica, hasta el fuego que transforma, honrarás tu ritmo sagrado
            con cada paso.
          </p>
          <p className="mt-2 text-xs md:text-sm text-amber-50 italic">
            Que la Chakana Rubí guíe tu corazón en espiral.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-6 bg-pink-700 text-white py-3 px-6 rounded-full hover:bg-pink-800 transition"
          >
            🌸 Continuar mi camino
          </button>
        </motion.div>
      )}
    </div>
  );
}
