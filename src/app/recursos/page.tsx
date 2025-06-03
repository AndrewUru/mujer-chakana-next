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
        .order("created_at", { ascending: false });
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
    <main className="min-h-screen bg-gradient-to-b from-rose-50 to-white px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-rose-700 mb-8 text-center">
          📚 Recursos disponibles
        </h1>
        {recursos.length === 0 ? (
          <p className="text-center text-gray-500">
            No hay recursos disponibles.
          </p>
        ) : (
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {recursos.map((recurso) => (
              <Link
                key={recurso.id}
                href={`/recursos/${recurso.id}`}
                className="group bg-white/90 border border-rose-200 rounded-2xl shadow-lg p-5 flex flex-col hover:shadow-2xl transition"
              >
                {recurso.imagen_url ? (
                  <Image
                    src={recurso.imagen_url}
                    alt={recurso.titulo}
                    width={400}
                    height={160}
                    className="h-40 w-full object-cover rounded-xl mb-3 group-hover:scale-105 transition"
                  />
                ) : (
                  <div className="h-40 flex items-center justify-center bg-rose-50 rounded-xl mb-3 text-5xl">
                    {recurso.tipo === "audio"
                      ? "🎧"
                      : recurso.tipo === "pdf"
                      ? "📄"
                      : "✨"}
                  </div>
                )}
                <h2 className="text-xl font-semibold text-rose-700 mb-1">
                  {recurso.titulo}
                </h2>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {recurso.descripcion}
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-auto">
                  <span className="bg-rose-100 px-2 py-1 rounded">
                    {recurso.tipo}
                  </span>
                  <span className="bg-rose-100 px-2 py-1 rounded">
                    {recurso.tipo_suscripcion}
                  </span>
                  {recurso.fase && (
                    <span className="bg-rose-50 px-2 py-1 rounded">
                      {recurso.fase}
                    </span>
                  )}
                  {recurso.elemento && (
                    <span className="bg-rose-50 px-2 py-1 rounded">
                      {recurso.elemento}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
