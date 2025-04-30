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
      <div className="flex items-center justify-center h-screen bg-rose-50">
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
    <main className="w-full max-w-5xl mx-auto px-4 mx-auto p-6 space-y-12 text-white-900">
      {/* Encabezado */}
      <section className="bg-pink-100/80 backdrop-blur-sm shadow-md rounded-xl p-3 flex flex-col md:flex-row justify-between items-center gap-2 mb-8">
        <h1 className="text-lg font-semibold text-white-800 flex items-center gap-2">
          🌸 Bienvenida, {userName}
        </h1>
        <p className="text-md">
          Hoy es {fechaActual} — Día {day} de tu ciclo 🌙
        </p>
      </section>

      {/* Resto */}
      {estadoCiclo && (
        <section>
          <EstadoActualCiclo data={estadoCiclo} />
        </section>
      )}

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

      <section className="w-full max-w-5xl mx-auto px-4relative z-10 mx-auto mt-8 sm:mt-12 mb-16 px-4 sm:px-6 lg:px-8">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-pink-100 mb-6">
            🌕 Mi Moonboard Diario
          </h2>
          <Moonboard />
        </div>
      </section>

      {userId && (
        <section>
          <NuevoRegistro userId={userId} />
        </section>
      )}

      <section>
        <h2 className="text-2xl font-semibold mb-4">🔮 Recursos Sagrados</h2>
        <RecursosList recursos={recursosData} />
      </section>

      <div className="flex justify-center mt-10">
        <button
          onClick={handleGoToCiclos}
          className="flex items-center gap-2 bg-gradient-to-r from-pink-400 to-pink-600 text-white font-semibold py-3 px-6 rounded-full shadow-lg hover:shadow-2xl hover:scale-105 transition-transform duration-300"
        >
          🌕 Ver Galería de Arquetipos
        </button>
      </div>
    </main>
  );
}
