"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import CycleCard from "@/components/CycleCard";

export default function DashboardPage() {
  const [day, setDay] = useState<number | null>(null);
  interface MujerChakanaData {
    arquetipo: string;
    elemento: string;
    mensaje: string;
    audio_url: string;
  }

  const [data, setData] = useState<MujerChakanaData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (!user || error) return;

      // Obtener la fecha de inicio del ciclo
      const { data: perfil } = await supabase
        .from("perfiles")
        .select("fecha_inicio")
        .eq("user_id", user.id)
        .single();

      if (!perfil?.fecha_inicio) return;

      // Calcular el día del ciclo
      const fechaInicio = new Date(perfil.fecha_inicio);
      const hoy = new Date();
      const diffTime = hoy.getTime() - fechaInicio.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const diaDelCiclo = (diffDays % 28) + 1;

      setDay(diaDelCiclo);

      // Obtener contenido de la tabla mujer_chakana
      const { data: contenido } = await supabase
        .from("mujer_chakana")
        .select("*")
        .eq("id", diaDelCiclo)
        .single();

      setData(contenido);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <p className="text-center mt-10">Cargando tu ciclo...</p>;

  return (
    <div className="max-w-xl mx-auto mt-10 px-4">
      {data && (
        <CycleCard
          day={day!}
          arquetipo={data.arquetipo}
          elemento={data.elemento}
          mensaje={data.mensaje}
          audioUrl={data.audio_url}
        />
      )}
    </div>
  );
}
