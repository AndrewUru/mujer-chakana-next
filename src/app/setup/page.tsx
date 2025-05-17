"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import SetupPerfil from "@/components/SetupPerfil";
import Link from "next/link";

export default function SetupPage() {
  const router = useRouter();

  const [perfil, setPerfil] = useState<{
    tipo_plan: string | null;
    suscripcion_activa: boolean | null;
    updated_at?: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserAndPerfil() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/");
        return;
      }

      const { data, error } = await supabase
        .from("perfiles")
        .select("tipo_plan, suscripcion_activa, updated_at")
        .eq("user_id", user.id)
        .single();

      if (!error && data) {
        setPerfil(data);
      } else {
        console.warn("No se encontró perfil o hubo un error", error);
        setPerfil(null); // ← Para desbloquear la vista aunque sea sin datos
      }

      setLoading(false);
    }

    fetchUserAndPerfil();
  }, [router]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-pink-100 flex flex-col items-center justify-start pb-20 px-6 py-12">
      <div className="max-w-4xl w-full space-y-10">
        <header className="text-center">
          <div className="mt-6 mb-10 mx-auto bg-white/90 border border-pink-200 p-6 rounded-2xl shadow-md max-w-md text-center">
            <h1 className="text-2xl font-extrabold text-pink-800 mb-3 tracking-tight">
              ✨ Bienvenida a tu espacio personal
            </h1>

            <p className="text-lg text-pink-700 mb-6">
              Este es tu lugar para reconectar contigo misma 🌸. Aquí puedes
              ajustar tu perfil, indicar el comienzo de tu ciclo y conocer el
              estado de tu suscripción. Todo está diseñado para acompañarte con
              mensajes, rituales y arquetipos sincronizados con la energía lunar
              🌕.
            </p>

            <h2 className="text-xl font-bold text-pink-700 mb-2">
              💫 Estado de tu Suscripción
            </h2>

            {loading ? (
              <p className="text-sm text-gray-500 italic">Cargando datos...</p>
            ) : perfil && perfil.suscripcion_activa ? (
              <>
                <p className="text-sm text-pink-700 mb-1">
                  Tienes un plan activo:{" "}
                  <span className="font-bold uppercase">
                    {perfil.tipo_plan}
                  </span>
                </p>
                {perfil.updated_at && (
                  <p className="text-sm text-pink-600">
                    Activado desde el{" "}
                    <strong>
                      {new Date(perfil.updated_at).toLocaleDateString("es-ES")}
                    </strong>
                  </p>
                )}
                <Link
                  href="/suscripcion"
                  className="mt-4 inline-block bg-pink-600 hover:bg-pink-700 text-white font-semibold px-5 py-2 rounded-full transition"
                >
                  Cambiar o gestionar mi plan
                </Link>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-600 italic mb-2">
                  Aún no tienes una suscripción activa.
                </p>
                <Link
                  href="/suscripcion"
                  className="inline-block bg-pink-100 hover:bg-pink-200 text-pink-800 font-semibold px-5 py-2 rounded-full border border-pink-300"
                >
                  Ver opciones de suscripción
                </Link>
              </>
            )}
          </div>
        </header>

        <section>
          <SetupPerfil />
        </section>

        <div className="text-center mt-4">
          <Link
            href="/manual"
            className="text-pink-700 underline hover:text-pink-900 font-semibold"
          >
            📖 Ver Manual de Usuario y Moonboard
          </Link>
        </div>
      </div>
    </main>
  );
}
