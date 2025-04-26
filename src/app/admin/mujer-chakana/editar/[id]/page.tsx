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

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from("mujer_chakana")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error cargando arquetipo:", error.message);
        return;
      }

      setArquetipo(data);
      setLoading(false);
    }

    fetchData();
  }, [id]);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();

    if (!arquetipo) return;

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

    if (error) {
      console.error("Error actualizando arquetipo:", error.message);
      return;
    }

    router.push("/admin/mujer-chakana");
  }

  if (loading || !arquetipo) {
    return (
      <div className="min-h-screen flex items-center justify-center text-pink-700">
        Cargando arquetipo...
      </div>
    );
  }

  return (
    <main className="max-w-3xl mx-auto py-10 space-y-6">
      <h1 className="text-3xl font-bold text-pink-800 mb-6">
        Editar Arquetipo
      </h1>

      <form onSubmit={handleUpdate} className="space-y-5">
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-pink-700">
            Nombre del Arquetipo
          </label>
          <input
            type="text"
            value={arquetipo.arquetipo}
            onChange={(e) =>
              setArquetipo({ ...arquetipo, arquetipo: e.target.value })
            }
            className="border border-pink-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-semibold text-pink-700">Descripción</label>
          <textarea
            value={arquetipo.descripcion}
            onChange={(e) =>
              setArquetipo({ ...arquetipo, descripcion: e.target.value })
            }
            className="border border-pink-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
            rows={5}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-semibold text-pink-700">Elemento</label>
          <input
            type="text"
            value={arquetipo.elemento}
            onChange={(e) =>
              setArquetipo({ ...arquetipo, elemento: e.target.value })
            }
            className="border border-pink-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-semibold text-pink-700">Imagen URL</label>
          <input
            type="text"
            value={arquetipo.imagen_url}
            onChange={(e) =>
              setArquetipo({ ...arquetipo, imagen_url: e.target.value })
            }
            className="border border-pink-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-semibold text-pink-700">Audio URL</label>
          <input
            type="text"
            value={arquetipo.audio_url}
            onChange={(e) =>
              setArquetipo({ ...arquetipo, audio_url: e.target.value })
            }
            className="border border-pink-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-semibold text-pink-700">Ritual PDF URL</label>
          <input
            type="text"
            value={arquetipo.ritual_pdf}
            onChange={(e) =>
              setArquetipo({ ...arquetipo, ritual_pdf: e.target.value })
            }
            className="border border-pink-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-semibold text-pink-700">Tip Extra</label>
          <input
            type="text"
            value={arquetipo.tip_extra}
            onChange={(e) =>
              setArquetipo({ ...arquetipo, tip_extra: e.target.value })
            }
            className="border border-pink-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
          />
        </div>

        <button
          type="submit"
          className="bg-pink-700 text-white font-semibold py-3 px-6 rounded-lg hover:bg-pink-800 transition"
        >
          Guardar cambios
        </button>
      </form>
    </main>
  );
}
