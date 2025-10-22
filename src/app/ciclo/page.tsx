"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, AudioLines, FileText, AlertTriangle } from "lucide-react";

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
  const router = useRouter();
  const [ciclo, setCiclo] = useState<MujerChakanaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

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

      if (cicloError) {
        console.error("Error al cargar el ciclo:", cicloError.message);
      } else {
        setCiclo(cicloData || []);
      }

      setLoading(false);
      setAuthChecked(true);
    };

    checkAuthAndSubscription();
  }, [router]);

  const groupedBySemana = useMemo(() => {
    return ciclo.reduce<Record<number, MujerChakanaData[]>>((acc, item) => {
      if (!acc[item.semana]) {
        acc[item.semana] = [];
      }
      acc[item.semana].push(item);
      return acc;
    }, {});
  }, [ciclo]);

  if (!authChecked || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-rose-50 via-white to-amber-50">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-rose-100 bg-white/70 px-6 py-8 text-rose-600 shadow-lg">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="h-5 w-5 animate-spin text-rose-400" />
            Preparando tu galeria de arquetipos...
          </div>
          <p className="text-xs text-rose-500">Verificando acceso y cargando datos.</p>
        </div>
      </div>
    );
  }

  if (ciclo.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-rose-50 via-white to-amber-50">
        <div className="flex max-w-md flex-col items-center gap-3 rounded-3xl border border-rose-200 bg-white/80 p-8 text-center text-rose-600 shadow-xl">
          <AlertTriangle className="h-10 w-10 text-rose-500" />
          <p className="text-sm">
            No pudimos encontrar arquetipos disponibles. Revisa tu suscripcion o vuelve
            a intentarlo mas tarde.
          </p>
          <Link
            href="/suscripcion"
            className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-600 transition hover:border-rose-300 hover:text-rose-700"
          >
            Ver planes
          </Link>
        </div>
      </div>
    );
  }

  const badgesByElemento: Record<string, string> = {
    Agua: "bg-sky-100/80 text-sky-700 border-sky-200",
    Fuego: "bg-orange-100/80 text-orange-700 border-orange-200",
    Tierra: "bg-emerald-100/80 text-emerald-700 border-emerald-200",
    Aire: "bg-indigo-100/80 text-indigo-700 border-indigo-200",
  };

  const sections = Object.entries(groupedBySemana).sort(
    ([a], [b]) => Number(a) - Number(b)
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-[url('/bg-chakana.png')] bg-cover bg-center text-rose-900">
      <div className="absolute inset-0 bg-gradient-to-br from-white/85 via-white/75 to-rose-100/60 backdrop-blur-3xl" />
      <motion.div
        initial={{ opacity: 0.3, scale: 0.85 }}
        animate={{ opacity: 0.45, scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="pointer-events-none absolute -top-28 right-0 h-80 w-80 rounded-full bg-rose-200/40 blur-3xl"
      />
      <motion.div
        initial={{ opacity: 0.3, scale: 0.9 }}
        animate={{ opacity: 0.5, scale: 1 }}
        transition={{ duration: 2.4, ease: "easeOut" }}
        className="pointer-events-none absolute -bottom-32 left-0 h-96 w-96 rounded-full bg-rose-100/60 blur-3xl"
      />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-12 px-4 py-12 sm:px-6 lg:px-10">
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="rounded-[36px] border border-rose-100/70 bg-white/80 p-8 text-center shadow-2xl backdrop-blur-xl sm:p-12"
        >
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-100/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-rose-600">
              Galeria sagrada
            </span>
            <h1 className="text-4xl font-extrabold text-rose-950 sm:text-5xl">
              Los 28 arquetipos que habitan tu ciclo
            </h1>
            <p className="text-base text-rose-700 sm:text-lg">
              Explora cada dia, conecta con el arquetipo que lo inspira y accede a los
              rituales que acompanian tu vuelta lunar. Este espacio esta disponible para
              suscriptoras activas.
            </p>
            <p className="text-sm italic text-rose-500">
              Lo que hoy necesitas ya vive en ti. Solo es cuestion de recordarlo.
            </p>
          </div>
        </motion.section>

        {sections.map(([semana, items], index) => (
          <motion.section
            key={semana}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="space-y-6"
          >
            <div className="flex flex-col items-center gap-2 text-center sm:text-left">
              <span className="rounded-full border border-rose-200 bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-rose-600">
                Semana {semana}
              </span>
              <h2 className="text-2xl font-semibold text-rose-900 sm:text-3xl">
                Ritmo elemental de los dias {items[0]?.dia_ciclo} al {items.at(-1)?.dia_ciclo}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((dia) => {
                const badgeClass =
                  badgesByElemento[dia.elemento] ?? "bg-rose-100/80 text-rose-700 border-rose-200";

                return (
                  <motion.article
                    key={dia.id}
                    initial={{ opacity: 0.85, scale: 0.98 }}
                    whileHover={{ scale: 1.01 }}
                    className="overflow-hidden rounded-[28px] border border-rose-100/70 bg-white/80 shadow-lg backdrop-blur-md transition hover:shadow-rose-500/20"
                  >
                    <div className="relative h-56 w-full overflow-hidden">
                      {dia.imagen_url ? (
                        <Image
                          src={dia.imagen_url}
                          alt={`Dia ${dia.dia_ciclo}: ${dia.arquetipo}`}
                          fill
                          className="object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-rose-100 text-sm text-rose-500">
                          Sin imagen disponible
                        </div>
                      )}
                      <span
                        className={`absolute top-4 left-4 rounded-full border px-3 py-1 text-xs font-semibold ${badgeClass}`}
                      >
                        Elemento {dia.elemento}
                      </span>
                    </div>

                    <div className="space-y-3 px-6 py-5">
                      <div className="flex items-center justify-between text-sm text-rose-500">
                        <span className="rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-xs font-semibold">
                          Dia {dia.dia_ciclo}
                        </span>
                        <span className="text-xs uppercase tracking-[0.25em] text-rose-400">
                          Semana {dia.semana}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-rose-900">
                        {dia.arquetipo}
                      </h3>
                      <p className="text-sm leading-relaxed text-rose-700">
                        {dia.descripcion}
                      </p>

                      {dia.tip_extra && (
                        <p className="rounded-2xl border border-amber-200/40 bg-amber-100/40 px-4 py-2 text-xs italic text-amber-700">
                          Tip: {dia.tip_extra}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 pt-3 text-xs">
                        {dia.audio_url && (
                          <a
                            href={dia.audio_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 font-semibold text-rose-600 transition hover:border-rose-300 hover:text-rose-700"
                          >
                            <AudioLines className="h-4 w-4" />
                            Audio guia
                          </a>
                        )}
                        {dia.ritual_pdf && (
                          <a
                            href={dia.ritual_pdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 font-semibold text-rose-600 transition hover:border-rose-300 hover:text-rose-700"
                          >
                            <FileText className="h-4 w-4" />
                            Ritual PDF
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </motion.section>
        ))}
      </div>
    </main>
  );
}
