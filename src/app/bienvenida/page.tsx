"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

const transitionDelay = 3500;

const affirmations = [
  "Cada ciclo es un regreso a ti. Respira y honra este inicio.",
  "Tu energia se renueva; escucha lo que tu cuerpo quiere contarte hoy.",
  "La sabiduria que buscas se cultiva paso a paso. Estas en camino.",
];

export default function BienvenidaPage() {
  const router = useRouter();
  const [inicioCiclo, setInicioCiclo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
        `Inicio registrado: ${new Date(inicioCiclo).toLocaleDateString()}.`,
      ],
    };
  }, [inicioCiclo]);

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
    if (!loading) {
      const timer = setTimeout(() => {
        router.push("/dashboard");
      }, transitionDelay);

      return () => clearTimeout(timer);
    }
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
          className="w-full max-w-xl space-y-6 rounded-[36px] border border-rose-100/70 bg-white/80 p-8 shadow-2xl backdrop-blur-xl"
        >
          <Image
            src="/logo_chakana.png"
            alt="Logo Mujer Chakana"
            width={120}
            height={120}
            className="mx-auto h-24 w-24 animate-pulse rounded-full border border-rose-100 bg-white shadow-inner"
            priority
          />

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-rose-950 sm:text-4xl">
              Bienvenida al circulo
            </h1>
            <p className="text-sm text-rose-600">
              Gracias por abrir este espacio. Mientras preparamos tu dashboard,
              recibe estas palabras y respira profundo.
            </p>
          </div>

          <div className="space-y-3 rounded-3xl border border-rose-100/70 bg-rose-50/70 px-6 py-4 text-sm text-rose-700">
            {affirmations.map((linea) => (
              <p key={linea} className="leading-relaxed">
                {linea}
              </p>
            ))}
          </div>

          <div
            className={`rounded-3xl border px-5 py-3 text-sm leading-relaxed ${mensajeInicio.tone}`}
          >
            {mensajeInicio.text.map((linea) => (
              <p key={linea}>{linea}</p>
            ))}
          </div>

          <p className="text-xs text-rose-500">
            Seras redirigida al dashboard en unos segundos. Si quieres avanzar ahora,
            usa el boton siguiente.
          </p>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-rose-600 via-rose-700 to-rose-800 px-8 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl"
          >
            Ir al dashboard
          </motion.button>
        </motion.section>

        <Link
          href="/manual"
          className="text-xs font-semibold text-rose-500 underline-offset-2 hover:underline"
        >
          Prefiero comenzar revisando el manual
        </Link>
      </div>
    </main>
  );
}
