"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import EstadoActualCiclo from "@/components/EstadoActualCiclo";
import Moonboard from "@/components/Moonboard";
import RecursosList from "@/components/RecursosList";

export default function DashboardPage() {
  const [userName, setUserName] = useState<string | null>(null);
  const [fechaActual, setFechaActual] = useState<string>("");
  const [day, setDay] = useState<number>(1);
  const [estadoCiclo, setEstadoCiclo] = useState<any>(null);
  const [recursosData, setRecursosData] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const user = await supabase.auth.getUser();
      if (user.data?.user?.id) {
        // Obtener perfil
        const { data: perfil } = await supabase
          .from("perfiles")
          .select("display_name")
          .eq("user_id", user.data.user.id)
          .single();
        setUserName(perfil?.display_name || "");

        // Obtener ciclo actual
        const { data: cicloActual } = await supabase
          .from("ciclos")
          .select("fecha_inicio")
          .eq("usuario_id", user.data.user.id)
          .order("fecha_inicio", { ascending: false })
          .limit(1)
          .single();

        if (cicloActual?.fecha_inicio) {
          const inicio = new Date(cicloActual.fecha_inicio);
          const hoy = new Date();
          const diferencia = Math.floor(
            (hoy.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)
          );
          setDay(diferencia + 1);
          setFechaActual(hoy.toLocaleDateString());

          // ✅ Obtener estado actual del ciclo (mujer_chakana)
          const { data: mujerChakanaData } = await supabase
            .from("mujer_chakana")
            .select("*")
            .eq("dia_ciclo", diferencia + 1)
            .single();

          setEstadoCiclo(mujerChakanaData);
        }

        // Obtener recursos
        const { data: recursos } = await supabase.from("recursos").select("*");

        setRecursosData(recursos || []);
      }
    }

    loadData();
  }, []);

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-12 text-rose-900">
      {/* Encabezado */}
      <section className="space-y-4">
        <h1 className="text-3xl font-bold">🌸 Bienvenida, {userName}</h1>
        <p className="text-lg">
          Hoy es {fechaActual} — Día {day} de tu ciclo 🌙
        </p>
      </section>

      {/* Estado Actual del Ciclo */}
      {estadoCiclo && (
        <section>
          <EstadoActualCiclo data={estadoCiclo} />
        </section>
      )}

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

      {/* Recursos */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">🔮 Recursos Sagrados</h2>
        <RecursosList recursos={recursosData} />
      </section>
    </main>
  );
}
