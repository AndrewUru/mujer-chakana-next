"use client";

import React, { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

const NuevoRecursoPage = () => {
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ text: string; error?: boolean } | null>(null);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipo, setTipo] = useState("pdf");
  const [url, setUrl] = useState("");
  const [tipoSuscripcion, setTipoSuscripcion] = useState<string[]>([]);

  const handleCheckboxChange = (valor: string) => {
    setTipoSuscripcion((prev) =>
      prev.includes(valor) ? prev.filter((v) => v !== valor) : [...prev, valor]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (guardando) return;
    setGuardando(true);
    setMensaje(null);
    try {

    const { data, error: userError } = await supabase.auth.getUser();
    const userId = data?.user?.id;

    if (!userId || userError) {
      alert("Debes iniciar sesión para crear un recurso.");
      return;
    }

    const { error } = await supabase.from("recursos").insert([
      {
        titulo,
        descripcion,
        tipo,
        url,
        tipo_suscripcion: tipoSuscripcion,
        creado_por: userId,
        activo: true,
      },
    ]);

    if (error) {
      console.error("Error al crear recurso:", error.message);
      setMensaje({ text: "No se pudo guardar el recurso. Int?ntalo de nuevo.", error: true });
    } else {
      alert("Recurso añadido correctamente.");
      setTitulo("");
      setDescripcion("");
      setTipo("pdf");
      setUrl("");
      setTipoSuscripcion([]);
    }
    } catch { setMensaje({ text: "No se pudo guardar el recurso. Int?ntalo de nuevo.", error: true }); }
    finally { setGuardando(false); }
  };

  return (
    <div className="admin-legacy-form">
      <Link href="/admin/recursos" className="admin-subtitle">? Volver a recursos</Link>
      <h1 className="text-2xl font-bold text-rose-700 mb-6 text-center">
        🌕 Añadir Nuevo Recurso
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
            Tipo (pdf / audio / video)
          </label>
          <input
            type="text"
            id="tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            required
            className="mt-1 block w-full rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-rose-500 focus:border-rose-500"
          />
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipos de Suscripción
          </label>
          <div className="space-y-2">
            {["gratuito", "mensual", "anual"].map((opcion) => (
              <label key={opcion} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  value={opcion}
                  checked={tipoSuscripcion.includes(opcion)}
                  onChange={() => handleCheckboxChange(opcion)}
                />
                {opcion.charAt(0).toUpperCase() + opcion.slice(1)}
              </label>
            ))}
          </div>
        </div>

        <div className="text-center">
          <button
            disabled={guardando}
            type="submit"
            className="mt-4 bg-rose-600 text-white px-6 py-2 rounded-full hover:bg-rose-700 transition"
          >
            Guardar Recurso 🌸
          </button>
        </div>
      </form>
    </div>
  );
};

export default NuevoRecursoPage;
