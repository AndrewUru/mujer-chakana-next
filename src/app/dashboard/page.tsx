"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { calcularDiaCiclo } from "@/lib/cicloUtils";
import { MujerChakanaData, Fase } from "@/types/index";
import CicloResumen from "@/components/CicloResumen";
import CycleCard from "@/components/CycleCard";
import FaseActualCard from "@/components/FaseActualCard";
import Moonboard from "@/components/Moonboard";
import MoonboardResumen from "@/components/MoonboardResumen";
import LunarModal from "@/components/LunarModal.tsx";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [day, setDay] = useState(0);
  const [data, setData] = useState<MujerChakanaData | null>(null);
  const [fase, setFase] = useState<Fase | null>(null);
  const [fechas, setFechas] = useState<{ inicio: Date; fin: Date } | null>(
    null
  );
  const [showLunar, setShowLunar] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error || !user) return router.push("/auth/login");

      const { data: perfil } = await supabase
        .from("perfiles")
        .select("*")
        .single();
      if (!perfil) return router.push("/perfil");

      const { data: config } = await supabase
        .from("configuracion")
        .select("show_lunar")
        .eq("user_id", user.id)
        .single();
      setShowLunar(config?.show_lunar ?? false);

      const { data: ciclo } = await supabase
        .from("ciclos")
        .select("*")
        .eq("usuario_id", user.id)
        .order("fecha_inicio", { ascending: false })
        .limit(1)
        .single();
      if (!ciclo?.fecha_inicio) return router.push("/ciclo");

      const fechaInicio = new Date(ciclo.fecha_inicio);
      const diaCiclo = calcularDiaCiclo(fechaInicio.toISOString());
      setDay(diaCiclo);

      const fechaFin = new Date(fechaInicio);
      fechaFin.setDate(fechaInicio.getDate() + ciclo.duracion - 1);
      setFechas({ inicio: fechaInicio, fin: fechaFin });

      const { data: contenido } = await supabase
        .from("mujer_chakana")
        .select("*")
        .eq("id", diaCiclo)
        .single();
      setData(contenido);

      const { data: faseActual } = await supabase
        .from("fases")
        .select("*")
        .eq("ciclo_id", ciclo.id)
        .lte("fecha_inicio", new Date())
        .gte("fecha_fin", new Date())
        .single();
      setFase(faseActual);

      setLoading(false);
    };
    loadData();
  }, [router]);

  if (loading)
    return (
      <p className="text-center text-gray-700 mt-10">🌙 Cargando tu ciclo...</p>
    );

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-10 text-rose-900">
      {fechas && (
        <CicloResumen
          day={day}
          fechaInicioCiclo={fechas.inicio}
          fechaFinCiclo={fechas.fin}
        />
      )}

      {data && (
        <div className="bg-white/80 backdrop-blur-md shadow-md rounded-3xl p-6 space-y-4">
          <h2 className="text-xl font-bold text-fuchsia-700 flex items-center gap-2">
            🌺 Día {data.dia_ciclo} – {data.arquetipo}
          </h2>

          <p className="uppercase text-xs tracking-wide text-pink-500">
            ELEMENTO: {data.elemento}
          </p>

          <img
            src={data.imagen_url}
            alt={data.arquetipo}
            className="rounded-xl object-cover w-full h-52"
          />

          <p className="text-sm leading-relaxed">{data.descripcion}</p>

          <div className="bg-rose-100 p-3 rounded-lg text-rose-800 text-sm italic border-l-4 border-fuchsia-400">
            ✧ {data.tip_extra}
          </div>
        </div>
      )}

      {fase && <FaseActualCard fase={fase} />}

      <div className="space-y-6">
        <Moonboard />
        <MoonboardResumen />
        {showLunar && (
          <LunarModal
            day={day}
            fecha={new Date().toISOString().slice(0, 10)}
            onClose={() => setShowLunar(false)}
          />
        )}
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => router.push("/ciclo")}
          className="mt-6 text-pink-700 border border-pink-300 px-6 py-2 rounded-full hover:bg-pink-100 transition-all"
        >
          ✧ Ver el Mandala Lunar completo
        </button>
      </div>
    </div>
  );
}
