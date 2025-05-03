"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";

interface MujerChakana {
  id: number;
  arquetipo: string;
  elemento: string;
  descripcion: string;
  imagen_url?: string;
  audio_url?: string;
  ritual_pdf?: string;
}

export default function AdminMujerChakanaPage() {
  const router = useRouter();

  const [arquetipos, setArquetipos] = useState<MujerChakana[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  useEffect(() => {
    fetchArquetipos();
  }, []);

  async function fetchArquetipos() {
    setLoading(true);
    setMensajeError(null);

    const { data, error } = await supabase.from("mujer_chakana").select("*");

    if (!error && data) {
      setArquetipos(data);
    } else {
      setMensajeError("No se pudieron cargar los arquetipos.");
    }
    setLoading(false);
  }

  async function deleteArquetipo(id: number) {
    const confirmar = confirm(
      "¿Seguro que deseas eliminar este arquetipo? Esta acción no se puede deshacer."
    );
    if (!confirmar) return;

    const { error } = await supabase
      .from("mujer_chakana")
      .delete()
      .eq("id", id);

    if (!error) {
      setMensajeExito("Arquetipo eliminado correctamente.");
      fetchArquetipos();
      setTimeout(() => setMensajeExito(null), 4000);
    } else {
      setMensajeError("Ocurrió un error al eliminar el arquetipo.");
      setTimeout(() => setMensajeError(null), 4000);
    }
  }

  return (
    <main className="max-w-6xl mx-auto py-10 space-y-8 px-4">
      <h1 className="text-3xl font-bold text-pink-800">
        ✨ Admin - Mujer Chakana
      </h1>

      {/* Mensajes de éxito o error */}
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

      <div className="flex justify-end">
        <button
          className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700 font-semibold shadow"
          onClick={() => router.push("/admin/mujer-chakana/crear")}
        >
          ➕ Crear Nuevo Arquetipo
        </button>
      </div>

      {loading ? (
        <p className="text-pink-600">Cargando arquetipos...</p>
      ) : arquetipos.length === 0 ? (
        <p className="text-gray-500 italic">
          No hay arquetipos registrados aún.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {arquetipos.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-pink-200 rounded-xl p-6 shadow-md space-y-3"
            >
              <h2 className="text-xl font-bold text-pink-800">
                {item.arquetipo}
              </h2>
              <p className="text-sm text-pink-600">Elemento: {item.elemento}</p>
              <p className="text-gray-700 text-sm">{item.descripcion}</p>

              {/* Imagen */}
              {item.imagen_url && (
                <div className="mt-3">
                  <Image
                    src={item.imagen_url}
                    alt={`Imagen del arquetipo ${item.arquetipo}`}
                    className="rounded-lg border border-pink-100 shadow-sm object-cover"
                    width={500}
                    height={192}
                  />
                </div>
              )}

              {/* Audio */}
              {item.audio_url && (
                <div className="mt-3">
                  <audio controls className="w-full">
                    <source src={item.audio_url} type="audio/mpeg" />
                    Tu navegador no soporta audio 😢
                  </audio>
                </div>
              )}

              {/* Ritual PDF */}
              {item.ritual_pdf && (
                <div className="mt-3">
                  <a
                    href={item.ritual_pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-700 hover:underline text-sm"
                  >
                    📄 Ver ritual en PDF
                  </a>
                </div>
              )}

              {/* Botones editar/eliminar */}
              <div className="flex gap-4 pt-4">
                <button
                  className="text-pink-600 hover:underline text-sm"
                  onClick={() =>
                    router.push(`/admin/mujer-chakana/editar/${item.id}`)
                  }
                >
                  ✏️ Editar
                </button>
                <button
                  className="text-rose-500 hover:underline text-sm"
                  onClick={() => deleteArquetipo(item.id)}
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
