"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [userEmail, setUserEmail] = useState("");
  const [diaCiclo, setDiaCiclo] = useState<number | null>(null);
  interface Arquetipo {
    dia_ciclo: number;
    arquetipo: string;
    descripcion: string;
    elemento: string;
    tip_extra: string;
    audio_url?: string;
    ritual_pdf?: string;
  }

  const [arquetipo, setArquetipo] = useState<Arquetipo | null>(null);
  const [nota, setNota] = useState("");
  const [mensaje, setMensaje] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.push("/login");
        return;
      }

      const user = session.user;
      setUserEmail(user.email);

      // Buscar perfil
      const { data: perfil } = await supabase
        .from("perfiles")
        .select("fecha_inicio")
        .eq("id", user.id)
        .single();

      let fechaInicio = new Date();

      if (!perfil?.fecha_inicio) {
        // Guardar automáticamente si es la primera vez
        await supabase
          .from("perfiles")
          .insert({ id: user.id, fecha_inicio: fechaInicio });
      } else {
        fechaInicio = new Date(perfil.fecha_inicio);
      }

      const hoy = new Date();
      const diffDays = Math.floor(
        (hoy.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24)
      );
      const dia = (diffDays % 28) + 1;
      setDiaCiclo(dia);

      // Obtener contenido del día
      const { data: arquetipoData } = await supabase
        .from("mujer_chakana")
        .select("*")
        .eq("dia_ciclo", dia)
        .single();

      setArquetipo(arquetipoData);
    }

    fetchData();
  }, [router]);

  const guardarNota = async (e: React.FormEvent) => {
    e.preventDefault();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) return;

    const { error } = await supabase.from("notas").upsert({
      usuario_id: session.user.id,
      dia_ciclo: diaCiclo,
      texto: nota,
      fecha: new Date().toISOString(),
    });

    if (error) {
      setMensaje("⚠️ Hubo un error al guardar la nota.");
    } else {
      setMensaje("✨ Nota guardada correctamente.");
      setNota("");
    }
  };

  return (
    <main className="min-h-screen bg-pink-50 p-6 text-pink-900 font-sans">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Hola, {userEmail}</h1>

        {diaCiclo && arquetipo ? (
          <>
            <p className="mb-2">
              Estás en el <strong>día {diaCiclo}</strong> de tu ciclo de 28
              días.
            </p>

            <div className="bg-white p-4 rounded-xl shadow border border-pink-200 mb-6">
              <h2 className="text-2xl font-semibold">
                🌕 Día {arquetipo.dia_ciclo} · {arquetipo.arquetipo}
              </h2>
              <p className="mt-2">{arquetipo.descripcion}</p>
              <p className="mt-2 text-sm">
                <strong>Elemento:</strong> {arquetipo.elemento}
              </p>
              <p className="mt-1 text-sm">
                <strong>Tip:</strong> {arquetipo.tip_extra}
              </p>

              {arquetipo.audio_url && (
                <audio controls className="w-full mt-4">
                  <source src={arquetipo.audio_url} type="audio/mpeg" />
                </audio>
              )}

              {arquetipo.ritual_pdf && (
                <a
                  href={arquetipo.ritual_pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-pink-700 underline mt-2 inline-block"
                >
                  📜 Ver ritual del día
                </a>
              )}
            </div>

            <form onSubmit={guardarNota} className="space-y-4 mb-6">
              <label className="block font-medium">✍️ ¿Qué sentiste hoy?</label>
              <textarea
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                className="w-full p-3 border border-pink-300 rounded-lg shadow-sm"
                rows={4}
                placeholder="Escribe tu nota personal..."
              />
              <button
                type="submit"
                className="bg-pink-700 text-white px-4 py-2 rounded-lg hover:bg-pink-800"
              >
                Guardar nota
              </button>
              {mensaje && <p className="text-sm text-pink-600">{mensaje}</p>}
            </form>

            <a href="/setup" className="text-sm underline text-pink-700">
              ← Cambiar fecha de inicio
            </a>
          </>
        ) : (
          <p className="text-sm text-gray-600">Cargando datos del ciclo...</p>
        )}
      </div>
    </main>
  );
}
