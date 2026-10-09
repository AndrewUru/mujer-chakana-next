"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Breadcrumbs from "@/components/Breadcrumbs";
import ArchetypeImagePicker from "@/components/ArchetypeImagePicker";
import { uploadArchetypeImage } from "@/lib/archetypeImages";

export default function EditarArquetipoPage() {
  const { id } = useParams<{ id: string }>();
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saveStage, setSaveStage] = useState("");
  const uploadedImage = useRef<{ file: File; url: string } | null>(null);
  const saving = useRef(false);
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (redirectTimer.current) clearTimeout(redirectTimer.current); }, []);

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
        setLoading(false);
        return;
      }

      setArquetipo(data);
      setLoading(false);
    }

    fetchData();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!arquetipo || saving.current) return;

    saving.current = true;
    setGuardando(true);
    setMensajeExito(null);
    setMensajeError(null);

    try {
      setSaveStage("Comprobando tu sesión…");
      const { data: { user }, error: sessionError } = await supabase.auth.getUser();
      if (sessionError || !user) throw new Error("Tu sesión ha caducado. Inicia sesión de nuevo para guardar.");
      const { data: profile, error: profileError } = await supabase.from("perfiles").select("rol").eq("user_id", user.id).single();
      if (profileError || profile?.rol !== "admin") throw new Error("Necesitas una sesión de administradora para guardar este arquetipo.");

      let imageUrl = arquetipo.imagen_url;
      if (imageFile) {
        setSaveStage("Subiendo imagen…");
        // Reuse an uploaded file if saving the database reference needs a retry.
        if (uploadedImage.current?.file !== imageFile) {
          uploadedImage.current = { file: imageFile, url: await uploadArchetypeImage(id, imageFile) };
        }
        imageUrl = uploadedImage.current.url;
      }
      setSaveStage("Guardando cambios…");
      const { data: saved, error } = await supabase.from("mujer_chakana").update({
        arquetipo: arquetipo.arquetipo,
        descripcion: arquetipo.descripcion,
        elemento: arquetipo.elemento,
        imagen_url: imageUrl,
        audio_url: arquetipo.audio_url,
        ritual_pdf: arquetipo.ritual_pdf,
        tip_extra: arquetipo.tip_extra,
      })
      .eq("id", id).select("id").single();
      if (error || !saved) throw new Error("No se pudieron guardar los cambios del arquetipo. Vuelve a intentarlo.");
      setArquetipo({ ...arquetipo, imagen_url: imageUrl });
      setImageFile(null);
      uploadedImage.current = null;
      setMensajeExito("✅ Cambios guardados correctamente.");
      redirectTimer.current = setTimeout(() => {
        router.push("/admin/mujer-chakana");
      }, 2000);
    } catch (error) {
      setMensajeError(error instanceof Error ? error.message : "No se pudieron guardar los cambios. Inténtalo de nuevo.");
    } finally {
      saving.current = false;
      setGuardando(false);
      setSaveStage("");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-pink-700">
        Cargando arquetipo...
      </div>
    );
  }

  if (!arquetipo) return <div className="admin-page"><p role="alert" className="admin-notice error">{mensajeError}</p><button className="admin-button" onClick={() => router.push("/admin/mujer-chakana")}>Volver a arquetipos</button></div>;

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
        <div role="status" className="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded shadow mb-4">
          {mensajeExito}
        </div>
      )}

      {mensajeError && (
        <div role="alert" className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded shadow mb-4">
          {mensajeError}
        </div>
      )}

      <form onSubmit={handleUpdate} className="space-y-6">
        <fieldset disabled={guardando || Boolean(mensajeExito)} className="space-y-6">
        <ArchetypeImagePicker currentUrl={arquetipo.imagen_url} name={arquetipo.arquetipo} file={imageFile} disabled={guardando || Boolean(mensajeExito)} onChange={file => { setImageFile(file); uploadedImage.current = null; setMensajeError(null); }} />
        {[
          {
            label: "Nombre del Arquetipo *",
            key: "arquetipo",
            placeholder: "Ej. La Sabia",
          },
          { label: "Elemento *", key: "elemento", isSelect: true },
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
            <label htmlFor={key} className="font-semibold text-pink-700">{label}</label>
            {isSelect ? (
              <select
                id={key}
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
                <option value="Cielo">Cielo</option>
              </select>
            ) : (
              <input
                id={key}
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
          <label htmlFor="descripcion" className="font-semibold text-pink-700">Descripción *</label>
          <textarea
            id="descripcion"
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
            {guardando ? saveStage : "Guardar cambios"}
          </button>
        </div>
        <p className="sr-only" role="status" aria-live="polite">{saveStage}</p>
        </fieldset>
      </form>
    </main>
  );
}
