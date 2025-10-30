"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { ArrowRight, BookOpen, Sparkles, Timer } from "lucide-react";

const redirectDelayMs = 4000;

const affirmations = [
  "Cada ciclo es un regreso a ti. Respira y honra este inicio.",
  "Tu energia se renueva; escucha lo que tu cuerpo quiere contarte hoy.",
  "La sabiduria que buscas se cultiva paso a paso. Estas en camino.",
];

export default function BienvenidaPage() {
  const router = useRouter();
  const [inicioCiclo, setInicioCiclo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(redirectDelayMs);

  const mensajeInicio = useMemo(() => {
    if (!inicioCiclo) {
      return {
        tone: "bg-amber-100/80 border-amber-200 text-amber-700",
        text: [
          "Tu ciclo ha comenzado automaticamente en el Dia 1.",
          "Puedes ajustar la fecha desde tu dashboard cuando lo necesites.",
        ],
      };
    }

    return {
      tone: "bg-emerald-100/80 border-emerald-200 text-emerald-700",
      text: [
        "Tu ciclo esta sincronizado.",
        `Inicio registrado: ${new Date(inicioCiclo).toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })}.`,
      ],
    };
  }, [inicioCiclo]);

  const progress = useMemo(() => {
    return Math.min(1, Math.max(0, 1 - timeLeft / redirectDelayMs));
  }, [timeLeft]);

  const secondsLeft = useMemo(
    () => Math.max(0, Math.ceil(timeLeft / 1000)),
    [timeLeft]
  );
  const progressPercent = Math.round(progress * 100);

  useEffect(() => {
    async function fetchInicioCiclo() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/");
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

  useEffect(() => {
    if (loading) {
      return;
    }

    setTimeLeft(redirectDelayMs);

    const countdown = setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 100) {
          clearInterval(countdown);
          return 0;
        }
        return current - 100;
      });
    }, 100);

    const timer = setTimeout(() => {
      router.push("/dashboard");
    }, redirectDelayMs);

    return () => {
      clearInterval(countdown);
      clearTimeout(timer);
    };
  }, [loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-rose-50 via-white to-rose-100 text-rose-700">
        <p className="text-sm">Preparando tu circulo de bienvenida...</p>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[url('/bg-chakana.png')] bg-cover bg-center text-rose-900">
      <div className="absolute inset-0 bg-gradient-to-br from-white/85 via-white/75 to-rose-100/60 backdrop-blur-3xl" />
      <motion.div
        initial={{ opacity: 0.3, scale: 0.85 }}
        animate={{ opacity: 0.45, scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-rose-200/40 blur-3xl"
      />
      <motion.div
        initial={{ opacity: 0.3, scale: 0.9 }}
        animate={{ opacity: 0.5, scale: 1 }}
        transition={{ duration: 2.2, ease: "easeOut" }}
        className="pointer-events-none absolute -bottom-28 left-0 h-80 w-80 rounded-full bg-rose-100/60 blur-3xl"
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-10 px-4 py-16 text-center">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="w-full max-w-xl space-y-8 rounded-[36px] border border-rose-100/70 bg-white/85 p-9 shadow-2xl backdrop-blur-xl"
        >
          <div className="flex flex-col items-center gap-6 text-center">
            <Image
              src="/logo_chakana.png"
              alt="Logo Mujer Chakana"
              width={120}
              height={120}
              className="h-24 w-24 animate-pulse rounded-full border border-rose-100 bg-white shadow-inner"
              priority
            />

            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-rose-100 bg-rose-50/70 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-rose-500">
                <Sparkles className="h-3.5 w-3.5" />
                Ritual de bienvenida
              </span>
              <h1 className="text-3xl font-bold text-rose-950 sm:text-4xl">
                Bienvenida al circulo
              </h1>
              <p className="text-sm text-rose-600 sm:text-base">
                Estamos preparando tu tablero lunar con todo el cuidado. Regala un momento a tu respiracion y recibe estas semillas de intencion.
              </p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-3xl border border-rose-100/70 bg-white/70 p-5 text-left text-rose-700 shadow-inner"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                  <Timer className="h-5 w-5" />
                </span>
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-rose-400">
                    Preparando tu dashboard
                  </p>
                  <p className="text-sm font-semibold text-rose-700">
                    Redireccion en {secondsLeft} {secondsLeft === 1 ? "segundo" : "segundos"}
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-rose-500">
                {progressPercent}%
              </span>
            </div>
            <div
              className="relative mt-4 h-2 overflow-hidden rounded-full bg-rose-100/60"
              role="progressbar"
              aria-label="Progreso hacia tu dashboard"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progressPercent}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-rose-500 via-rose-600 to-rose-700 transition-[width] duration-150 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="sr-only" role="status" aria-live="polite">
              Redireccion en {secondsLeft} {secondsLeft === 1 ? "segundo" : "segundos"}
            </span>
          </motion.div>

          <div className="space-y-4 rounded-3xl border border-rose-100/70 bg-rose-50/70 px-6 py-5 text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-500">
              Tus afirmaciones para hoy
            </p>
            <ul className="space-y-3">
              {affirmations.map((linea, index) => (
                <motion.li
                  key={linea}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.15 }}
                  className="flex items-start gap-3 text-sm text-rose-700"
                >
                  <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-rose-500 shadow-sm">
                    <Sparkles className="h-3 w-3" />
                  </span>
                  <span className="leading-relaxed">{linea}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          <div
            className={`rounded-3xl border px-5 py-4 text-sm leading-relaxed shadow-sm ${mensajeInicio.tone}`}
          >
            {mensajeInicio.text.map((linea) => (
              <p key={linea}>{linea}</p>
            ))}
          </div>

          <div className="space-y-4 text-center text-sm text-rose-500 sm:text-base">
            <p>
              En cuanto terminemos, te llevaremos al dashboard automaticamente. Si prefieres avanzar ya mismo, elige tu opcion:
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => router.push("/dashboard")}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-600 via-rose-700 to-rose-800 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl"
              >
                Ir al dashboard
                <ArrowRight className="h-4 w-4" />
              </motion.button>

              <Link
                href="/manual"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-rose-200 bg-white px-6 py-3 text-sm font-semibold text-rose-600 shadow-sm transition hover:border-rose-300 hover:bg-rose-50"
              >
                <BookOpen className="h-4 w-4" />
                Revisar el manual primero
              </Link>
            </div>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
