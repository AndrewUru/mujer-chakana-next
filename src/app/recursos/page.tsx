"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

interface Recurso {
  id: string;
  tipo: "audio" | "pdf" | string;
  titulo: string;
  url: string;
  descripcion: string;
  tipo_suscripcion: "gratuito" | "mensual" | "anual";
  imagen_url?: string;
  fase?: string;
  arquetipo?: string;
  elemento?: string;
}

export default function RecursosPage() {
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecursos = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("recursos")
        .select("*")
        .order("creado_en", { ascending: false });
      if (!error && data) setRecursos(data);
      setLoading(false);
    };
    fetchRecursos();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-rose-400 mb-4"></div>
        <p className="text-rose-700 text-lg font-medium">
          Cargando recursos...
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-white/78 via-rose-50/52 to-pink-50/46 px-4 py-12 pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Header mejorado */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Recursos Disponibles
          </h1>
          <p className="text-gray-700 text-lg max-w-2xl mx-auto">
            Colección de recursos educativos cuidadosamente seleccionados
          </p>
        </div>

        {recursos.length === 0 ? (
          <div className="glass-panel py-20 text-center rounded-3xl">
            <div className="glass-soft mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full">
              <span className="text-3xl">📭</span>
            </div>
            <h3 className="text-xl font-semibold text-rose-700 mb-2">
              No hay recursos disponibles
            </h3>
            <p className="text-rose-500">
              Los recursos aparecerán aquí cuando estén disponibles
            </p>
          </div>
        ) : (
          <>
            {/* Contador de recursos */}
            <div className="flex justify-between items-center mb-8">
              <p className="text-sm text-rose-600">
                <span className="font-semibold">{recursos.length}</span>{" "}
                recursos encontrados
              </p>
            </div>

            {/* Grid de recursos mejorado */}
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {recursos.map((recurso) => (
                <Link
                  key={recurso.id}
                  href={`/recursos/${recurso.id}`}
                  className="group block"
                >
                  <article className="glass-panel flex h-full flex-col rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-white/70">
                    {/* Imagen o icono mejorado */}
                    <div className="relative mb-4 overflow-hidden rounded-2xl">
                      {recurso.imagen_url ? (
                        <Image
                          src={recurso.imagen_url}
                          alt={recurso.titulo}
                          width={400}
                          height={200}
                          className="h-48 w-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex h-48 items-center justify-center rounded-2xl border border-white/60 bg-gradient-to-br from-rose-50/70 to-pink-50/58 text-6xl transition-transform duration-300 group-hover:scale-110">
                          {recurso.tipo === "audio"
                            ? "🎧"
                            : recurso.tipo === "pdf"
                            ? "📄"
                            : recurso.tipo === "video"
                            ? "🎥"
                            : "✨"}
                        </div>
                      )}

                      {/* Badge de tipo superpuesto */}
                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center rounded-full border border-white/70 bg-white/70 px-3 py-1 text-xs font-medium text-rose-700 shadow-inner backdrop-blur">
                          {recurso.tipo}
                        </span>
                      </div>
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 flex flex-col">
                      <h2 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-rose-600 transition-colors line-clamp-2">
                        {recurso.titulo}
                      </h2>

                      <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-1">
                        {recurso.descripcion}
                      </p>

                      {/* Tags mejorados */}
                      <div className="flex flex-wrap gap-2 text-xs mt-auto">
                        <span className="inline-flex items-center rounded-full border border-white/60 bg-rose-100/60 px-3 py-1 font-medium text-rose-700 shadow-inner">
                          {recurso.tipo_suscripcion}
                        </span>

                        {recurso.fase && (
                          <span className="inline-flex items-center rounded-full border border-white/60 bg-blue-50/70 px-3 py-1 font-medium text-blue-700 shadow-inner">
                            {recurso.fase}
                          </span>
                        )}

                        {recurso.elemento && (
                          <span className="inline-flex items-center rounded-full border border-white/60 bg-green-50/70 px-3 py-1 font-medium text-green-700 shadow-inner">
                            {recurso.elemento}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Indicador de hover */}
                    <div className="flex items-center justify-center mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs text-rose-600 font-medium flex items-center gap-1">
                        Ver recurso
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
