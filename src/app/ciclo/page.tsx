"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { motion } from "framer-motion";

interface MujerChakanaData {
  id: number;
  dia_ciclo: number;
  semana: number;
  arquetipo: string;
  descripcion: string;
  imagen_url?: string;
  elemento: string;
  audio_url?: string;
  ritual_pdf?: string;
  tip_extra?: string;
}

export default function CicloPage() {
  const [ciclo, setCiclo] = useState<MujerChakanaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndSubscription = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth/login");
        return;
      }

      const userId = session.user.id;

      const { data: perfil, error: perfilError } = await supabase
        .from("perfiles")
        .select("suscripcion_activa")
        .eq("user_id", userId)
        .maybeSingle();

      if (perfilError || !perfil?.suscripcion_activa) {
        router.push("/suscripcion");
        return;
      }

      const { data: cicloData, error: cicloError } = await supabase
        .from("mujer_chakana")
        .select(
          "id, dia_ciclo, semana, arquetipo, descripcion, imagen_url, elemento, audio_url, ritual_pdf, tip_extra"
        )
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

  if (!authChecked || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-100 via-amber-100 to-pink-100">
        <p className="text-2xl text-pink-700 animate-pulse italic">
          🔒 Verificando acceso...
        </p>
      </div>
    );
  }

  if (ciclo.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <p className="text-xl text-red-700 text-center">
          🚫 No tienes acceso a la galería de arquetipos. <br />
          Por favor, revisa tu suscripción.
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen py-12 px-6 pb-40">
      <section className="max-w-5xl mx-auto text-center bg-white/80 backdrop-blur-md border border-rose-200 rounded-3xl shadow-2xl px-8 py-10 space-y-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-pink-800">
          🌕 Galería de Arquetipos
        </h1>
        <p className="text-lg text-pink-700 max-w-3xl mx-auto">
          Los 28 arquetipos del ciclo GINERGETICA. Cada día es una puerta hacia
          tu sabiduría interior y tu energía femenina cambiante.
        </p>
        <p className="italic text-pink-600">
          Lo que hoy necesitas está en ti. Solo es cuestión de recordarlo.
        </p>
      </section>

      <section className="max-w-6xl mx-auto mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {ciclo.map((dia) => (
          <motion.article
            key={dia.id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-lg border border-pink-200 flex flex-col overflow-hidden"
          >
            {dia.imagen_url ? (
              <div className="relative w-full aspect-square">
                <Image
                  src={dia.imagen_url}
                  alt={`Día ${dia.id}: ${dia.arquetipo}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center w-full aspect-square bg-pink-100 text-pink-600 text-sm">
                Sin imagen
              </div>
            )}

            <div className="p-4 flex flex-col gap-2">
              <h3 className="text-pink-800 font-bold text-lg">
                Día {dia.dia_ciclo} · {dia.arquetipo}
              </h3>

              <p className="text-sm text-pink-700">{dia.descripcion}</p>

              <p className="text-xs text-pink-500 italic">
                Elemento: {dia.elemento}
              </p>

              {dia.audio_url && (
                <audio controls className="w-full mt-2">
                  <source src={dia.audio_url} type="audio/mpeg" />
                  Tu navegador no soporta audio.
                </audio>
              )}

              {dia.ritual_pdf && (
                <a
                  href={dia.ritual_pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-rose-700 underline mt-1 hover:text-rose-900"
                >
                  📜 Ver ritual PDF
                </a>
              )}

              {dia.tip_extra && (
                <p className="text-xs text-amber-700 mt-1 italic">
                  🌟 Tip: {dia.tip_extra}
                </p>
              )}
            </div>
          </motion.article>
        ))}
      </section>
    </main>
  );
}
