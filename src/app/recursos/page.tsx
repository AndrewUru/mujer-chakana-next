"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { RefreshCcw, Search, X } from "lucide-react";

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
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("todos");

  const fetchRecursos = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: requestError } = await supabase
      .from("recursos")
      .select("*")
      .order("creado_en", { ascending: false });

    if (requestError) {
      setError("No pudimos cargar la biblioteca en este momento.");
    } else {
      setRecursos(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchRecursos();
  }, [fetchRecursos]);

  const availableTypes = useMemo(
    () => Array.from(new Set(recursos.map(({ tipo }) => tipo))).sort(),
    [recursos]
  );

  const filteredResources = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("es");

    return recursos.filter((recurso) => {
      const matchesType = typeFilter === "todos" || recurso.tipo === typeFilter;
      const searchableText = [
        recurso.titulo,
        recurso.descripcion,
        recurso.fase,
        recurso.arquetipo,
        recurso.elemento,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("es");

      return matchesType && searchableText.includes(normalizedQuery);
    });
  }, [query, recursos, typeFilter]);

  if (loading) {
    return (
      <main className="mx-auto min-h-[60vh] max-w-7xl px-3 py-8 sm:px-6 sm:py-12">
        <div className="mb-8 space-y-3 text-center" role="status" aria-live="polite">
          <div className="mx-auto h-8 w-64 animate-pulse rounded-xl bg-rose-100/80" />
          <div className="mx-auto h-4 w-80 max-w-full animate-pulse rounded-lg bg-rose-100/55" />
          <span className="sr-only">Cargando biblioteca de recursos</span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <div
              key={index}
              className="glass-panel animate-pulse rounded-[20px] p-4 sm:rounded-3xl sm:p-6"
              aria-hidden="true"
            >
              <div className="h-48 rounded-2xl bg-rose-100/60" />
              <div className="mt-5 h-5 w-3/4 rounded-lg bg-rose-100/70" />
              <div className="mt-3 h-4 rounded-lg bg-rose-100/45" />
              <div className="mt-2 h-4 w-4/5 rounded-lg bg-rose-100/45" />
            </div>
          ))}
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-4 text-center">
        <div className="glass-panel max-w-md rounded-3xl p-8">
          <p className="app-kicker">Biblioteca no disponible</p>
          <h1 className="mt-3 text-3xl font-semibold text-rose-950">
            Volvamos a intentarlo
          </h1>
          <p className="mt-3 text-sm leading-6 text-rose-800/75">{error}</p>
          <button
            type="button"
            onClick={() => void fetchRecursos()}
            className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-rose-600 px-5 py-2.5 font-semibold text-white shadow-lg hover:bg-rose-700"
          >
            <RefreshCcw className="h-4 w-4" />
            Reintentar
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-white/78 via-rose-50/52 to-pink-50/46 px-3 py-6 pb-20 sm:px-6 sm:py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header mejorado */}
        <div className="mb-7 text-center sm:mb-10">
          <h1 className="mb-3 bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-3xl font-bold text-transparent sm:mb-4 md:text-5xl">
            Biblioteca para tu ciclo
          </h1>
          <p className="text-gray-700 text-lg max-w-2xl mx-auto">
            Encuentra audios, rituales y guías según lo que necesitas hoy.
          </p>
        </div>

        {recursos.length > 0 ? (
          <section
            className="glass-panel mb-7 rounded-[22px] p-4 sm:mb-10 sm:rounded-3xl sm:p-5"
            aria-label="Buscar y filtrar recursos"
          >
            <label htmlFor="resource-search" className="sr-only">
              Buscar recursos
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-rose-400" />
              <input
                id="resource-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por título, fase, arquetipo o elemento..."
                className="min-h-12 w-full rounded-2xl pl-12 pr-12"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl text-rose-500 hover:bg-rose-50"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1" aria-label="Filtrar por formato">
              {["todos", ...availableTypes].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setTypeFilter(type)}
                  aria-pressed={typeFilter === type}
                  className={`min-h-10 shrink-0 rounded-full border px-4 py-2 text-sm font-semibold capitalize transition ${
                    typeFilter === type
                      ? "border-rose-300 bg-rose-600 text-white shadow-md"
                      : "border-white/70 bg-white/55 text-rose-700 hover:bg-white/85"
                  }`}
                >
                  {type === "todos" ? "Todos" : type}
                </button>
              ))}
            </div>
          </section>
        ) : null}

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
        ) : filteredResources.length === 0 ? (
          <div className="glass-panel rounded-3xl py-16 text-center">
            <span className="text-4xl" aria-hidden="true">🔎</span>
            <h2 className="mt-4 text-2xl font-semibold text-rose-900">
              No encontramos coincidencias
            </h2>
            <p className="mt-2 text-sm text-rose-700">
              Prueba otra palabra o vuelve a mostrar todos los formatos.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setTypeFilter("todos");
              }}
              className="mt-5 min-h-11 rounded-2xl border border-rose-200 bg-white/70 px-5 py-2.5 font-semibold text-rose-700"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <>
            {/* Contador de recursos */}
            <div className="flex justify-between items-center mb-8">
              <p className="text-sm text-rose-600">
                <span className="font-semibold">{filteredResources.length}</span>{" "}
                {filteredResources.length === 1 ? "recurso encontrado" : "recursos encontrados"}
              </p>
            </div>

            {/* Grid de recursos mejorado */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
              {filteredResources.map((recurso) => (
                <Link
                  key={recurso.id}
                  href={`/recursos/${recurso.id}`}
                  className="group block"
                >
                  <article className="glass-panel flex h-full flex-col rounded-[20px] p-4 transition-all duration-300 hover:-translate-y-1 hover:bg-white/70 sm:rounded-3xl sm:p-6">
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
                    <div className="mt-4 flex items-center justify-center opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-visible:opacity-100">
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
