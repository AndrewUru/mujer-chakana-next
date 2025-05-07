"use client";

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
import { Flower, Moon, Leaf, Gem, GalleryThumbnails } from "lucide-react";

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

  async function loadData() {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/");
      return;
    }

    setUserId(user.id);

    const { data: perfil } = await supabase
      .from("perfiles")
      .select("display_name, avatar_url, fecha_inicio")
      .eq("user_id", user.id)
      .single();

    setUserName(perfil?.display_name || "");

    if (perfil?.fecha_inicio) {
      const inicio = new Date(perfil.fecha_inicio);
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

    const { data: recursos } = await supabase.from("recursos").select("*");
    setRecursosData(recursos || []);
    setLoading(false); // << Finaliza carga
  }

  useEffect(() => {
    loadData();
  }, []);

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
      setDay(diferencia + 1);
    }

    recargarEstadoCiclo();
  }, [fechaInicioCiclo]);

  function handleGoToCiclos(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void {
    event.preventDefault();
    window.location.href = "/ciclo";
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
    <main className="w-full max-w-6xl  px-4 mx-auto p-6 space-y-12 text-pink-900 pb-32">
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
      <section className="relative mt-12 bg-gradient-to-br from-pink-50 via-rose-100 to-white p-6 rounded-3xl shadow-lg border border-pink-100">
        <div className="absolute -top-6 left-6 bg-white text-pink-700 px-4 py-1 rounded-full shadow text-sm font-medium border border-pink-200">
          ✨ Espacio de transformación
        </div>
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold text-pink-800 mb-2 flex items-center gap-2">
            <Gem className="w-6 h-6 text-pink-700" /> Recursos Sagrados
          </h2>
          <p className="text-pink-700 text-base">
            Accede a audios, rituales y guías para tu camino interior. Este
            espacio es para ti 🌸
          </p>
        </div>
        <RecursosList recursos={recursosData} />
      </section>

      {/* BOTÓN GALERÍA */}
      <div className="flex justify-center mt-10">
        <button
          onClick={handleGoToCiclos}
          className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-pink-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-2xl hover:scale-105 transition-transform duration-300"
        >
          <GalleryThumbnails className="w-5 h-5" /> Ver Galería de Arquetipos
        </button>
      </div>
    </main>
  );
}
