"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import "@/app/globals.css";
import Image from "next/image";
import CycleCard from "@/components/CycleCard";

interface MujerChakanaData {
  id: number;
  dia_ciclo: number;
  arquetipo: string;
  descripcion: string;
  imagen_url?: string;
  elemento: string;
  audio_url?: string;
  ritual_pdf?: string;
  tip_extra: string;
  semana?: number;
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

      if (!perfilData || !perfilData.fecha_inicio) {
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

  if (loading)
    return (
      <p className="text-center text-gray-700 mt-10">🌙 Cargando tu ciclo...</p>
    );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 text-pink-900">
      {/* Encabezado de bienvenida */}
      {perfil && (
        <div className="flex items-center gap-4 mb-6 bg-pink-50 border border-pink-100 rounded-xl p-4 shadow">
          {perfil.avatar_url ? (
            <Image
              src={perfil.avatar_url}
              alt="avatar"
              width={60}
              height={60}
              className="rounded-full object-cover border-2 border-pink-500"
            />
          ) : (
            <div className="w-[60px] h-[60px] rounded-full bg-pink-200 flex items-center justify-center text-pink-500 font-bold text-xl">
              {perfil.display_name.charAt(0)}
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold">
              ¡Hola, {perfil.display_name}!
            </h2>
            <p className="text-sm text-pink-600">Día {day} de tu ciclo 🌕</p>
          </div>
        </div>
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

      {/* Acciones sugeridas */}
      <div className="mt-6 flex justify-center gap-4">
        <button
          onClick={() => router.push("/perfil")}
          className="border border-pink-300 text-pink-700 px-4 py-2 rounded-lg hover:bg-pink-100 transition"
        >
          Editar perfil
        </button>
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
