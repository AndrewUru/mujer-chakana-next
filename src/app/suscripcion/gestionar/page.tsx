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
    <main className="max-w-xl mx-auto mt-10 p-6 bg-white border border-pink-100 rounded-2xl shadow-md">
      <h1 className="text-2xl font-bold text-pink-700 mb-4">
        Gestión de Suscripción
      </h1>

      {perfil ? (
        <div className="space-y-4">
          <p>
            <strong>Tipo de plan:</strong> {perfil.tipo_plan || "Sin plan"}
          </p>
          <p>
            <strong>Inicio:</strong>{" "}
            {perfil.inicio_ciclo
              ? new Date(perfil.inicio_ciclo).toLocaleDateString("es-ES")
              : "No disponible"}
          </p>
          {/* Si tienes una fecha de expiración, agrega el campo correspondiente aquí */}
          <p>
            <strong>Estado:</strong>{" "}
            {perfil.suscripcion_activa ? (
              <span className="text-green-600 font-semibold">Activa</span>
            ) : (
              <span className="text-red-600 font-semibold">Inactiva</span>
            )}
          </p>

          {perfil.suscripcion_activa && (
            <button
              onClick={handleCancelarSuscripcion}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all"
            >
              Cancelar Suscripción
            </button>
          )}
        </div>
      ) : (
        <p className="text-gray-600">No se encontró perfil.</p>
      )}
    </main>
  );
}
