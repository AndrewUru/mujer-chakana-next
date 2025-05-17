"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import Breadcrumbs from "@/components/Breadcrumbs";

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
    <main className="max-w-6xl mx-auto py-8 space-y-6 px-2 sm:px-6 pb-40">
      <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-pink-100 px-6 py-5 mb-6 flex flex-col gap-2">
        <Breadcrumbs
          items={[
            { label: "Admin", href: "/admin" },
            { label: "Mujer Chakana", href: "/admin/mujer-chakana" },
            { label: "Editar Arquetipo" },
          ]}
        />

        <h1 className="text-2xl font-extrabold text-pink-800 tracking-tight">
          ✨ Admin · Mujer Chakana
        </h1>
      </div>

      {/* Mensajes de éxito o error */}
      {mensajeExito && (
        <div className="bg-green-50 border border-green-300 text-green-700 px-3 py-2 rounded-lg shadow text-sm">
          {mensajeExito}
        </div>
      )}
      {mensajeError && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-3 py-2 rounded-lg shadow text-sm">
          {mensajeError}
        </div>
      )}

      <div className="flex justify-end mb-2">
        <button
          className="bg-pink-600 text-white px-4 py-2 rounded-xl hover:bg-pink-700 font-semibold shadow flex items-center gap-2 transition"
          onClick={() => router.push("/admin/mujer-chakana/crear")}
        >
          <span className="text-lg">+</span> Nuevo Arquetipo
        </button>
      </div>

      {loading ? (
        <p className="text-pink-600">Cargando arquetipos...</p>
      ) : arquetipos.length === 0 ? (
        <p className="text-gray-500 italic">
          No hay arquetipos registrados aún.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {arquetipos.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-pink-100 rounded-2xl p-4 shadow-md hover:shadow-lg transition-all flex flex-col gap-2 relative group"
            >
              {/* Imagen pequeña */}
              {item.imagen_url && (
                <div className="flex justify-center mb-2">
                  <Image
                    src={item.imagen_url}
                    alt={`Imagen del arquetipo ${item.arquetipo}`}
                    className="rounded-xl border border-pink-50 object-cover shadow w-28 h-28"
                    width={112}
                    height={112}
                  />
                </div>
              )}

              {/* Info principal */}
              <h2 className="text-base font-bold text-pink-800 truncate">
                {item.arquetipo}
              </h2>
              <p className="text-xs text-pink-600 mb-1">
                Elemento: <span className="font-semibold">{item.elemento}</span>
              </p>
              <p className="text-gray-700 text-xs line-clamp-3">
                {item.descripcion}
              </p>

              {/* Audio y PDF */}
              <div className="flex flex-col gap-1 mt-2">
                {item.audio_url && (
                  <audio controls className="w-full rounded">
                    <source src={item.audio_url} type="audio/mpeg" />
                    Tu navegador no soporta audio.
                  </audio>
                )}
                {item.ritual_pdf && (
                  <a
                    href={item.ritual_pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-700 hover:underline text-xs mt-1"
                  >
                    📄 Ritual PDF
                  </a>
                )}
              </div>

              {/* Acciones */}
              <div className="flex gap-4 mt-3">
                <button
                  className="flex items-center gap-1 text-pink-600 hover:underline text-xs"
                  onClick={() =>
                    router.push(`/admin/mujer-chakana/editar/${item.id}`)
                  }
                >
                  <span className="text-lg">✏️</span> Editar
                </button>
                <button
                  className="flex items-center gap-1 text-rose-500 hover:underline text-xs"
                  onClick={() => deleteArquetipo(item.id)}
                >
                  <span className="text-lg">🗑️</span> Eliminar
                </button>
              </div>

              {/* Sombra extra en hover */}
              <span className="absolute inset-0 rounded-2xl ring-1 ring-pink-100 group-hover:ring-rose-200 transition pointer-events-none" />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
