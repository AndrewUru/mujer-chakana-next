"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Breadcrumbs from "@/components/Breadcrumbs";
import ArchetypeImagePicker from "@/components/ArchetypeImagePicker";
import { uploadResourceCover } from "@/lib/resourceCovers";
import ArchetypeResourcePicker from "@/components/ArchetypeResourcePicker";
import { uploadResourcePdf } from "@/lib/resourceFiles";

const PLANES = ["gratuito", "mensual", "anual"];
const FORMATOS = [["pdf", "PDF"], ["audio", "Audio"], ["video", "Vídeo"]];

export default function EditarRecursoPage() {
  const { id } = useParams();
  const router = useRouter();

  interface Recurso {
    titulo: string;
    descripcion: string;
    url: string;
    tipo: string;
    tipo_suscripcion?: string | null;
    imagen_url?: string | null;
  }

  const [portada, setPortada] = useState<File | null>(null);
  // Solo para recursos PDF: si se elige un archivo, su URL sustituye a la actual.
  const [archivo, setArchivo] = useState<File | null>(null);

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
    // Nunca se asigna un plan por defecto: abriría un recurso de pago a todas.
    if (!PLANES.includes(recurso.tipo_suscripcion ?? "")) {
      setMensajeExito(null);
      setMensajeError("Elige quién puede ver este recurso antes de guardar.");
      return;
    }

    const subirArchivo = (recurso.tipo ?? "").trim().toLowerCase() === "pdf" ? archivo : null;
    if (!subirArchivo && !(recurso.url ?? "").trim()) {
      setMensajeExito(null);
      setMensajeError("Escribe la URL del recurso o elige un archivo PDF.");
      return;
    }

    setGuardando(true);
    setMensajeExito(null);
    setMensajeError(null);

    let recursoUrl = recurso.url;
    if (subirArchivo) {
      try {
        recursoUrl = await uploadResourcePdf(subirArchivo);
      } catch (uploadError) {
        setGuardando(false);
        setMensajeError(uploadError instanceof Error ? uploadError.message : "No se pudo subir el PDF.");
        return;
      }
    }

    let imagenUrl = recurso.imagen_url ?? null;
    if (portada) {
      try {
        imagenUrl = await uploadResourceCover(portada);
      } catch (uploadError) {
        setGuardando(false);
        setMensajeError(uploadError instanceof Error ? uploadError.message : "No se pudo subir la portada.");
        return;
      }
    }

    const { error } = await supabase
      .from("recursos")
      .update({
        titulo: recurso.titulo,
        descripcion: recurso.descripcion,
        url: recursoUrl,
        tipo: recurso.tipo,
        tipo_suscripcion: recurso.tipo_suscripcion,
        imagen_url: imagenUrl,
      })
      .eq("id", id);

    setGuardando(false);

    if (!error) {
      // Si el guardado se repite, no vuelve a subir la misma imagen.
      setRecurso({ ...recurso, url: recursoUrl, imagen_url: imagenUrl });
      setPortada(null);
      setArchivo(null);
      setMensajeExito("Recurso actualizado correctamente.");
      setTimeout(() => {
        router.push("/admin/recursos");
      }, 2000);
    } else {
      console.error(error);
      setMensajeError("No se pudo guardar el recurso. Inténtalo de nuevo.");
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
        No se encontró el recurso solicitado.
      </div>
    );
  }

  return (
    <main className="max-w-3xl mx-auto bg-white/80 backdrop-blur-sm py-10 space-y-8 px-6 rounded-2xl shadow-lg pb-24">
      <Breadcrumbs
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Recursos", href: "/admin/recursos" },
          recurso?.titulo
            ? { label: `Editar: ${recurso.titulo}` }
            : { label: "Editar recurso" },
        ]}
      />
      <h1 className="text-3xl font-bold text-pink-800 mb-2">
        Editar recurso
      </h1>
      <p className="text-gray-600 text-sm mb-4">
        Completa o ajusta la información del recurso. Los campos marcados con *
        son obligatorios.
      </p>

      {mensajeExito && (
        <div role="status" className="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded shadow">
          {mensajeExito}
        </div>
      )}
      {mensajeError && (
        <div role="alert" className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded shadow">
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
          <select
            aria-label="Tipo de recurso"
            value={(recurso.tipo ?? "").trim().toLowerCase()}
            onChange={(e) => setRecurso({ ...recurso, tipo: e.target.value })}
            className="w-full border border-pink-300 p-3 rounded-lg focus:ring-2 focus:ring-pink-400"
          >
            {!FORMATOS.some(([value]) => value === (recurso.tipo ?? "").trim().toLowerCase()) && (
              <option value={(recurso.tipo ?? "").trim().toLowerCase()}>{recurso.tipo || "Elige un formato"}</option>
            )}
            {FORMATOS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>

        {(recurso.tipo ?? "").trim().toLowerCase() === "pdf" && (
          <ArchetypeResourcePicker
            kind="pdf"
            title="Archivo PDF"
            currentUrl={recurso.url}
            file={archivo}
            disabled={guardando}
            onChange={setArchivo}
          />
        )}

        <ArchetypeImagePicker
          title="Imagen de portada"
          description="Elige la imagen que se verá en la tarjeta del recurso y en su página."
          currentUrl={recurso.imagen_url}
          name={recurso.titulo || "el recurso"}
          file={portada}
          disabled={guardando}
          onChange={setPortada}
        />
        {recurso.imagen_url && !portada && (
          <button
            type="button"
            disabled={guardando}
            onClick={() => setRecurso({ ...recurso, imagen_url: null })}
            className="admin-quiet-button"
          >
            Quitar portada
          </button>
        )}

        {/* Nuevo campo: Plan de acceso */}
        <div className="flex flex-col gap-2">
          <label htmlFor="tipo-suscripcion" className="font-semibold text-pink-700">
            ¿Quién puede verlo?
          </label>
          <select
            id="tipo-suscripcion"
            value={PLANES.includes(recurso.tipo_suscripcion ?? "") ? recurso.tipo_suscripcion ?? "" : ""}
            onChange={(e) => setRecurso({ ...recurso, tipo_suscripcion: e.target.value })}
            className="w-full border border-pink-300 p-3 rounded-lg focus:ring-2 focus:ring-pink-400"
          >
            {!PLANES.includes(recurso.tipo_suscripcion ?? "") && (
              <option value="" disabled>Plan no válido: elige uno</option>
            )}
            <option value="gratuito">Gratuito: todas las usuarias</option>
            <option value="mensual">Mensual: planes mensual y anual</option>
            <option value="anual">Anual: solo plan anual</option>
          </select>
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
