"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import EstadoActualCiclo from "@/components/EstadoActualCiclo";
import { EstadoCiclo, Recurso } from "@/types/index"; // Adjust the path to where EstadoCiclo and Recurso are defined
import Moonboard from "@/components/Moonboard";
import RecursosList from "@/components/RecursosList";
import CicloResumen from "@/components/CicloResumen"; // Ensure this path is correct

export default function DashboardPage() {
  const [userName, setUserName] = useState<string | null>(null);
  const [fechaActual, setFechaActual] = useState<string>("");
  const [day, setDay] = useState<number>(1);
  const [estadoCiclo, setEstadoCiclo] = useState<EstadoCiclo | null>(null);
  const [recursosData, setRecursosData] = useState<Recurso[]>([]);
  const [fechaInicioCiclo, setFechaInicioCiclo] = useState<Date | null>(null);
  const [fechaFinCiclo, setFechaFinCiclo] = useState<Date | null>(null);

  async function loadData() {
    const user = await supabase.auth.getUser();
    if (user.data?.user?.id) {
      const { data: perfil } = await supabase
        .from("perfiles")
        .select("display_name, avatar_url, fecha_inicio")
        .eq("user_id", user.data.user.id)
        .single();

      setUserName(perfil?.display_name || "");

      if (perfil?.fecha_inicio) {
        const inicio = new Date(perfil.fecha_inicio);
        const hoy = new Date();
        const diferencia = Math.floor(
          (hoy.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)
        );
        setDay(diferencia + 1);
        setFechaInicioCiclo(inicio);

        const fin = new Date(inicio);
        fin.setDate(fin.getDate() + 27);
        setFechaFinCiclo(fin);

        setFechaActual(hoy.toLocaleDateString());

        const { data: mujerChakanaData } = await supabase
          .from("mujer_chakana")
          .select("*")
          .eq("dia_ciclo", diferencia + 1)
          .single();

        setEstadoCiclo(mujerChakanaData || null);
      }

      const { data: recursos } = await supabase.from("recursos").select("*");
      setRecursosData(recursos || []);
    }
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
        .eq("dia_ciclo", diferencia + 1)
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
    window.location.href = "/ciclo"; // Redirects to the "Galería de Arquetipos" page
  }

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-12 text-rose-900">
      {/* Encabezado */}
      <section className="w-full bg-pink-100/80 backdrop-blur-sm shadow-md rounded-xl p-3 flex flex-col md:flex-row justify-between items-center gap-2 mb-8">
        <h1 className="text-lg font-semibold text-pink-800 flex items-center gap-2">
          🌸 Bienvenida, {userName}
        </h1>
        <p className="text-sm text-rose-700">
          Hoy es {fechaActual} — Día {day} de tu ciclo 🌙
        </p>
      </section>

      {/* Estado Actual del Ciclo */}
      {estadoCiclo && (
        <section>
          <EstadoActualCiclo data={estadoCiclo} />
        </section>
      )}

      {/* NUEVO: Mi Moonboard Diario */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">🌓 Mi Moonboard Diario</h2>
        <Moonboard />
      </section>

      {/* CICLO RESUMEN*/}

      {day && fechaInicioCiclo && fechaFinCiclo && estadoCiclo && (
        <section>
          <CicloResumen
            day={day}
            fechaInicioCiclo={fechaInicioCiclo}
            fechaFinCiclo={fechaFinCiclo}
            userName={userName ?? undefined}
            mujerChakanaData={estadoCiclo}
          />
          <div className="flex justify-center mt-6">
            <button
              onClick={loadData}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-700 text-white font-semibold py-2 px-6 rounded-full shadow hover:scale-105 transition-transform duration-300"
            >
              🔄 Refrescar Ciclo
            </button>
          </div>
        </section>
      )}

      {/* Recursos */}
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
