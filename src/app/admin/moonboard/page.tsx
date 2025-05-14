"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import type { PostgrestError } from "@supabase/supabase-js";

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
  const [nuevo, setNuevo] = useState<Omit<FaseLunar, "id">>({
    color: "",
    rango_inicio: 0,
    rango_fin: 0,
    mensaje: "",
    nombre_fase: "",
    simbolo: "",
  });

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

  const handleCreate = async () => {
    const {
      data,
      error,
    }: { data: FaseLunar[] | null; error: PostgrestError | null } =
      await supabase.from("fases_lunares").insert([nuevo]).select();

    if (error) {
      alert("Error creando: " + error.message);
      return;
    }

    if (data && data.length > 0) {
      setFases((prev) => [...prev, data[0]]);
      setNuevo({
        color: "",
        rango_inicio: 0,
        rango_fin: 0,
        mensaje: "",
        nombre_fase: "",
        simbolo: "",
      });
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto bg-rose-50/90 rounded-2xl shadow-xl">
      <h1 className="text-2xl font-bold mb-6 text-pink-900">
        Editar Fases Lunares 🌙
      </h1>

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

          <h2 className="text-xl font-semibold mt-6 mb-3 text-pink-800">
            Agregar nueva fase
          </h2>

          <div className="grid grid-cols-2 gap-4 border p-4 rounded-lg shadow bg-white/80 pb-40">
            <input
              value={nuevo.nombre_fase}
              onChange={(e) =>
                setNuevo({ ...nuevo, nombre_fase: e.target.value })
              }
              placeholder="Nombre de la fase"
              className="border rounded px-2 py-1"
            />
            <input
              value={nuevo.color}
              onChange={(e) => setNuevo({ ...nuevo, color: e.target.value })}
              placeholder="Color"
              className="border rounded px-2 py-1"
            />
            <input
              value={nuevo.simbolo}
              onChange={(e) => setNuevo({ ...nuevo, simbolo: e.target.value })}
              placeholder="Símbolo"
              className="border rounded px-2 py-1"
            />
            <input
              type="number"
              value={nuevo.rango_inicio}
              onChange={(e) =>
                setNuevo({ ...nuevo, rango_inicio: parseFloat(e.target.value) })
              }
              className="border rounded px-2 py-1"
              placeholder="Rango inicio"
            />
            <input
              type="number"
              value={nuevo.rango_fin}
              onChange={(e) =>
                setNuevo({ ...nuevo, rango_fin: parseFloat(e.target.value) })
              }
              className="border rounded px-2 py-1"
              placeholder="Rango fin"
            />
            <textarea
              value={nuevo.mensaje}
              onChange={(e) => setNuevo({ ...nuevo, mensaje: e.target.value })}
              placeholder="Mensaje"
              className="col-span-2 border rounded px-2 py-1"
            />
            <button
              onClick={handleCreate}
              className="col-span-2 mt-2 bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700"
            >
              Crear fase
            </button>
          </div>
        </>
      )}
    </div>
  );
}
