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

      if (!error) {
        setPerfil(data);
      }

      setLoading(false);
    }

    fetchUserAndPerfil();
  }, [router]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-pink-100 flex flex-col items-center justify-start pb-20 px-6 py-12">
      <div className="max-w-4xl w-full space-y-10">
        <header className="text-center">
          <h1 className="text-2xl font-extrabold text-pink-800 mb-3 tracking-tight">
            🌕 Conecta con tu Ciclo
          </h1>

          <p className="text-lg text-pink-700 mb-6">
            Para comenzar tu recorrido, necesitamos saber en qué momento estás
            de tu ciclo lunar personal. Esta fecha será la base para acompañarte
            con mensajes, rituales y arquetipos sincronizados con la luna.
          </p>

          <div className="text-center mt-4">
            <Link
              href="/manual"
              className="text-pink-700 underline hover:text-pink-900 font-semibold"
            >
              📖 Ver Manual de Usuario y Moonboard
            </Link>
          </div>

          {!loading && perfil && (
            <div className="mt-8 bg-white/70 border border-pink-200 p-4 rounded-xl shadow-sm inline-block">
              {perfil.suscripcion_activa ? (
                <p className="text-sm text-pink-700 font-medium">
                  🌸 Suscripción activa:{" "}
                  <span className="font-bold uppercase">
                    {perfil.tipo_plan}
                  </span>{" "}
                  {perfil.updated_at && (
                    <>
                      desde el{" "}
                      {new Date(perfil.updated_at).toLocaleDateString()}
                    </>
                  )}
                </p>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  No tienes una suscripción activa actualmente.
                </p>
              )}
            </div>
          )}
        </header>

        <section>
          <SetupPerfil />
        </section>
      </div>
    </main>
  );
}
