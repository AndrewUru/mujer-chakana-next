"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import CycleCard from "@/components/CycleCard";
import "@/app/globals.css";

interface MujerChakanaData {
  arquetipo: string;
  elemento: string;
  mensaje: string;
  audio_url: string;
}

interface Perfil {
  display_name: string;
  fecha_inicio: string;
  avatar_url: string | null;
  user_id: string;
}

export default function DashboardPage() {
  const [day, setDay] = useState<number | null>(null);
  const [data, setData] = useState<MujerChakanaData | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (!user || error) {
        router.push("/login");
        return;
      }

      const { data: perfilData } = await supabase
        .from("perfiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!perfilData) {
        await supabase.from("perfiles").insert([
          {
            user_id: user.id,
            display_name: user.user_metadata?.name || "",
            avatar_url: user.user_metadata?.avatar_url || "",
            fecha_inicio: null,
          },
        ]);
        router.push("/perfil");
        return;
      }

      if (!perfilData.fecha_inicio) {
        router.push("/perfil");
        return;
      }

      setPerfil(perfilData);

      const fechaInicio = new Date(perfilData.fecha_inicio);
      const hoy = new Date();
      const diffTime = hoy.getTime() - fechaInicio.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const diaDelCiclo = (diffDays % 28) + 1;
      setDay(diaDelCiclo);

      const { data: contenido } = await supabase
        .from("mujer_chakana")
        .select("*")
        .eq("id", diaDelCiclo)
        .single();

      setData(contenido);
      setLoading(false);
    };

    fetchData();
  }, [router]);

  if (loading) return <p className="text-center mt-10">Cargando tu ciclo...</p>;

  return (
    <div className="max-w-xl mx-auto mt-10 px-4 text-center">
      {perfil && (
        <h2 className="text-2xl font-bold text-pink-800 mb-6">
          🌸 ¡Hola, {perfil.display_name}!
        </h2>
      )}

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
