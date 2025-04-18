"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
      console.log("Usuario actual:", user, error);

      // Verificar si el perfil existe
      const { data: perfil } = await supabase
        .from("perfiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      // Si no hay perfil, creamos uno nuevo vacío
      if (!perfil) {
        await supabase.from("perfiles").insert([
          {
            user_id: user.id,
            display_name: user.user_metadata?.name || "",
            avatar_url: user.user_metadata?.avatar_url || "",
            fecha_inicio: null,
          },
        ]);
        router.push("/perfil"); // Redirige para que configure su ciclo
        return;
      }

      // Si existe pero no tiene fecha de inicio, también redirigimos
      if (!perfil.fecha_inicio) {
        router.push("/perfil");
        return;
      }

      // Calcular día del ciclo
      const fechaInicio = new Date(perfil.fecha_inicio);
      const hoy = new Date();
      const diffTime = hoy.getTime() - fechaInicio.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const diaDelCiclo = (diffDays % 28) + 1;

      setDay(diaDelCiclo);

      // Traer contenido del día correspondiente
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
