"use client";

import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import {
  Droplets,
  Flame,
  Mountain,
  Wind,
  Sparkles,
  Lock,
  Music2,
  ScrollText,
  Clapperboard,
  LucideIcon,
} from "lucide-react";

interface MujerChakanaData {
  elemento: string;
  semana?: string;
  audio_url?: string;
  ritual_pdf?: string;
  video_url?: string;
  tip_extra?: string;
}

type ElementKey = "Agua" | "Fuego" | "Tierra" | "Aire" | "default";

interface ElementMeta {
  texture: string;
  overlay: string;
  icon: LucideIcon;
  iconRing: string;
  badge: string;
  accent: string;
  affirmation: string;
}

const elementMeta: Record<ElementKey, ElementMeta> = {
  Agua: {
    texture: "url('/agua-ui.webp')",
    overlay: "from-sky-950/80 via-sky-900/60 to-slate-900/75",
    icon: Droplets,
    iconRing:
      "from-sky-200/40 to-blue-200/20 border-sky-100/50 shadow-[0_20px_45px_rgba(125,211,252,0.35)]",
    badge: "bg-sky-100/15 border-sky-100/40 text-sky-100",
    accent: "text-sky-100",
    affirmation: "Fluye con sensibilidad, hidrata tu cuerpo y escucha tu intuición.",
  },
  Fuego: {
    texture: "url('/fuego-ui.webp')",
    overlay: "from-rose-950/80 via-red-900/60 to-orange-900/70",
    icon: Flame,
    iconRing:
      "from-rose-200/50 to-orange-200/20 border-rose-100/50 shadow-[0_20px_45px_rgba(248,113,113,0.35)]",
    badge: "bg-rose-100/20 border-rose-100/40 text-rose-100",
    accent: "text-rose-100",
    affirmation: "Prende tu creatividad, expresa tu poder interior y honra tu brillo.",
  },
  Tierra: {
    texture: "url('/tierra-ui.webp')",
    overlay: "from-stone-950/80 via-emerald-900/60 to-stone-900/70",
    icon: Mountain,
    iconRing:
      "from-emerald-200/40 to-lime-200/20 border-emerald-100/40 shadow-[0_20px_45px_rgba(52,211,153,0.32)]",
    badge: "bg-emerald-100/15 border-emerald-100/40 text-emerald-100",
    accent: "text-emerald-100",
    affirmation: "Enraíza tu energía, nutre el cuerpo y organiza tus espacios.",
  },
  Aire: {
    texture: "url('/cielo-ui.webp')",
    overlay: "from-indigo-950/80 via-purple-900/60 to-blue-900/70",
    icon: Wind,
    iconRing:
      "from-indigo-200/40 to-purple-200/20 border-indigo-100/40 shadow-[0_20px_45px_rgba(129,140,248,0.32)]",
    badge: "bg-indigo-100/20 border-indigo-100/40 text-indigo-100",
    accent: "text-indigo-100",
    affirmation: "Respira profundo, ordena tus pensamientos y comparte tu verdad.",
  },
  default: {
    texture: "url('/bg-chakana.png')",
    overlay: "from-rose-950/75 via-rose-900/60 to-stone-900/70",
    icon: Sparkles,
    iconRing:
      "from-rose-200/40 to-pink-200/20 border-rose-100/40 shadow-[0_20px_45px_rgba(244,114,182,0.30)]",
    badge: "bg-rose-100/20 border-rose-100/40 text-rose-100",
    accent: "text-rose-100",
    affirmation: "Celebra tu ciclo y permite que cada fase revele un aprendizaje nuevo.",
  },
};

export default function CicloResumen({
  mujerChakanaData,
}: {
  day: number;
  fechaInicioCiclo: Date;
  fechaFinCiclo: Date;
  userName?: string;
  mujerChakanaData: MujerChakanaData;
}) {
  const [suscripcionActiva, setSuscripcionActiva] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showUpsell, setShowUpsell] = useState(false);

  const elementKey = (["Agua", "Fuego", "Tierra", "Aire"].includes(
    mujerChakanaData.elemento
  )
    ? (mujerChakanaData.elemento as ElementKey)
    : "default") as ElementKey;
  const {
    texture,
    overlay,
    icon: ElementIcon,
    iconRing,
    badge,
    accent,
    affirmation,
  } = elementMeta[elementKey];

  useEffect(() => {
    const fetchSuscripcion = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("perfiles")
        .select("suscripcion_activa")
        .eq("user_id", user.id)
        .single();
      setSuscripcionActiva(Boolean(data?.suscripcion_activa));
      setLoading(false);
    };

    fetchSuscripcion();
  }, []);

  const resourceItems = useMemo(
    () =>
      [
        {
          id: "audio",
          label: "Audio guía",
          description: "Conecta con tu voz interior y sincroniza tu respiración.",
          icon: Music2,
          url: mujerChakanaData.audio_url,
        },
        {
          id: "ritual",
          label: "Ritual guiado",
          description: "Un paso a paso para honrar el arquetipo del día.",
          icon: ScrollText,
          url: mujerChakanaData.ritual_pdf,
        },
        {
          id: "video",
          label: "Video inspiración",
          description: "Movimiento consciente y visualizaciones activas.",
          icon: Clapperboard,
          url: mujerChakanaData.video_url,
        },
      ].filter((item) => item.url),
    [
      mujerChakanaData.audio_url,
      mujerChakanaData.ritual_pdf,
      mujerChakanaData.video_url,
    ]
  );

  const hasPremiumContent = resourceItems.length > 0;

  const dailyContentHref = `/ritual?pdf=${encodeURIComponent(
    mujerChakanaData.ritual_pdf || ""
  )}&audio=${encodeURIComponent(
    mujerChakanaData.audio_url || ""
  )}&video=${encodeURIComponent(mujerChakanaData.video_url || "")}`;

  const handleNoAccess = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setShowUpsell(true);
  };

  if (loading) {
    return (
      <div className="mb-6 rounded-3xl border border-pink-200/40 bg-gradient-to-br from-pink-900/70 via-rose-900/70 to-purple-900/70 p-8 text-white shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
          <span className="text-lg font-medium">Cargando tu ciclo...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative mb-8 flex min-h-[420px] flex-col justify-center overflow-hidden rounded-[32px] border border-white/20 p-8 text-white shadow-2xl shadow-rose-900/25 sm:p-10"
      style={{
        backgroundImage: texture,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div
        className={`pointer-events-none absolute inset-0 rounded-[32px] bg-gradient-to-br ${overlay}`}
      />

      <div className="relative z-10 grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-8">
          <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left">
            <div className="flex flex-col items-center gap-4 sm:items-start">
              <span
                className={`flex h-24 w-24 items-center justify-center rounded-full border backdrop-blur-md bg-gradient-to-br ${iconRing}`}
              >
                <ElementIcon className="h-12 w-12 text-white/90" />
              </span>
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${badge}`}
              >
                Ritmo elemental
              </span>
            </div>
            <div className="mt-6 sm:ml-8 sm:mt-0">
              <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
                {mujerChakanaData.elemento}
              </h1>
              <p className={`mt-3 max-w-xl text-sm leading-relaxed sm:text-base ${accent}`}>
                {affirmation}
              </p>
            </div>
          </div>

          <div className="space-y-4 rounded-3xl border border-white/20 bg-white/5 p-6 backdrop-blur-md">
            <h2 className="text-lg font-semibold text-white">
              Panorama del ciclo presente
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-sm text-white/80">
              <span className="rounded-full border border-white/20 bg-white/10 px-4 py-1 font-medium">
                Elemento guía: {mujerChakanaData.elemento}
              </span>
              {mujerChakanaData.semana && (
                <span className="rounded-full border border-white/20 bg-white/10 px-4 py-1 font-medium">
                  Semana lunar: {mujerChakanaData.semana}
                </span>
              )}
              <span className="rounded-full border border-white/20 bg-white/10 px-4 py-1 font-medium">
                Recursos sugeridos: {resourceItems.length || "Próximamente"}
              </span>
            </div>

            <p className="text-sm text-white/70">
              Honra este momento registrando tus emociones y necesidades; así, la
              plataforma podrá guiarte con mayor precisión en tus próximos días.
            </p>
          </div>

          {hasPremiumContent && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-white/90">
                Herramientas disponibles hoy
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {resourceItems.map(({ id, label, description, icon: Icon }) => (
                  <div
                    key={id}
                    className="group flex flex-col gap-2 rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-md transition duration-300 hover:border-white/30 hover:bg-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10">
                        <Icon className="h-5 w-5 text-white/90" />
                      </span>
                      <div className="flex flex-1 items-center justify-between">
                        <p className="font-medium text-white">{label}</p>
                        {suscripcionActiva ? (
                          <Sparkles className="h-5 w-5 text-amber-200" />
                        ) : (
                          <Lock className="h-5 w-5 text-white/50" />
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-white/70">{description}</p>
                    {!suscripcionActiva && (
                      <p className="text-xs font-semibold text-rose-200">
                        Disponible con suscripción activa.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {hasPremiumContent ? (
              suscripcionActiva ? (
                <Link
                  href={dailyContentHref}
                  className="group inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-rose-700 px-6 py-4 text-base font-semibold text-white shadow-xl transition duration-300 hover:from-rose-600 hover:via-rose-700 hover:to-rose-800 hover:shadow-rose-900/40"
                >
                  <Sparkles className="h-5 w-5 transition group-hover:scale-110" />
                  Acceder al portal del día
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={handleNoAccess}
                  className="inline-flex w-full items-center justify-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-6 py-4 text-base font-semibold text-white/80 backdrop-blur-md transition duration-300 hover:border-white/40 hover:text-white"
                >
                  <Lock className="h-5 w-5" />
                  Contenido exclusivo · suscríbete para acceder
                </button>
              )
            ) : (
              <p className="rounded-2xl border border-white/15 bg-white/5 px-6 py-4 text-center text-sm text-white/70 backdrop-blur-md">
                Estamos preparando nuevos recursos para esta fase. Vuelve pronto o
                explora el manual para seguir profundizando.
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6 rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur-md">
          {mujerChakanaData.tip_extra && (
            <div className="rounded-2xl border border-amber-200/30 bg-amber-100/15 p-5 text-amber-100 shadow-inner shadow-amber-900/20">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-200">
                Consejo del día
              </p>
              <p className="mt-3 text-sm leading-relaxed text-amber-50">
                {mujerChakanaData.tip_extra}
              </p>
            </div>
          )}

          <div className="rounded-2xl border border-white/15 bg-white/5 p-5 text-white/70 backdrop-blur-md">
            <p className="text-sm leading-relaxed">
              Tu ciclo es un mandala vivo. Registrar lo que sientes hoy abre una puerta
              a la <span className="font-semibold text-white">sabiduría propia</span>.
              Permítete descansar, crear o moverte según lo que tu cuerpo exprese.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/65 backdrop-blur-md">
            <p>
              Si necesitas inspiración extra, visita el manual o consulta el calendario
              lunar. Tu práctica constante es un acto de amor.
            </p>
            <div className="mt-4 flex flex-col gap-3 text-sm sm:flex-row">
              <Link
                href="/manual"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-white/85 transition hover:border-white/40 hover:text-white"
              >
                Guía práctica
              </Link>
              <Link
                href="/ciclo"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-white/85 transition hover:border-white/40 hover:text-white"
              >
                Ver calendario
              </Link>
            </div>
          </div>
        </div>
      </div>

      {showUpsell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="max-w-md rounded-3xl border border-white/10 bg-gradient-to-br from-white to-rose-50 p-8 text-center text-rose-900 shadow-2xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-lg">
              <Lock className="h-7 w-7" />
            </div>

            <h3 className="text-2xl font-bold">Contenido exclusivo</h3>
            <p className="mt-3 text-sm leading-relaxed text-rose-700">
              Activa tu suscripción para abrir rituales, audio-guías y videos diseñados
              especialmente para este día del ciclo.
            </p>

            <div className="mt-6 space-y-3">
              <Link
                href="/suscripcion"
                className="block w-full rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:from-rose-600 hover:to-rose-700"
              >
                Ver planes de suscripción
              </Link>
              <button
                type="button"
                onClick={() => setShowUpsell(false)}
                className="block w-full text-sm font-medium text-rose-500 transition hover:text-rose-600"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
