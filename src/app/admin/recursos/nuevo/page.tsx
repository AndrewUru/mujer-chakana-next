"use client";

import React, { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { uploadResourceCover } from "@/lib/resourceCovers";
import ArchetypeImagePicker from "@/components/ArchetypeImagePicker";

const NuevoRecursoPage = () => {
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ text: string; error?: boolean } | null>(null);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipo, setTipo] = useState("pdf");
  const [url, setUrl] = useState("");
  // Un solo valor: la columna es de texto y la regla de acceso de la base de
  // datos ya incluye los planes superiores (mensual lo ven mensual y anual).
  const [tipoSuscripcion, setTipoSuscripcion] = useState("gratuito");
  const [portada, setPortada] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (guardando) return;
    setGuardando(true);
    setMensaje(null);
    try {

    const { data, error: userError } = await supabase.auth.getUser();
    const userId = data?.user?.id;

    if (!userId || userError) {
      setMensaje({ text: "Debes iniciar sesión para crear un recurso.", error: true });
      return;
    }

    let imagenUrl: string | null = null;
    if (portada) {
      try {
        imagenUrl = await uploadResourceCover(portada);
      } catch (uploadError) {
        setMensaje({ text: uploadError instanceof Error ? uploadError.message : "No se pudo subir la portada.", error: true });
        return;
      }
    }

    const { error } = await supabase.from("recursos").insert([
      {
        titulo,
        descripcion,
        tipo,
        url,
        imagen_url: imagenUrl,
        tipo_suscripcion: tipoSuscripcion,
        creado_por: userId,
        activo: true,
      },
    ]);

    if (error) {
      console.error("Error al crear recurso:", error.message);
      setMensaje({ text: "No se pudo guardar el recurso. Inténtalo de nuevo.", error: true });
    } else {
      setMensaje({ text: "Recurso añadido correctamente. Puedes añadir otro o volver a la biblioteca." });
      setTitulo("");
      setDescripcion("");
      setTipo("pdf");
      setUrl("");
      setTipoSuscripcion("gratuito");
      setPortada(null);
    }
    } catch { setMensaje({ text: "No se pudo guardar el recurso. Inténtalo de nuevo.", error: true }); }
    finally { setGuardando(false); }
  };

  return (
    <div className="admin-legacy-form">
      <Link href="/admin/recursos" className="admin-subtitle">← Volver a recursos</Link>
      <h1 className="text-2xl font-bold text-rose-700 mb-6 text-center">
        Nuevo recurso
      </h1>
      {mensaje && <div role={mensaje.error ? "alert" : "status"} className={`admin-notice ${mensaje.error ? "error" : ""}`}>{mensaje.text}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="titulo"
            className="block text-sm font-medium text-gray-700"
          >
            Título
          </label>
          <input
            type="text"
            id="titulo"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
            className="mt-1 block w-full rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-rose-500 focus:border-rose-500"
          />
        </div>

        <div>
          <label
            htmlFor="descripcion"
            className="block text-sm font-medium text-gray-700"
          >
            Descripción
          </label>
          <textarea
            id="descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            required
            className="mt-1 block w-full rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-rose-500 focus:border-rose-500"
          />
        </div>

        <div>
          <label
            htmlFor="tipo"
            className="block text-sm font-medium text-gray-700"
          >
            Formato del recurso
          </label>
          <select
            id="tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            required
            className="mt-1 block w-full rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-rose-500 focus:border-rose-500"
          >
            <option value="pdf">PDF</option>
            <option value="audio">Audio</option>
            <option value="video">Vídeo</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="url"
            className="block text-sm font-medium text-gray-700"
          >
            URL del recurso
          </label>
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            className="mt-1 block w-full rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-rose-500 focus:border-rose-500"
          />
        </div>

        <ArchetypeImagePicker
          title="Imagen de portada (opcional)"
          description="Elige la imagen que se verá en la tarjeta del recurso y en su página."
          name={titulo || "el recurso"}
          file={portada}
          disabled={guardando}
          onChange={setPortada}
        />

        <div>
          <label
            htmlFor="tipo-suscripcion"
            className="block text-sm font-medium text-gray-700"
          >
            ¿Quién puede verlo?
          </label>
          <select
            id="tipo-suscripcion"
            value={tipoSuscripcion}
            onChange={(e) => setTipoSuscripcion(e.target.value)}
            required
            className="mt-1 block w-full rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-rose-500 focus:border-rose-500"
          >
            <option value="gratuito">Gratuito: todas las usuarias</option>
            <option value="mensual">Mensual: planes mensual y anual</option>
            <option value="anual">Anual: solo plan anual</option>
          </select>
        </div>

        <div className="text-center">
          <button
            disabled={guardando}
            type="submit"
            className="mt-4 bg-rose-600 text-white px-6 py-2 rounded-full hover:bg-rose-700 transition"
          >
            {guardando ? "Guardando…" : "Guardar recurso"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NuevoRecursoPage;
