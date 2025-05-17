"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Breadcrumbs from "@/components/Breadcrumbs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type FaseLunar = {
  id: string;
  color: string;
  rango_inicio: number;
  rango_fin: number;
  mensaje: string;
  nombre_fase: string;
  simbolo: string;
};

export default function EditarMoonboardPage() {
  const [fases, setFases] = useState<FaseLunar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("fases_lunares")
        .select("*")
        .returns<FaseLunar[]>();

      if (!error && data) setFases(data as FaseLunar[]);
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleUpdate = async (
    id: string,
    field: keyof FaseLunar,
    value: string | number
  ) => {
    const { error } = await supabase
      .from("fases_lunares")
      .update({ [field]: value })
      .eq("id", id);

    if (!error) {
      setFases((prev) =>
        prev.map((f) => (f.id === id ? { ...f, [field]: value } : f))
      );
    } else {
      alert("Error actualizando: " + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("fases_lunares")
      .delete()
      .eq("id", id)
      .select(); // No obligatorio, pero mantiene consistencia con otras operaciones

    if (error) {
      alert("Error eliminando: " + error.message);
      return;
    }

    setFases((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSaveAll = async () => {
    try {
      for (const fase of fases) {
        await updateFaseInDB(fase); // Implementa esta función según cómo guardas los datos (Supabase, API, etc.)
      }
      alert("Cambios guardados exitosamente 🌕");
    } catch (error) {
      console.error("Error al guardar fases:", error);
      alert("Hubo un error al guardar los cambios.");
    }
  };

  const updateFaseInDB = async (fase: FaseLunar) => {
    const { error } = await supabase
      .from("fases_lunares")
      .update({
        nombre_fase: fase.nombre_fase,
        color: fase.color,
        simbolo: fase.simbolo,
        rango_inicio: fase.rango_inicio,
        rango_fin: fase.rango_fin,
        mensaje: fase.mensaje,
      })
      .eq("id", fase.id);

    if (error) {
      throw new Error(
        `Error actualizando fase ${fase.nombre_fase}: ${error.message}`
      );
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto bg-rose-50/90 rounded-2xl shadow-xl pb-40">
      <h1 className="text-2xl font-bold mb-6 text-pink-900">
        Editar Fases Lunares 🌙
      </h1>
      <Breadcrumbs
        items={[{ label: "Admin", href: "/admin" }, { label: "Moonboard" }]}
      />

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <>
          {fases.map((fase) => (
            <div
              key={fase.id}
              className="bg-white/80 border rounded-lg p-4 mb-6 shadow-md"
            >
              <div className="grid grid-cols-2 gap-4">
                <input
                  value={fase.nombre_fase || ""}
                  onChange={(e) =>
                    handleUpdate(fase.id, "nombre_fase", e.target.value)
                  }
                  placeholder="Nombre de la fase"
                  className="border rounded px-2 py-1"
                />
                <input
                  value={fase.color}
                  onChange={(e) =>
                    handleUpdate(fase.id, "color", e.target.value)
                  }
                  placeholder="Color"
                  className="border rounded px-2 py-1"
                />
                <input
                  value={fase.simbolo}
                  onChange={(e) =>
                    handleUpdate(fase.id, "simbolo", e.target.value)
                  }
                  placeholder="Símbolo"
                  className="border rounded px-2 py-1"
                />
                <input
                  type="number"
                  value={fase.rango_inicio}
                  onChange={(e) =>
                    handleUpdate(
                      fase.id,
                      "rango_inicio",
                      parseFloat(e.target.value)
                    )
                  }
                  className="border rounded px-2 py-1"
                  placeholder="Rango inicio"
                />
                <input
                  type="number"
                  value={fase.rango_fin}
                  onChange={(e) =>
                    handleUpdate(
                      fase.id,
                      "rango_fin",
                      parseFloat(e.target.value)
                    )
                  }
                  className="border rounded px-2 py-1"
                  placeholder="Rango fin"
                />
                <textarea
                  value={fase.mensaje}
                  onChange={(e) =>
                    handleUpdate(fase.id, "mensaje", e.target.value)
                  }
                  placeholder="Mensaje"
                  className="col-span-2 border rounded px-2 py-1"
                />
              </div>
              <button
                onClick={() => handleDelete(fase.id)}
                className="mt-3 text-sm text-red-600 hover:underline"
              >
                Eliminar fase
              </button>
            </div>
          ))}

          <div className="text-center mt-6">
            <button
              onClick={handleSaveAll}
              className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-2xl shadow-lg"
            >
              Guardar cambios 💾
            </button>
          </div>
        </>
      )}
    </div>
  );
}
