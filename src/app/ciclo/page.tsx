"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndSubscription = async () => {
      // 0. Verificar si el usuario está autenticado
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      // 1. Verificar sesión del usuario
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/auth/login");
        return;
      }

      const userId = session.user.id;

      // 2. Verificar si tiene suscripción activa
      const { data: perfil, error: perfilError } = await supabase
        .from("perfiles") // ← Asegúrate que este es el nombre correcto de la tabla
        .select("suscripcion_activa")
        .eq("user_id", userId)
        .maybeSingle();

      if (perfilError || !perfil?.suscripcion_activa) {
        router.push("/suscripcion"); // Redirigir si no tiene acceso
        return;
      }

      // 3. Si todo está bien, cargar los datos del ciclo
      const { data: cicloData, error: cicloError } = await supabase
        .from("mujer_chakana")
        .select("id, arquetipo, imagen_url")
        .order("id", { ascending: true });

      if (!cicloError) {
        setCiclo(cicloData || []);
      } else {
        console.error("Error al cargar el ciclo:", cicloError.message);
      }

      setLoading(false);
      setAuthChecked(true);
    };

    checkAuthAndSubscription();
  }, [router]);

  // Mientras verifica sesión y suscripción
  if (!authChecked || loading) {
    return (
      <p className="text-center mt-10 text-white text-3xl italic animate-pulse">
        🔒 Verificando acceso...
      </p>
    );
  }
  // Si no tiene suscripción activa, redirigir a la página de suscripción
  if (ciclo.length === 0) {
    return (
      <p className="text-center mt-10 text-white text-3xl italic animate-pulse">
        🚫 No tienes acceso a la galería de arquetipos. Por favor, revisa tu
        suscripción.
      </p>
    );
  }

  // Renderizado normal si pasa el filtro
  return (
    <main className="min-h-screen max-w-7xl mx-auto px-6 py-12 pb-20 space-y-10">
      <section className="text-center bg-amber-50/80 backdrop-blur-md border-pink-200 dark:border-pink-800 shadow-xl rounded-2xl p-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-pink-800">
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
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-pink-900/90 to-transparent text-white text-sm font-semibold py-3 px-2 text-center shadow-md">
              Día {dia.id} · {dia.arquetipo}
            </div>
          </motion.article>
        ))}
      </section>
    </main>
  );
}
