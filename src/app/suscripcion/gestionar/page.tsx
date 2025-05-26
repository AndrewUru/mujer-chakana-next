// app/suscripcion/gestionar/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Database } from "@/types/supabase";

type Perfil = Database["public"]["Tables"]["perfiles"]["Row"];

export default function GestionarSuscripcionPage() {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchPerfil() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/");
        return;
      }

      const { data, error } = await supabase
        .from("perfiles")
        .select("tipo_plan, suscripcion_activa, fecha_inicio, fecha_expiracion")
        .eq("user_id", user.id)
        .single<Perfil>();

      if (!error && data) setPerfil(data);
      else console.error("Error al obtener perfil:", error);

      setLoading(false);
    }

    fetchPerfil();
  }, [router]);

  async function handleCancelarSuscripcion() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from("perfiles")
      .update({ suscripcion_activa: false })
      .eq("user_id", user.id);

    if (!error) {
      alert("Tu suscripción ha sido cancelada.");
      router.refresh();
    } else {
      console.error("Error al cancelar:", error);
    }
  }

  if (loading) return <p className="text-center mt-10">Cargando...</p>;

  return (
    <main className="min-h-[60vh] max-w-2xl mx-auto mt-12 p-8 bg-white/90 border-2 border-pink-200 rounded-3xl shadow-lg backdrop-blur-sm space-y-6">
      <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent tracking-wide">
        🌸 Gestión de Suscripción Lunar
      </h1>

      {perfil ? (
        <div className="space-y-5 text-gray-700 text-base leading-relaxed">
          <p>
            <strong className="text-pink-700">🌕 Tipo de Plan:</strong>{" "}
            {perfil.tipo_plan || "Sin plan"}
          </p>

          <p>
            <strong className="text-pink-700">🌱 Inicio del Ciclo:</strong>{" "}
            {perfil.inicio_ciclo
              ? new Date(perfil.inicio_ciclo).toLocaleDateString("es-ES")
              : "No disponible"}
          </p>

          <p>
            <strong className="text-pink-700">🔥 Estado:</strong>{" "}
            {perfil.suscripcion_activa ? (
              <span className="text-green-600 font-semibold">Activa</span>
            ) : (
              <span className="text-red-600 font-semibold">Inactiva</span>
            )}
          </p>

          {perfil.suscripcion_activa && (
            <div className="pt-4 text-center">
              <button
                onClick={() => setShowModal(true)}
                className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-6 py-3 rounded-full shadow-md hover:shadow-lg hover:from-rose-600 hover:to-pink-700 transition"
              >
                Cancelar Suscripción 🌑
              </button>
            </div>
          )}
        </div>
      ) : (
        <p className="text-center text-gray-500 italic">
          No se encontró perfil.
        </p>
      )}
    </main>
  );
}
