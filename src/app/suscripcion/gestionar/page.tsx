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
        error: userError,
      } = await supabase.auth.getUser();

      if (!user || userError) {
        console.error("No se encontró usuario:", userError);
        router.push("/");
        return;
      }

      const { data, error } = await supabase
        .from("perfiles")
        .select("*")
        .eq("user_id", user.id)
        .single<Perfil>();

      if (error) {
        console.error("Error al obtener perfil:", error);
      } else {
        setPerfil(data);
      }

      setLoading(false);
    }

    fetchPerfil();
  }, [router]);

  const handleCancelarInternamente = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;
    if (!window.confirm("¿Cancelar tu suscripción? Perderás el acceso al contenido de la membresía.")) return;

    // El servidor cancela también en PayPal cuando la suscripción se creó desde la app.
    const response = await fetch("/api/suscripcion/cancelar", {
      method: "POST",
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const body = await response.json().catch(() => null);

    if (response.ok) {
      setPerfil(prev => (prev ? { ...prev, suscripcion_activa: false, tipo_plan: "gratuito" } : prev));
      alert(
        body?.cancelledInPayPal
          ? "Tu suscripción se ha cancelado. PayPal no realizará más cobros."
          : "Tu suscripción está inactiva aquí. Si la contrataste en PayPal, comprueba allí que también esté cancelada."
      );
    } else {
      alert(body?.error || "No se pudo cancelar la suscripción. Inténtalo de nuevo.");
    }
  };

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
            <div className="space-y-4 pt-6 text-center">
              <a
                href="https://www.paypal.com/myaccount/autopay/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full shadow-md transition"
              >
                Gestionar en PayPal 🌐
              </a>

              <p className="text-sm text-gray-500 italic">
                También puedes cancelar tu suscripción desde aquí.
              </p>

              <button
                onClick={handleCancelarInternamente}
                className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-6 py-3 rounded-full shadow-md hover:shadow-lg hover:from-rose-600 hover:to-pink-700 transition"
              >
                Cancelar suscripción 🌑
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
