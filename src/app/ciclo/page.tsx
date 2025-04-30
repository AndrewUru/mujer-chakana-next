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

  if (loading)
    return (
      <p className="text-center mt-10 text-pink-600 text-lg italic">
        🌙 Cargando galería de arquetipos...
      </p>
    );

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-pink-800">
          🌕 Galería de Arquetipos
        </h1>
        <p className="text-pink-600 mt-2 max-w-xl mx-auto text-base">
          Explora los 28 arquetipos del ciclo Chakana, cada uno con su energía
          única para acompañarte día a día.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {ciclo.map((dia) => (
          <motion.div
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
                alt={`Día ${dia.id}: ${dia.arquetipo}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-pink-100 text-pink-600 text-sm">
                Sin imagen
              </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-pink-900/80 to-transparent text-white text-sm font-semibold py-3 px-2 text-center">
              Día {dia.id} · {dia.arquetipo}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
