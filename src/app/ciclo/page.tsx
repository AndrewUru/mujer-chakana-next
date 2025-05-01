"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { motion } from "framer-motion";

interface MujerChakanaData {
  id: number;
  arquetipo: string;
  imagen_url?: string;
}

export default function CicloPage() {
  const [ciclo, setCiclo] = useState<MujerChakanaData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCiclo = async () => {
      const { data, error } = await supabase
        .from("mujer_chakana")
        .select("id, arquetipo, imagen_url")
        .order("id", { ascending: true });

      if (error) {
        console.error("Error al cargar el ciclo:", error.message);
      } else {
        setCiclo(data);
      }

      setLoading(false);
    };

    fetchCiclo();
  }, []);

  return (
    <main className="min-h-screen max-w-7xl mx-auto px-6 py-12 space-y-10">
      <section className="text-center bg-amber-50/80 backdrop-blur-md border-pink-200 dark:border-pink-800 shadow-xl rounded-2xl p-6">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-pink-800">
          🌕 Galería de Arquetipos
        </h1>
        <p className="text-pink-600 mt-4 max-w-2xl mx-auto text-base sm:text-lg">
          Explora los 28 arquetipos del ciclo Chakana, cada uno con su energía
          única para acompañarte día a día.
        </p>
        <p className="text-pink-700 mt-2 italic">
          Recuerda que cada día trae un mensaje de tu sabiduría ancestral.
        </p>
      </section>

      {loading ? (
        <p className="text-center mt-10 text-pink-600 text-lg italic animate-pulse">
          🌙 Cargando galería de arquetipos...
        </p>
      ) : (
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {ciclo.map((dia) => (
            <motion.article
              key={dia.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              viewport={{ once: true }}
              className="relative overflow-hidden rounded-2xl shadow-lg border border-pink-200 group aspect-square bg-white"
            >
              {dia.imagen_url ? (
                <Image
                  src={dia.imagen_url}
                  alt={`Día ${dia.id}: Arquetipo ${dia.arquetipo}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-pink-100 text-pink-600 text-sm">
                  Sin imagen
                </div>
              )}

              {/* Fondo oscuro para contraste */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-pink-900/90 to-transparent text-white text-sm font-semibold py-3 px-2 text-center shadow-md">
                Día {dia.id} · {dia.arquetipo}
              </div>
            </motion.article>
          ))}
        </section>
      )}
    </main>
  );
}
