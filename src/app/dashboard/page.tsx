"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import "@/app/globals.css";
import { MujerChakanaData, Fase } from "@/types/index";
import { calcularDiaCiclo } from "@/lib/cicloUtils";
import CicloResumen from "@/components/CicloResumen";
import FaseActualCard from "@/components/FaseActualCard";
import CycleCard from "@/components/CycleCard";
import Moonboard from "@/components/Moonboard";
import MoonboardResumen from "@/components/MoonboardResumen";
import LunarModal from "@/components/LunarModal.tsx";

export default function DashboardPage() {
  const [day, setDay] = useState<number | null>(null);
  const [data, setData] = useState<MujerChakanaData | null>(null);
  // Removed unused perfil state
  const [fase, setFase] = useState<Fase | null>(null);
  const [fechaInicioCiclo, setFechaInicioCiclo] = useState<Date | null>(null);
  const [fechaFinCiclo, setFechaFinCiclo] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [showLunar, setShowLunar] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (!user || error) {
        router.push("/auth/login");
        return;
      }

      const { data: perfilData } = await supabase
        .from("perfiles")
        .select("*")
        .single();
      if (!perfilData) {
        router.push("/perfil");
        return;
      }
      const { data: showLunarData } = await supabase
        .from("configuracion")
        .select("show_lunar")
        .eq("user_id", user.id)
        .single();

      setShowLunar(showLunarData?.show_lunar ?? false);

      await supabase
        .from("configuracion")
        .select("show_lunar")
        .eq("user_id", user.id)
        .single();

      const { data: ciclo } = await supabase
        .from("ciclos")
        .select("*")
        .eq("usuario_id", user.id)
        .order("fecha_inicio", { ascending: false })
        .limit(1)
        .single();

      if (!ciclo || !ciclo.fecha_inicio) {
        router.push("/ciclo");
        return;
      }

      const fechaInicio = new Date(ciclo.fecha_inicio);
      const diaDelCiclo = calcularDiaCiclo(fechaInicio.toISOString());

      setDay(diaDelCiclo);
      setFechaInicioCiclo(fechaInicio);

      const fechaFin = new Date(fechaInicio);
      fechaFin.setDate(fechaInicio.getDate() + ciclo.duracion - 1);
      setFechaFinCiclo(fechaFin);

      const { data: contenido } = await supabase
        .from("mujer_chakana")
        .select("*")
        .eq("id", diaDelCiclo)
        .single();

      setData(contenido);

      const { data: faseData } = await supabase
        .from("fases")
        .select("*")
        .eq("ciclo_id", ciclo.id)
        .lte("fecha_inicio", new Date())
        .gte("fecha_fin", new Date())
        .single();

      setFase(faseData);
      setLoading(false);
    };

    fetchData();
  }, [router]);

  if (loading)
    return (
      <p className="text-center text-gray-700 mt-10">🌙 Cargando tu ciclo...</p>
    );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 text-pink-900">
      {/* Removed unused perfil rendering */}
      {fechaInicioCiclo && fechaFinCiclo && (
        <CicloResumen
          day={day ?? 0}
          fechaInicioCiclo={fechaInicioCiclo}
          fechaFinCiclo={fechaFinCiclo}
        />
      )}
      {data ? (
        <CycleCard
          day={data.dia_ciclo}
          arquetipo={data.arquetipo}
          elemento={data.elemento}
          descripcion={data.descripcion}
          audioUrl={data.audio_url}
          tip_extra={data.tip_extra}
          imagenUrl={data.imagen_url}
          ritualPdf={data.ritual_pdf}
          semana={data.semana}
        />
      ) : (
        <p className="text-gray-500">Cargando tu arquetipo del día...</p>
      )}

      {fase && <FaseActualCard fase={fase} />}
      <div className="p-8">
        <Moonboard />
        <MoonboardResumen />
        {showLunar && (
          <LunarModal
            day={day ?? 0}
            fecha={new Date().toISOString().slice(0, 10)}
            onClose={() => setShowLunar(false)}
          />
        )}
      </div>
      <div className="mt-6 flex justify-center gap-4">
        <button
          onClick={() => router.push("/ciclo")}
          className="bg-pink-700 text-white px-4 py-2 rounded-lg hover:bg-pink-800 transition"
        >
          🌙 Ver todo el ciclo
        </button>
      </div>
    </div>
  );
}
