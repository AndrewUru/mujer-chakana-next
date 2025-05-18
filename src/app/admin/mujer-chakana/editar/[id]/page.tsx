"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Breadcrumbs from "@/components/Breadcrumbs";

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

  const handleUpdate = async (e: React.FormEvent) => {
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
      setMensajeError("❌ Ocurrió un error al guardar los cambios.");
    } else {
      setMensajeExito("✅ Cambios guardados correctamente.");
      setTimeout(() => {
        router.push("/admin/mujer-chakana");
      }, 2000);
    }
  };

  if (loading || !arquetipo) {
    return (
      <div className="min-h-screen flex items-center justify-center text-pink-700">
        Cargando arquetipo...
      </div>
    );
  }

  return (
    <main className="max-w-3xl mx-auto bg-white/90 py-10 px-6 rounded-2xl shadow-md pb-20 space-y-6">
      <Breadcrumbs
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Mujer Chakana", href: "/admin/mujer-chakana" },
          { label: `Editar: ${arquetipo.arquetipo}` },
        ]}
      />

      <h1 className="text-3xl font-bold text-pink-800 mb-2">
        ✨ Editar Arquetipo
      </h1>
      <p className="text-sm text-gray-600 mb-4">
        Modifica los atributos del arquetipo. Los campos marcados con * son
        obligatorios.
      </p>

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

      <form onSubmit={handleUpdate} className="space-y-6">
        {[
          {
            label: "Nombre del Arquetipo *",
            key: "arquetipo",
            placeholder: "Ej. La Sabia",
          },
          { label: "Elemento *", key: "elemento", isSelect: true },
          {
            label: "Imagen URL",
            key: "imagen_url",
            placeholder: "https://...",
          },
          { label: "Audio URL", key: "audio_url", placeholder: "https://..." },
          {
            label: "Ritual PDF URL",
            key: "ritual_pdf",
            placeholder: "https://...",
          },
          {
            label: "Tip Extra (opcional)",
            key: "tip_extra",
            placeholder: "Consejo breve",
          },
        ].map(({ label, key, isSelect, placeholder }) => (
          <div key={key} className="flex flex-col gap-2">
            <label className="font-semibold text-pink-700">{label}</label>
            {isSelect ? (
              <select
                required
                value={arquetipo[key as keyof Arquetipo] || ""}
                onChange={(e) =>
                  setArquetipo({ ...arquetipo, [key]: e.target.value })
                }
                className="border border-pink-300 p-3 rounded-lg focus:ring-2 focus:ring-pink-400"
              >
                <option value="">Selecciona un elemento</option>
                <option value="Agua">Agua</option>
                <option value="Tierra">Tierra</option>
                <option value="Fuego">Fuego</option>
                <option value="Aire">Aire</option>
              </select>
            ) : (
              <input
                type="text"
                value={arquetipo[key as keyof Arquetipo] || ""}
                onChange={(e) =>
                  setArquetipo({ ...arquetipo, [key]: e.target.value })
                }
                required={label.includes("*")}
                placeholder={placeholder}
                className="border border-pink-300 p-3 rounded-lg focus:ring-2 focus:ring-pink-400 placeholder-gray-400"
              />
            )}
          </div>
        ))}

        {/* Descripción (textarea) */}
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-pink-700">Descripción *</label>
          <textarea
            required
            rows={5}
            value={arquetipo.descripcion}
            onChange={(e) =>
              setArquetipo({ ...arquetipo, descripcion: e.target.value })
            }
            className="border border-pink-300 p-3 rounded-lg focus:ring-2 focus:ring-pink-400 placeholder-gray-400"
            placeholder="Breve descripción simbólica del arquetipo"
          />
        </div>

        <div className="pt-4 sticky bottom-5 bg-white/90 pb-4">
          <button
            type="submit"
            disabled={guardando}
            className={`w-full bg-pink-700 text-white font-semibold py-3 px-6 rounded-lg text-lg transition ${
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
