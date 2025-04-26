"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    async function checkAdmin() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data: perfil, error } = await supabase
        .from("perfiles")
        .select("rol, display_name")
        .eq("user_id", user.id)
        .single();

      if (error || !perfil || perfil.rol !== "admin") {
        router.push("/dashboard");
        return;
      }

      setUserName(perfil.display_name);
      setLoading(false);
    }

    checkAdmin();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-pink-700">
        Cargando acceso de administradora...
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto py-10 space-y-8">
      <h1 className="text-3xl font-bold text-pink-800">🌟 Admin Dashboard</h1>
      <p className="text-lg text-pink-600">Bienvenida, {userName}</p>

      <section className="bg-white rounded-2xl p-6 shadow-md border border-pink-100">
        <h2 className="text-2xl font-semibold text-pink-700 mb-4">
          Administrar Tablas
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <a
            href="/admin/mujer-chakana"
            className="p-4 rounded-lg bg-pink-50 hover:bg-pink-100 border border-pink-200 transition text-center text-pink-800 font-semibold"
          >
            ✨ Editar Mujer Chakana
          </a>
          <a
            href="/admin/recursos"
            className="p-4 rounded-lg bg-pink-50 hover:bg-pink-100 border border-pink-200 transition text-center text-pink-800 font-semibold"
          >
            🔮 Editar Recursos
          </a>
          {/* Puedes agregar más accesos directos aquí */}
        </div>
      </section>
    </main>
  );
}
