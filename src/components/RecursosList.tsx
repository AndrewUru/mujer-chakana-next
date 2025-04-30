"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Book, Music, FileText, Lock } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function RecursosList({
  recursos,
}: {
  recursos: {
    id: string;
    tipo: string;
    titulo: string;
    url: string;
    descripcion: string;
  }[];
}) {
  const [suscripcionActiva, setSuscripcionActiva] = useState(false);

  useEffect(() => {
    const fetchPerfil = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("perfiles")
        .select("suscripcion_activa")
        .eq("user_id", user.id)
        .single();

      if (data?.suscripcion_activa) {
        setSuscripcionActiva(true);
      }
    };

    fetchPerfil();
  }, []);

  const iconByTipo = (tipo: string, bloqueado: boolean = false) => {
    const baseClass = `w-6 h-6 ${
      bloqueado ? "text-gray-300" : "text-pink-600"
    }`;
    switch (tipo) {
      case "audio":
        return <Music className={baseClass} />;
      case "pdf":
        return <FileText className={baseClass} />;
      default:
        return <Book className={baseClass} />;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {recursos.map((recurso) => {
        const bloqueado = !suscripcionActiva;

        return !bloqueado ? (
          <Link
            key={recurso.id}
            href={recurso.url}
            target="_blank"
            className="bg-white p-5 rounded-2xl shadow-md hover:shadow-xl transition-all border border-pink-100 hover:border-pink-300"
          >
            <div className="flex items-center gap-3 mb-2">
              {iconByTipo(recurso.tipo)}
              <h3 className="text-lg font-semibold text-rose-800">
                {recurso.titulo}
              </h3>
            </div>
            <p className="text-sm text-gray-600">{recurso.descripcion}</p>
          </Link>
        ) : (
          <div
            key={recurso.id}
            className="bg-gray-50 p-5 rounded-2xl shadow-inner border border-gray-200 opacity-60 cursor-not-allowed flex flex-col justify-between"
          >
            <div className="flex items-center gap-3 mb-2">
              {iconByTipo(recurso.tipo, true)}
              <h3 className="text-lg font-semibold text-gray-500 line-through">
                {recurso.titulo}
              </h3>
            </div>
            <p className="text-sm text-gray-400 italic">
              {recurso.descripcion}
            </p>
            <div className="mt-4 text-center">
              <Lock className="mx-auto w-5 h-5 text-gray-400 mb-1" />
              <Link
                href="/suscripcion"
                className="inline-block mt-2 text-xs text-pink-600 font-medium hover:underline"
              >
                Desbloquear con suscripción
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
