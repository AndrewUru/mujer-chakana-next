"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function EditarRecursoPage() {
  const { id } = useParams();
  const router = useRouter();

  interface Recurso {
    titulo: string;
    descripcion: string;
    url: string;
    tipo: string;
  }

  const [recurso, setRecurso] = useState<Recurso | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from("recursos")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error cargando recurso:", error.message);
        setLoading(false);
        return;
      }

      setRecurso(data);
      setLoading(false);
    }

    fetchData();
  }, [id]);

  const handleSave = async () => {
    if (!recurso) return;

    const { error } = await supabase
      .from("recursos")
      .update({
        titulo: recurso.titulo,
        descripcion: recurso.descripcion,
        url: recurso.url,
        tipo: recurso.tipo,
      })
      .eq("id", id);

    if (!error) {
      alert("✅ Recurso actualizado correctamente");
      router.push("/admin/recursos");
    } else {
      console.error(error);
      alert("❌ Error actualizando el recurso");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10 text-pink-700">Cargando recurso...</div>
    );
  }

  if (!recurso) {
    return (
      <div className="text-center py-10 text-red-500">
        ❌ No se encontró el recurso solicitado.
      </div>
    );
  }

  return (
    <main className="max-w-3xl mx-auto py-10 space-y-8">
      <h1 className="text-3xl font-bold text-pink-800">✏️ Editar Recurso</h1>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Título"
          value={recurso.titulo}
          onChange={(e) => setRecurso({ ...recurso, titulo: e.target.value })}
          className="w-full p-3 border rounded-lg"
        />
        <textarea
          placeholder="Descripción"
          value={recurso.descripcion}
          onChange={(e) =>
            setRecurso({ ...recurso, descripcion: e.target.value })
          }
          className="w-full p-3 border rounded-lg"
          rows={5}
        />
        <input
          type="text"
          placeholder="URL del recurso"
          value={recurso.url}
          onChange={(e) => setRecurso({ ...recurso, url: e.target.value })}
          className="w-full p-3 border rounded-lg"
        />
        <input
          type="text"
          placeholder="Tipo de recurso"
          value={recurso.tipo}
          onChange={(e) => setRecurso({ ...recurso, tipo: e.target.value })}
          className="w-full p-3 border rounded-lg"
        />

        <button
          onClick={handleSave}
          className="w-full bg-pink-700 text-white py-3 rounded-lg font-semibold hover:bg-pink-800 transition"
        >
          Guardar cambios
        </button>
      </div>
    </main>
  );
}
