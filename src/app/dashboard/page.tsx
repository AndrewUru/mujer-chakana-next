"use client";

import { useCallback } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion"; // << IMPORTANTE
import EstadoActualCiclo from "@/components/EstadoActualCiclo";
import { EstadoCiclo, Recurso } from "@/types/index";
import Moonboard from "@/components/Moonboard";
import RecursosList from "@/components/RecursosList";
import CicloResumen from "@/components/CicloResumen";
import NuevoRegistro from "@/components/NuevoRegistro";
import { Flower, Moon, Leaf, GalleryThumbnails } from "lucide-react";
import Link from "next/link";

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
  const [loading, setLoading] = useState(true); // << AGREGADO
  interface Perfil {
    display_name: string;
    avatar_url: string;
    fecha_inicio: string;
    suscripcion_activa?: boolean;
  }

  const [perfil, setPerfil] = useState<Perfil | null>(null); // Add state for perfil

  const loadData = useCallback(async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/");
      return;
    }

    setUserId(user.id);

    const { data: perfilData } = await supabase
      .from("perfiles")
      .select("display_name, avatar_url, fecha_inicio, suscripcion_activa")
      .eq("user_id", user.id)
      .single();
    setUserName(perfilData?.display_name || "");
    setPerfil(perfilData); // Save perfil data for later use
    setUserName(perfilData?.display_name || "");

    if (perfilData?.fecha_inicio) {
      const inicio = new Date(perfilData.fecha_inicio);
      setFechaInicioCiclo(inicio); // 🔥 ESTO es lo que faltaba
      const hoy = new Date();
      const diferencia = Math.floor(
        (hoy.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)
      );
      const diaCiclo = (diferencia % 28) + 1;
      setDay(diaCiclo);

      const fin = new Date(inicio);
      fin.setDate(fin.getDate() + 27);
      setFechaFinCiclo(fin);

      setFechaActual(hoy.toLocaleDateString());

      const { data: mujerChakanaData } = await supabase
        .from("mujer_chakana")
        .select("*")
        .eq("dia_ciclo", diaCiclo)
        .single();

      setEstadoCiclo(mujerChakanaData || null);
    }

    const { data: recursos } = await supabase
      .from("recursos")
      .select("*")
      .eq("activo", true); // <-- Esto filtra sólo recursos visibles
    console.log("🎯 Recursos cargados:", recursos);

    setRecursosData(recursos || []);
    setLoading(false); // << Finaliza carga
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

      const { data: mujerChakanaData, error } = await supabase
        .from("mujer_chakana")
        .select("*")
        .eq("dia_ciclo", (diferencia % 28) + 1)

        .single();

      if (error) {
        console.error("Error recargando estado del ciclo", error.message);
      }

      setEstadoCiclo(mujerChakanaData || null);
      setDay((diferencia % 28) + 1); // ✅ BIEN
    }

    recargarEstadoCiclo();
  }, [fechaInicioCiclo]);

  function handleGoToCiclos(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void {
    event.preventDefault();
    router.push("/ciclo");
  }
  // ✨ Loader de carga ✨
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-rose-50/70">
        <motion.div
          className="w-16 h-16 border-4 border-rose-400 border-t-transparent rounded-full animate-spin"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, ease: "linear", duration: 1 }}
        />
      </div>
    );
  }

  return (
    <main className="w-full max-w-6xl px-4 mx-auto p-6 space-y-12 text-pink-900">
      {/* ENCABEZADO */}
      <section className="relative bg-gradient-to-br from-pink-100/70 to-rose-200/50 backdrop-blur-sm shadow-lg rounded-2xl p-4 flex flex-col gap-2 sm:flex-row sm:items-center justify-between text-center sm:text-left">
        <div className="space-y-1">
          <h1 className="text-lg sm:text-2xl font-semibold flex items-center gap-2">
            <Flower className="w-5 h-5 text-pink-600" /> Bienvenida, {userName}
          </h1>
          <p className="text-sm sm:text-lg flex items-center gap-1">
            Hoy es {fechaActual} — Día {day} de tu ciclo{" "}
            <Moon className="w-4 h-4 text-pink-500" />
          </p>
        </div>
        <div className="absolute -top-2 -right-2 bg-white text-pink-600 text-[10px] sm:text-xs px-2 py-1 rounded-full shadow border border-pink-300 flex items-center gap-1">
          <Leaf className="w-3 h-3" /> Mujer Cíclica
        </div>
      </section>

      {/* ESTADO ACTUAL */}
      {estadoCiclo && (
        <section>
          <EstadoActualCiclo data={estadoCiclo} />
        </section>
      )}

      {/* RESUMEN DEL CICLO */}
      {day && fechaInicioCiclo && fechaFinCiclo && estadoCiclo && (
        <section>
          <CicloResumen
            day={day}
            fechaInicioCiclo={fechaInicioCiclo}
            fechaFinCiclo={fechaFinCiclo}
            userName={userName ?? undefined}
            mujerChakanaData={estadoCiclo}
          />
        </section>
      )}

      {/* MOONBOARD */}
      <section className="bg-white/20 backdrop-blur-md border border-white/20 rounded-3xl p-6 sm:p-10 shadow-xl">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-pink-900 mb-6">
          🌕 Mi Moonboard Diario
        </h2>
        <Moonboard />
      </section>

      {/* BOTÓN GALERÍA */}
      <section className="mt-16 text-center bg-white/70 border border-pink-200 rounded-2xl shadow-md p-8 space-y-4 mb-20">
        <h2 className="text-2xl font-bold text-pink-700 flex items-center justify-center gap-2 mb-2">
          <GalleryThumbnails className="w-6 h-6" />
          Galería de Arquetipos
        </h2>
        <p className="text-pink-600 max-w-md mx-auto">
          Accede a todos los arquetipos visuales y sus enseñanzas a través de la
          Galería. Disponible para todas las suscripciones activas — ya sea
          mensual o anual.
        </p>

        {perfil === null ? (
          <p className="text-center text-sm text-gray-500">
            Cargando perfil...
          </p>
        ) : perfil.suscripcion_activa ? (
          <button
            onClick={handleGoToCiclos}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-pink-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-2xl hover:scale-105 transition-transform duration-300"
          >
            <GalleryThumbnails className="w-5 h-5" />
            Ver Arquetipos
          </button>
        ) : (
          <button
            onClick={() => router.push("/suscripcion")}
            className="inline-flex items-center gap-2 bg-pink-100 text-pink-800 font-semibold py-3 px-8 rounded-full border border-pink-300 shadow hover:bg-pink-200 transition"
          >
            <GalleryThumbnails className="w-5 h-5" />
            Suscríbete para acceder
          </button>
        )}
      </section>

      {/* NUEVO REGISTRO */}
      {userId && estadoCiclo && (
        <section>
          <NuevoRegistro
            userId={userId}
            nombre={userName ?? "Guerrera"}
            dia_ciclo={day}
            ciclo_actual={
              (Math.floor(
                (new Date().getTime() - fechaInicioCiclo!.getTime()) /
                  (1000 * 60 * 60 * 24)
              ) /
                28) |
              (0 + 1)
            }
            arquetipo={estadoCiclo.arquetipo ?? "Guía"}
          />
        </section>
      )}

      {/* RECURSOS */}
      <section className="relative mx-auto bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 rounded-3xl shadow-2xl border border-rose-200/50 mb-24 overflow-hidden group">
        {/* Patrón decorativo de fondo */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-rose-200/40 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-pink-200/40 to-transparent rounded-full blur-2xl"></div>
        </div>

        <div className="relative z-10 p-6 sm:p-10 lg:p-12">
          {/* Encabezado con mejor jerarquía visual */}
          <div className="mb-12 text-center">
            {/* Badge superior */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 px-4 py-2 rounded-full text-sm font-medium mb-6 shadow-sm">
              <span className="w-2 h-2 bg-rose-400 rounded-full animate-pulse"></span>
              Recursos Espirituales
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-orange-600 bg-clip-text text-transparent mb-6 leading-tight">
              Recursos Sagrados
            </h2>

            <div className="max-w-2xl mx-auto">
              <p className="text-rose-700/80 text-lg sm:text-xl font-medium mb-2">
                Audios, rituales y guías para tu camino interior
              </p>
              <p className="text-rose-600/60 text-base">
                Herramientas cuidadosamente seleccionadas para tu crecimiento
                espiritual
              </p>
            </div>
          </div>

          {/* Call-to-action mejorado */}
          <div className="flex justify-center mb-12">
            <Link
              href="/recursos"
              className="group relative inline-flex items-center gap-3 bg-white/90 backdrop-blur-md border border-rose-200/80 text-rose-700 px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-2xl hover:bg-white hover:-translate-y-1 hover:scale-105 transition-all duration-300 overflow-hidden"
            >
              {/* Efecto de brillo al hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

              <div className="relative w-10 h-10 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-inner">
                <span className="text-lg">🔍</span>
              </div>

              <span className="relative text-lg">
                Explorar todos los recursos
              </span>

              <svg
                className="relative w-5 h-5 group-hover:translate-x-2 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>

          {/* Contenedor principal con diseño más sofisticado */}
          <div className="relative bg-white/60 backdrop-blur-md rounded-3xl border border-rose-100/80 p-6 sm:p-8 shadow-2xl shadow-rose-100/50">
            {/* Decoración superior */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-12 h-12 bg-gradient-to-br from-rose-200 to-pink-200 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-2xl">✨</span>
              </div>
            </div>

            {/* Lista de recursos */}
            <div className="pt-4">
              <RecursosList recursos={recursosData} />
            </div>
          </div>

          {/* Footer decorativo más elegante */}
          <div className="mt-10 pt-8 border-t border-gradient-to-r from-transparent via-rose-200/50 to-transparent">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-center">
              {/* Indicadores animados */}
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-rose-400 rounded-full animate-pulse"></span>
                  <span className="w-2 h-2 bg-pink-400 rounded-full animate-pulse animation-delay-75"></span>
                  <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse animation-delay-150"></span>
                </div>
              </div>

              {/* Mensaje inspiracional */}
              <div className="text-rose-600/70">
                <p className="font-medium italic text-lg">
                  Conecta con tu esencia interior
                </p>
                <p className="text-sm text-rose-500/60 mt-1">
                  Tu viaje de autodescubrimiento comienza aquí
                </p>
              </div>

              {/* Indicadores animados espejo */}
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse animation-delay-150"></span>
                  <span className="w-2 h-2 bg-pink-400 rounded-full animate-pulse animation-delay-75"></span>
                  <span className="w-2 h-2 bg-rose-400 rounded-full animate-pulse"></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Efecto de brillo sutil en toda la sección */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-rose-100/10 pointer-events-none group-hover:opacity-70 transition-opacity duration-500"></div>
      </section>

      {/* Estilos CSS adicionales para las animaciones */}
      <style jsx>{`
        .animation-delay-75 {
          animation-delay: 0.075s;
        }
        .animation-delay-150 {
          animation-delay: 0.15s;
        }
      `}</style>
    </main>
  );
}
