"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type MouseEvent,
} from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import EstadoActualCiclo from "@/components/EstadoActualCiclo";
import { EstadoCiclo, Recurso } from "@/types/index";
import Moonboard from "@/components/Moonboard";
import RecursosList from "@/components/RecursosList";
import CicloResumen from "@/components/CicloResumen";
import NuevoRegistro from "@/components/NuevoRegistro";
import { Flower, Leaf, GalleryThumbnails, Loader2 } from "lucide-react";
import Link from "next/link";
import QuickNav from "@/components/QuickNav";
import { useToast } from "@/components/Toast";

const LoadingState = ({ message }: { message: string }) => (
  <div className="flex h-screen flex-col items-center justify-center bg-gradient-to-br from-rose-50 via-white to-pink-100">
    <motion.div
      className="relative"
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative h-20 w-20 animate-spin rounded-full border-4 border-rose-400 border-t-transparent">
        <div className="absolute inset-0 rounded-full border-4 border-pink-300 border-t-transparent opacity-20"></div>
      </div>
    </motion.div>
    <motion.p
      className="mt-6 max-w-md text-center text-lg font-medium text-pink-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      {message}
    </motion.p>
    <motion.div
      className="mt-4 flex space-x-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6, duration: 0.5 }}
    >
      <div className="h-2 w-2 animate-bounce rounded-full bg-pink-400"></div>
      <div
        className="h-2 w-2 animate-bounce rounded-full bg-pink-400"
        style={{ animationDelay: "0.1s" }}
      ></div>
      <div
        className="h-2 w-2 animate-bounce rounded-full bg-pink-400"
        style={{ animationDelay: "0.2s" }}
      ></div>
    </motion.div>
  </div>
);

const CicloProgress = ({
  day,
  totalDays = 28,
}: {
  day: number;
  totalDays?: number;
}) => {
  const percentage = Math.min(100, (day / totalDays) * 100);
  const phase =
    day <= 7
      ? "Menstrual"
      : day <= 14
      ? "Folicular"
      : day <= 21
      ? "Ovulatoria"
      : "Lútea";

  return (
    <div className="rounded-2xl border border-pink-200 bg-white/85 p-4 shadow-lg backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-pink-700">
          Progreso del ciclo
        </span>
        <span className="text-sm font-semibold text-pink-800">
          {Math.round(percentage)}%
        </span>
      </div>
      <div className="mb-3 h-2 w-full rounded-full bg-pink-200">
        <motion.div
          className="h-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
      <div className="flex justify-between text-xs text-pink-600">
        <span>Día {day}</span>
        <span className="font-medium">{phase}</span>
        <span>Día {totalDays}</span>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [fechaActual, setFechaActual] = useState<string>("");
  const [day, setDay] = useState<number>(1);
  const [estadoCiclo, setEstadoCiclo] = useState<EstadoCiclo | null>(null);
  const [recursosData, setRecursosData] = useState<Recurso[]>([]);
  const [fechaInicioCiclo, setFechaInicioCiclo] = useState<Date | null>(null);
  const [fechaFinCiclo, setFechaFinCiclo] = useState<Date | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState(
    "Cargando tu espacio sagrado..."
  );
  const { ToastContainer } = useToast();

  interface Perfil {
    display_name: string;
    avatar_url: string;
    fecha_inicio: string;
    suscripcion_activa?: boolean;
  }

  const [perfil, setPerfil] = useState<Perfil | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadingMessage("Conectando con tu energía...");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/");
      return;
    }

    setUserId(user.id);
    setLoadingMessage("Cargando tu perfil...");

    const { data: perfilData } = await supabase
      .from("perfiles")
      .select("display_name, avatar_url, fecha_inicio, suscripcion_activa")
      .eq("user_id", user.id)
      .single();

    setUserName(perfilData?.display_name || "");
    setPerfil(perfilData ?? null);
    setFechaActual(new Date().toLocaleDateString());

    if (perfilData?.fecha_inicio) {
      setLoadingMessage("Calculando tu ciclo...");
      const inicio = new Date(perfilData.fecha_inicio);
      setFechaInicioCiclo(inicio);

      const hoy = new Date();
      const diferencia = Math.floor(
        (hoy.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)
      );
      const diaCiclo = (((diferencia % 28) + 28) % 28) + 1;

      setDay(diaCiclo);

      const fin = new Date(inicio);
      fin.setDate(fin.getDate() + 27);
      setFechaFinCiclo(fin);

      const { data: mujerChakanaData } = await supabase
        .from("mujer_chakana")
        .select("*")
        .eq("dia_ciclo", diaCiclo)
        .single();

      setEstadoCiclo(mujerChakanaData || null);
    } else {
      setEstadoCiclo(null);
      setDay(1);
      setFechaInicioCiclo(null);
      setFechaFinCiclo(null);
    }

    setLoadingMessage("Preparando tus recursos...");
    const { data: recursos } = await supabase
      .from("recursos")
      .select("*")
      .eq("activo", true);

    setRecursosData(recursos || []);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    async function recargarEstadoCiclo() {
      if (!fechaInicioCiclo) return;

      const hoy = new Date();
      const diferencia = Math.floor(
        (hoy.getTime() - fechaInicioCiclo.getTime()) / (1000 * 60 * 60 * 24)
      );
      const diaCiclo = (((diferencia % 28) + 28) % 28) + 1;

      const { data: mujerChakanaData, error } = await supabase
        .from("mujer_chakana")
        .select("*")
        .eq("dia_ciclo", diaCiclo)
        .single();

      if (error) {
        console.error("Error recargando estado del ciclo", error.message);
      }

      setEstadoCiclo(mujerChakanaData || null);
      setDay(diaCiclo);
    }

    recargarEstadoCiclo();
  }, [fechaInicioCiclo]);

  function handleGoToCiclos(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
    router.push("/ciclo");
  }

  const isSubscriber = Boolean(perfil?.suscripcion_activa);
  const diasTranscurridos = fechaInicioCiclo
    ? Math.floor(
        (Date.now() - fechaInicioCiclo.getTime()) / (1000 * 60 * 60 * 24)
      )
    : 0;
  const cicloActual = fechaInicioCiclo
    ? Math.floor(diasTranscurridos / 28) + 1
    : 1;

  const descripcionCorta = estadoCiclo?.descripcion
    ? `${estadoCiclo.descripcion.split(".")[0]}.`
    : "Añade tus sensaciones para activar recomendaciones personalizadas.";

  const cycleHighlights = useMemo(
    () =>
      estadoCiclo
        ? [
            {
              title: "Arquetipo guía",
              badge: estadoCiclo.arquetipo,
              caption: descripcionCorta,
            },
            {
              title: "Elemento del día",
              badge: estadoCiclo.elemento,
              caption: "Integra este elemento en tu ritual cotidiano.",
            },
            {
              title: "Ritmo actual",
              badge: `Día ${day} · Ciclo ${cicloActual}`,
              caption:
                "Observa tu energía y registra lo que viaje por tu cuerpo.",
            },
          ]
        : [
            {
              title: "Registra tu día",
              badge: "Comienza ahora",
              caption:
                "Añade tu primer registro para recibir orientación del ciclo.",
            },
            {
              title: "Explora recursos",
              badge: "Sagrario digital",
              caption: "Descubre audios, rituales y guías que te inspiran.",
            },
            {
              title: "Suscripción amorosa",
              badge: "2,99 €/mes",
              caption: "Desbloquea la galería y audio-guías cuando lo sientas.",
            },
          ],
    [estadoCiclo, descripcionCorta, day, cicloActual]
  );

  if (loading) {
    return <LoadingState message={loadingMessage} />;
  }

  return (
    <>
      <main
        className="relative min-h-screen overflow-hidden bg-cover bg-center text-rose-900"
        style={{
          backgroundImage:
            "url('https://elsaltoweb.es/wp-content/uploads/2025/04/mujer-chakana.png')",
        }}
      >
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

        <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-14 px-4 py-10 sm:px-6 lg:px-10">
          <motion.section
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="relative overflow-hidden rounded-[32px] border border-rose-100/70 bg-white/80 p-8 shadow-xl backdrop-blur-xl sm:p-10"
          >
            <div className="pointer-events-none absolute -right-10 top-1/2 h-52 w-52 -translate-y-1/2 rounded-full bg-rose-100/60 blur-3xl" />
            <div className="pointer-events-none absolute -left-16 -top-12 h-40 w-40 rounded-full bg-pink-100/60 blur-3xl" />

            <div className="relative flex flex-col gap-10 lg:flex-row lg:items-center">
              <div className="space-y-6 lg:flex-1">
                <span className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-100/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-rose-600">
                  Santuario personal
                </span>
                <h1 className="text-3xl font-bold leading-tight text-rose-950 sm:text-4xl lg:text-5xl">
                  Bienvenida, {userName || "exploradora"}
                </h1>
                <p className="text-base leading-relaxed text-rose-800 sm:text-lg">
                  Hoy es {fechaActual || "hoy"} · Día {day} de tu ciclo. Este
                  espacio te acompaña a escuchar tu energía y habitar cada fase
                  con presencia.
                </p>
                <div className="flex flex-wrap gap-3">
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => router.push("/manual")}
                    className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-rose-600 via-rose-700 to-rose-800 px-8 py-3 text-sm font-semibold text-white shadow-lg transition"
                  >
                    <Flower className="h-5 w-5 transition group-hover:rotate-12" />
                    Ver guía práctica
                  </motion.button>
                  <Link
                    href="#moonboard"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-white/70 px-7 py-3 text-sm font-semibold text-rose-700 shadow-sm transition hover:bg-white"
                  >
                    Actualizar moonboard
                  </Link>
                </div>
              </div>

              <div className="flex flex-col gap-4 rounded-3xl border border-rose-100/60 bg-white/85 p-6 shadow-lg backdrop-blur lg:w-72">
                <CicloProgress day={day} />
                <div className="flex items-center justify-between rounded-2xl border border-rose-100 bg-rose-50/80 px-4 py-2 text-sm font-medium text-rose-700">
                  <span>
                    {isSubscriber ? "Suscripción activa" : "Plan gratuito"}
                  </span>
                  <Leaf className="h-4 w-4 text-rose-500" />
                </div>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.7 }}
            className="grid gap-6 md:grid-cols-3"
          >
            {cycleHighlights.map(({ title, badge, caption }) => (
              <div
                key={title}
                className="rounded-3xl border border-rose-100/80 bg-white/75 p-6 shadow-lg backdrop-blur"
              >
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-500">
                  {title}
                </span>
                <p className="mt-3 text-lg font-semibold text-rose-900">
                  {badge}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-rose-700">
                  {caption}
                </p>
              </div>
            ))}
          </motion.section>

          <AnimatePresence>
            {estadoCiclo && (
              <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="overflow-hidden rounded-[32px] border border-rose-100 bg-white/80 p-6 shadow-lg backdrop-blur-xl"
              >
                <EstadoActualCiclo data={estadoCiclo} />
              </motion.section>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {day && fechaInicioCiclo && fechaFinCiclo && estadoCiclo && (
              <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="overflow-hidden rounded-[32px] border border-rose-100/80 bg-white/80 p-6 shadow-lg backdrop-blur-xl"
              >
                <CicloResumen
                  day={day}
                  fechaInicioCiclo={fechaInicioCiclo}
                  fechaFinCiclo={fechaFinCiclo}
                  userName={userName ?? undefined}
                  mujerChakanaData={estadoCiclo}
                />
              </motion.section>
            )}
          </AnimatePresence>

          <motion.section
            id="moonboard"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="rounded-[32px] border border-rose-100/70 bg-white/75 p-6 shadow-xl backdrop-blur-xl sm:p-10"
          >
            <div className="mb-6 space-y-2 text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-100/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-rose-600">
                Moonboard consciente
              </span>
              <h2 className="text-3xl font-bold text-rose-950 sm:text-4xl">
                Mi moonboard diario
              </h2>
              <p className="text-base text-rose-700 sm:text-lg">
                Registra emociones, energía y corporalidad para honrar tu ritmo
                interior.
              </p>
            </div>
            <Moonboard />
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="rounded-[32px] border border-rose-100/80 bg-white/80 p-8 text-center shadow-xl backdrop-blur-xl"
          >
            <div className="mx-auto flex max-w-2xl flex-col items-center gap-4">
              <h2 className="flex items-center justify-center gap-2 text-2xl font-semibold text-rose-900 sm:text-3xl">
                <GalleryThumbnails className="h-6 w-6 text-rose-500" />
                Galería de arquetipos
              </h2>
              <p className="text-base text-rose-700">
                Accede a los arquetipos visuales y sus enseñanzas para
                profundizar cada fase. Las suscriptoras activas disfrutan de
                contenidos anticipados y ceremonias guiadas.
              </p>
              {perfil === null ? (
                <div className="flex items-center gap-2 text-rose-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Cargando perfil...</span>
                </div>
              ) : isSubscriber ? (
                <motion.button
                  onClick={handleGoToCiclos}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-pink-700 px-8 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Ver arquetipos de la galería"
                >
                  <GalleryThumbnails className="h-5 w-5" />
                  Ver arquetipos
                </motion.button>
              ) : (
                <motion.button
                  onClick={() => router.push("/suscripcion")}
                  className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-8 py-3 font-semibold text-rose-800 shadow-sm transition hover:bg-rose-100"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Suscribirse para acceder a la galería"
                >
                  <GalleryThumbnails className="h-5 w-5" />
                  Suscríbete para acceder
                </motion.button>
              )}
            </div>
          </motion.section>

          <AnimatePresence>
            {userId && estadoCiclo && fechaInicioCiclo && (
              <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.35 }}
                className="overflow-hidden rounded-[32px] border border-rose-100/80 bg-white/80 p-6 shadow-xl backdrop-blur-xl"
              >
                <NuevoRegistro
                  userId={userId}
                  nombre={userName ?? "Exploradora"}
                  dia_ciclo={day}
                  ciclo_actual={cicloActual}
                  arquetipo={estadoCiclo.arquetipo ?? "Guía"}
                />
              </motion.section>
            )}
          </AnimatePresence>

          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="relative overflow-hidden rounded-[36px] border border-rose-100/70 bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 shadow-2xl"
          >
            <div className="pointer-events-none absolute -right-12 top-10 h-48 w-48 rounded-full bg-rose-200/40 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-12 left-10 h-56 w-56 rounded-full bg-pink-200/40 blur-3xl" />

            <div className="relative z-10 p-6 sm:p-10 lg:p-12">
              <div className="mb-10 text-center">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-rose-100/80 px-4 py-2 text-sm font-medium text-rose-700 shadow-sm">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-rose-400"></span>
                  Recursos espirituales
                </div>
                <h2 className="text-3xl font-bold text-rose-950 sm:text-4xl">
                  Recursos sagrados para tu proceso
                </h2>
                <p className="mt-3 text-base text-rose-700 sm:text-lg">
                  Rituales, audio-guías y registros que puedes integrar según tu
                  momento.
                </p>
              </div>

              <div className="flex justify-center pb-10">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Link
                    href="/recursos"
                    className="group relative inline-flex items-center gap-3 overflow-hidden rounded-2xl border border-rose-200/80 bg-white/90 px-8 py-4 font-semibold text-rose-700 shadow-lg transition hover:-translate-y-1 hover:bg-white hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2"
                    aria-label="Explorar todos los recursos espirituales"
                  >
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full"></div>

                    <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-rose-100 to-pink-100 shadow-inner transition duration-300 group-hover:scale-110 group-hover:rotate-12">
                      <span className="text-lg" aria-hidden="true">
                        ✨
                      </span>
                    </div>

                    <span className="relative text-lg">Explorar recursos</span>

                    <svg
                      className="relative h-5 w-5 transition-transform duration-300 group-hover:translate-x-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </motion.div>
              </div>

              <div className="relative rounded-3xl border border-rose-100/80 bg-white/65 p-6 shadow-2xl backdrop-blur-lg sm:p-8">
                <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-rose-200 to-pink-200 text-2xl shadow-lg">
                    🌗
                  </div>
                </div>
                <div className="pt-4">
                  <RecursosList recursos={recursosData} />
                </div>
              </div>

              <div className="mt-10 flex flex-col items-center justify-center gap-6 border-t border-rose-200/40 pt-8 text-center">
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-rose-400"></span>
                  <span
                    className="h-2 w-2 animate-pulse rounded-full bg-pink-400"
                    style={{ animationDelay: "0.1s" }}
                  ></span>
                  <span
                    className="h-2 w-2 animate-pulse rounded-full bg-orange-400"
                    style={{ animationDelay: "0.2s" }}
                  ></span>
                </div>
                <div className="text-rose-600/70">
                  <p className="text-lg font-medium italic">
                    Conecta con tu esencia interior
                  </p>
                  <p className="mt-1 text-sm text-rose-500/70">
                    Tu viaje de autodescubrimiento se nutre de cada registro
                    consciente.
                  </p>
                </div>
              </div>
            </div>
          </motion.section>
        </div>
      </main>

      <QuickNav currentDay={day} userName={userName || ""} />
      <ToastContainer />
    </>
  );
}
