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
    tipo_suscripcion?: string[];
  }

  const [recurso, setRecurso] = useState<Recurso | null>(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from("recursos")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error cargando recurso:", error.message);
        setMensajeError("No se pudo cargar el recurso.");
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

    setGuardando(true);
    setMensajeExito(null);
    setMensajeError(null);

    const { error } = await supabase
      .from("recursos")
      .update({
        titulo: recurso.titulo,
        descripcion: recurso.descripcion,
        url: recurso.url,
        tipo: recurso.tipo,
        
      })
      .eq("id", id);

    setGuardando(false);

    if (!error) {
      setMensajeExito("✅ Recurso actualizado correctamente.");
      setTimeout(() => {
        router.push("/admin/recursos");
      }, 2000);
    } else {
      console.error(error);
      setMensajeError("❌ Error actualizando el recurso.");
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
    <main className="max-w-3xl mx-auto bg-white/80 backdrop-blur-sm py-10 space-y-8 px-6 rounded-2xl shadow-lg pb-24">
      <h1 className="text-3xl font-bold text-pink-800 mb-2">
        ✏️ Editar Recurso
      </h1>
      <p className="text-gray-600 text-sm mb-4">
        Completa o ajusta la información del recurso. Los campos marcados con *
        son obligatorios.
      </p>

      {mensajeExito && (
        <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded shadow">
          {mensajeExito}
        </div>
      )}
      {mensajeError && (
        <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded shadow">
          {mensajeError}
        </div>
      )}

      <div className="space-y-5">
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-pink-700">Título *</label>
          <input
            type="text"
            value={recurso.titulo}
            onChange={(e) => setRecurso({ ...recurso, titulo: e.target.value })}
            required
            className="w-full border border-pink-300 p-3 rounded-lg focus:ring-2 focus:ring-pink-400 placeholder-gray-400"
            placeholder="Título del recurso"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-semibold text-pink-700">Descripción</label>
          <textarea
            value={recurso.descripcion}
            onChange={(e) =>
              setRecurso({ ...recurso, descripcion: e.target.value })
            }
            rows={4}
            className="w-full border border-pink-300 p-3 rounded-lg focus:ring-2 focus:ring-pink-400 placeholder-gray-400"
            placeholder="Descripción breve del recurso"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-semibold text-pink-700">URL *</label>
          <input
            type="text"
            value={recurso.url}
            onChange={(e) => setRecurso({ ...recurso, url: e.target.value })}
            required
            className="w-full border border-pink-300 p-3 rounded-lg focus:ring-2 focus:ring-pink-400 placeholder-gray-400"
            placeholder="https://..."
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-semibold text-pink-700">Tipo de recurso</label>
          <input
            type="text"
            value={recurso.tipo}
            onChange={(e) => setRecurso({ ...recurso, tipo: e.target.value })}
            className="w-full border border-pink-300 p-3 rounded-lg focus:ring-2 focus:ring-pink-400 placeholder-gray-400"
            placeholder="Ej. audio, PDF, video"
          />
        </div>

        {/* Nuevo campo: Plan de acceso */}
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-pink-700">
            Planes de acceso
          </label>

          {Array.isArray(recurso.tipo_suscripcion) &&
          recurso.tipo_suscripcion.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {recurso.tipo_suscripcion.map((plan) => (
                <span
                  key={plan}
                  className="px-3 py-1 text-xs rounded-full bg-rose-100 text-rose-800 border border-rose-200"
                >
                  {plan === "gratuito"
                    ? "Gratuito"
                    : plan === "mensual"
                    ? "Mensual"
                    : "Anual"}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm italic text-gray-500">Sin planes asignados</p>
          )}

          <p className="text-xs text-gray-500 italic mt-1">
            Los planes de acceso no se pueden modificar desde aquí.
          </p>
        </div>

        <div className="pt-4">
          <button
            onClick={handleSave}
            disabled={guardando}
            className={`w-full bg-pink-700 text-white py-3 rounded-xl font-semibold shadow-lg transition text-lg ${
              guardando ? "opacity-50 cursor-not-allowed" : "hover:bg-pink-800"
            }`}
          >
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </main>
  );
}
