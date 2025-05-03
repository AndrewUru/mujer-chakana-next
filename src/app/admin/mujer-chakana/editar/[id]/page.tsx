"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function EditarArquetipoPage() {
  const { id } = useParams();
  const router = useRouter();

  interface Arquetipo {
    arquetipo: string;
    descripcion: string;
    elemento: string;
    imagen_url: string;
    audio_url: string;
    ritual_pdf: string;
    tip_extra: string;
  }

  const [arquetipo, setArquetipo] = useState<Arquetipo | null>(null);
  const [loading, setLoading] = useState(true);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  // Cargar datos del arquetipo
  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from("mujer_chakana")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error cargando arquetipo:", error.message);
        setMensajeError("No se pudo cargar el arquetipo.");
        return;
      }

      setArquetipo(data);
      setLoading(false);
    }

    fetchData();
  }, [id]);

  // Función de actualizar
  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!arquetipo) return;

    setGuardando(true);
    setMensajeExito(null);
    setMensajeError(null);

    const { error } = await supabase
      .from("mujer_chakana")
      .update({
        arquetipo: arquetipo.arquetipo,
        descripcion: arquetipo.descripcion,
        elemento: arquetipo.elemento,
        imagen_url: arquetipo.imagen_url,
        audio_url: arquetipo.audio_url,
        ritual_pdf: arquetipo.ritual_pdf,
        tip_extra: arquetipo.tip_extra,
      })
      .eq("id", id);

    setGuardando(false);

    if (error) {
      console.error("Error actualizando arquetipo:", error.message);
      setMensajeError("Ocurrió un error al guardar los cambios.");
      return;
    }

    setMensajeExito("✅ Cambios guardados correctamente.");
    setTimeout(() => {
      router.push("/admin/mujer-chakana");
    }, 2000);
  }

  if (loading || !arquetipo) {
    return (
      <div className="min-h-screen flex items-center justify-center text-pink-700">
        Cargando arquetipo...
      </div>
    );
  }

  return (
    <main className="max-w-3xl bg-white/90 mx-auto py-10 px-6 rounded-2xl shadow-md pb-20 space-y-6">
      <h1 className="text-3xl font-bold text-pink-800 mb-2">
        Editar Arquetipo
      </h1>
      <p className="text-sm text-gray-600 mb-4">
        Modifica los datos del arquetipo seleccionado. Los campos marcados con *
        son obligatorios.
      </p>

      {/* Mensajes de éxito o error */}
      {mensajeExito && (
        <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded shadow mb-4">
          {mensajeExito}
        </div>
      )}

      {mensajeError && (
        <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded shadow mb-4">
          {mensajeError}
        </div>
      )}

      <form onSubmit={handleUpdate} className="space-y-5">
        {/* Nombre del Arquetipo */}
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-pink-700">
            Nombre del Arquetipo *
          </label>
          <input
            type="text"
            value={arquetipo.arquetipo}
            onChange={(e) =>
              setArquetipo({ ...arquetipo, arquetipo: e.target.value })
            }
            required
            className="border border-pink-300 p-3 rounded-lg focus:ring-2 focus:ring-pink-400 placeholder-gray-400"
            placeholder="Ej. La Sabia"
          />
        </div>

        {/* Descripción */}
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-pink-700">Descripción *</label>
          <textarea
            value={arquetipo.descripcion}
            onChange={(e) =>
              setArquetipo({ ...arquetipo, descripcion: e.target.value })
            }
            required
            rows={4}
            className="border border-pink-300 p-3 rounded-lg focus:ring-2 focus:ring-pink-400 placeholder-gray-400"
            placeholder="Breve descripción simbólica del arquetipo."
          />
        </div>

        {/* Elemento */}
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-pink-700">Elemento *</label>
          <select
            value={arquetipo.elemento}
            onChange={(e) =>
              setArquetipo({ ...arquetipo, elemento: e.target.value })
            }
            required
            className="border border-pink-300 p-3 rounded-lg focus:ring-2 focus:ring-pink-400"
          >
            <option value="">Selecciona un elemento</option>
            <option value="Agua">Agua</option>
            <option value="Tierra">Tierra</option>
            <option value="Fuego">Fuego</option>
            <option value="Aire">Aire</option>
          </select>
        </div>

        {/* Imagen URL */}
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-pink-700">Imagen URL</label>
          <input
            type="text"
            value={arquetipo.imagen_url}
            onChange={(e) =>
              setArquetipo({ ...arquetipo, imagen_url: e.target.value })
            }
            className="border border-pink-300 p-3 rounded-lg focus:ring-2 focus:ring-pink-400 placeholder-gray-400"
            placeholder="https://..."
          />
        </div>

        {/* Audio URL */}
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-pink-700">Audio URL</label>
          <input
            type="text"
            value={arquetipo.audio_url}
            onChange={(e) =>
              setArquetipo({ ...arquetipo, audio_url: e.target.value })
            }
            className="border border-pink-300 p-3 rounded-lg focus:ring-2 focus:ring-pink-400 placeholder-gray-400"
            placeholder="https://..."
          />
        </div>

        {/* Ritual PDF URL */}
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-pink-700">Ritual PDF URL</label>
          <input
            type="text"
            value={arquetipo.ritual_pdf}
            onChange={(e) =>
              setArquetipo({ ...arquetipo, ritual_pdf: e.target.value })
            }
            className="border border-pink-300 p-3 rounded-lg focus:ring-2 focus:ring-pink-400 placeholder-gray-400"
            placeholder="https://..."
          />
        </div>

        {/* Tip Extra */}
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-pink-700">
            Tip Extra (opcional)
          </label>
          <input
            type="text"
            value={arquetipo.tip_extra}
            onChange={(e) =>
              setArquetipo({ ...arquetipo, tip_extra: e.target.value })
            }
            className="border border-pink-300 p-3 rounded-lg focus:ring-2 focus:ring-pink-400 placeholder-gray-400"
            placeholder="Consejo breve para este arquetipo."
          />
        </div>

        {/* Botón de guardar */}
        <div className="sticky bottom-5">
          <button
            type="submit"
            disabled={guardando}
            className={`w-full bg-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition text-lg ${
              guardando ? "opacity-50 cursor-not-allowed" : "hover:bg-pink-800"
            }`}
          >
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </main>
  );
}
