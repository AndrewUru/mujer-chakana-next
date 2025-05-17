// src/app/admin/recursos/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Breadcrumbs from "@/components/Breadcrumbs";

interface Recurso {
  id: number;
  nombre: string;
  tipo: string;
  descripcion: string;
  url?: string;
}

export default function RecursosAdminPage() {
  const router = useRouter();
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecursos() {
      const { data, error } = await supabase.from("recursos").select("*");
      if (error) {
        console.error("Error cargando recursos:", error.message);
      } else {
        setRecursos(data || []);
      }
      setLoading(false);
    }

    fetchRecursos();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-pink-700">
        Cargando recursos...
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto py-10 space-y-8">
      <div className="bg-white/60 backdrop-blur-md border border-pink-100 rounded-2xl shadow-lg px-6 py-5 mb-6 flex flex-col gap-3 items-start">
        <h1 className="text-3xl font-bold text-pink-800 flex items-center gap-2">
          🔮 Administrar Recursos
        </h1>
        <Breadcrumbs
          items={[{ label: "Admin", href: "/admin" }, { label: "Recursos" }]}
        />

        <button
          onClick={() => router.push("/admin/recursos/nuevo")}
          className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition font-semibold shadow"
        >
          ➕ Añadir nuevo recurso
        </button>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {recursos.map((recurso) => (
          <div
            key={recurso.id}
            className="bg-white border border-pink-100 rounded-xl p-5 shadow"
          >
            <h2 className="text-xl font-semibold text-pink-700">
              {recurso.nombre}
            </h2>
            <p className="text-sm text-gray-600">{recurso.tipo}</p>
            <p className="mt-2 text-gray-700">{recurso.descripcion}</p>

            <div className="flex gap-4 mt-4">
              <button
                onClick={() =>
                  router.push(`/admin/recursos/editar/${recurso.id}`)
                }
                className="text-sm px-3 py-1 rounded-md bg-pink-200 hover:bg-pink-300 text-pink-800"
              >
                ✏️ Editar
              </button>
              <button
                onClick={async () => {
                  if (confirm("¿Seguro que deseas eliminar este recurso?")) {
                    await supabase
                      .from("recursos")
                      .delete()
                      .eq("id", recurso.id);
                    router.refresh();
                  }
                }}
                className="text-sm px-3 py-1 rounded-md bg-rose-200 hover:bg-rose-300 text-rose-800"
              >
                🗑️ Eliminar
              </button>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
