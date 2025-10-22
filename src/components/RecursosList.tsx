"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Music2,
  ScrollText,
  BookOpen,
  Lock,
  ShieldCheck,
  Sparkles,
  Gift,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Recurso = {
  id: string;
  tipo: string;
  titulo: string;
  url: string;
  descripcion: string;
  tipo_suscripcion: "gratuito" | "mensual" | "anual";
};

type Tier = "gratuito" | "mensual" | "anual";

const tierMeta: Record<
  Tier,
  {
    title: string;
    icon: React.ReactNode;
    accent: string;
    badgeClass: string;
    description: string;
  }
> = {
  gratuito: {
    title: "Recursos gratuitos",
    icon: <Gift className="h-5 w-5 text-emerald-500" />,
    accent: "text-emerald-600",
    badgeClass:
      "bg-emerald-100/80 text-emerald-700 border border-emerald-200 shadow-sm",
    description:
      "Materiales abiertos para iniciar tu recorrido y sostener tu práctica diaria.",
  },
  mensual: {
    title: "Contenido exclusivo mensual",
    icon: <Sparkles className="h-5 w-5 text-amber-500" />,
    accent: "text-amber-600",
    badgeClass:
      "bg-amber-100/80 text-amber-700 border border-amber-200 shadow-sm",
    description:
      "Audio-guías y rituales anticipados disponibles con la suscripción mensual.",
  },
  anual: {
    title: "Recursos para suscripción anual",
    icon: <ShieldCheck className="h-5 w-5 text-rose-500" />,
    accent: "text-rose-600",
    badgeClass:
      "bg-rose-100/80 text-rose-700 border border-rose-200 shadow-sm",
    description:
      "Biblioteca completa de contenidos profundos para acompañar tus 12 lunas.",
  },
};

const iconByTipo: Record<string, React.ReactNode> = {
  audio: <Music2 className="h-5 w-5" />,
  pdf: <ScrollText className="h-5 w-5" />,
};

function getTipoIcon(tipo: string) {
  return iconByTipo[tipo] ?? <BookOpen className="h-5 w-5" />;
}

export default function RecursosList({ recursos }: { recursos: Recurso[] }) {
  const [suscripcionActiva, setSuscripcionActiva] = useState(false);

  useEffect(() => {
    const fetchPerfil = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return;
      }

      const { data, error } = await supabase
        .from("perfiles")
        .select("suscripcion_activa")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error obteniendo perfil:", error.message);
        return;
      }

      setSuscripcionActiva(Boolean(data?.suscripcion_activa));
    };

    fetchPerfil();
  }, []);

  const groupedResources = useMemo(
    () => ({
      gratuito: recursos.filter(
        (r) => r.tipo_suscripcion?.toLowerCase().trim() === "gratuito"
      ),
      mensual: recursos.filter(
        (r) => r.tipo_suscripcion?.toLowerCase().trim() === "mensual"
      ),
      anual: recursos.filter(
        (r) => r.tipo_suscripcion?.toLowerCase().trim() === "anual"
      ),
    }),
    [recursos]
  );

  const renderCards = (lista: Recurso[], tier: Tier) => {
    const isPremiumTier = tier !== "gratuito";
    const locked = isPremiumTier && !suscripcionActiva;

    if (!lista.length) {
      return (
        <div className="col-span-full rounded-3xl border border-white/40 bg-white/40 p-8 text-center text-sm text-rose-700">
          Estamos preparando nuevos recursos para esta categoría. Vuelve pronto.
        </div>
      );
    }

    return lista.map((recurso) => {
      const cardBase =
        "group relative flex h-full flex-col justify-between rounded-3xl border p-6 shadow transition hover:-translate-y-1 hover:shadow-xl";

      if (locked) {
        return (
          <div
            key={recurso.id}
            className={`${cardBase} border-rose-100/60 bg-white/50 text-rose-300`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/40 bg-white/30 text-rose-200">
                  {getTipoIcon(recurso.tipo)}
                </span>
                <div>
                  <h3 className="text-base font-semibold line-through">
                    {recurso.titulo}
                  </h3>
                  <p className="text-xs italic text-rose-400">
                    {recurso.descripcion}
                  </p>
                </div>
              </div>
              <span
                className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${tierMeta[tier].badgeClass}`}
              >
                <Lock className="h-3.5 w-3.5" />
                {tier === "mensual" ? "Mensual" : "Anual"}
              </span>
            </div>

            <div className="mt-6 flex flex-col items-center gap-2 text-sm text-rose-500">
              <Lock className="h-4 w-4" />
              <p className="text-center">
                Disponible para suscriptoras {tier === "mensual" ? "mensuales" : "anuales"}.
              </p>
              <Link
                href="/suscripcion"
                className="text-xs font-semibold text-rose-600 underline-offset-2 hover:underline"
                tabIndex={-1}
                aria-disabled="true"
              >
                Conocer planes
              </Link>
            </div>
          </div>
        );
      }

      return (
        <Link
          key={recurso.id}
          href={`/recursos/${recurso.id}`}
          className={`${cardBase} border-rose-100/70 bg-white/80 backdrop-blur hover:border-rose-200`}
        >
          <div className="flex items-start justify-between gap-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-rose-100 bg-rose-50 text-rose-500 shadow-inner">
              {getTipoIcon(recurso.tipo)}
            </span>
            <span
              className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${tierMeta[tier].badgeClass}`}
            >
              {tier === "gratuito" ? "Gratis" : tier === "mensual" ? "Mensual" : "Anual"}
            </span>
          </div>
          <div className="mt-5 space-y-2">
            <h3 className="text-lg font-semibold text-rose-900">
              {recurso.titulo}
            </h3>
            <p className="text-sm text-rose-700">{recurso.descripcion}</p>
          </div>
          <span className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-rose-500 transition group-hover:text-rose-600">
            Explorar recurso
            <span aria-hidden="true">→</span>
          </span>
        </Link>
      );
    });
  };

  return (
    <div className="space-y-12">
      {(["gratuito", "mensual", "anual"] as Tier[]).map((tier) => {
        const section = tierMeta[tier];

        return (
          <section key={tier} className="space-y-4">
            <div className="flex flex-col gap-2 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
              <div className="space-y-1">
                <span
                  className={`inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] ${section.accent}`}
                >
                  {section.icon}
                  {tier}
                </span>
                <h2 className={`text-2xl font-semibold ${section.accent}`}>
                  {section.title}
                </h2>
                <p className="text-sm text-rose-600">{section.description}</p>
              </div>
              {tier !== "gratuito" && !suscripcionActiva && (
                <Link
                  href="/suscripcion"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-white/70 px-4 py-2 text-xs font-semibold text-rose-600 shadow-sm transition hover:border-rose-300 hover:text-rose-700"
                >
                  <Sparkles className="h-4 w-4" />
                  Activar suscripcion
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {renderCards(groupedResources[tier], tier)}
            </div>
          </section>
        );
      })}
    </div>
  );
}
