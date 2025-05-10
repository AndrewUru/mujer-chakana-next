"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Book, Music, FileText, Lock } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Recurso = {
  id: string;
  tipo: string;
  titulo: string;
  url: string;
  descripcion: string;
  tipo_suscripcion: "gratuito" | "mensual" | "anual";
};

export default function RecursosList({ recursos }: { recursos: Recurso[] }) {
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

  const iconByTipo = (tipo: string, bloqueado = false) => {
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

  const renderCards = (lista: Recurso[], bloqueado = false) =>
    lista.map((recurso) =>
      !bloqueado ? (
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
          <p className="text-sm text-gray-400 italic">{recurso.descripcion}</p>
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
      )
    );

  const recursosGratuitos = recursos.filter(
    (r) => r.tipo_suscripcion === "gratuito"
  );
  const recursosMensuales = recursos.filter(
    (r) => r.tipo_suscripcion === "mensual"
  );
  const recursosAnuales = recursos.filter(
    (r) => r.tipo_suscripcion === "anual"
  );

  return (
    <div className="space-y-12">
      {/* Gratuitos */}
      <section>
        <h2 className="text-2xl font-bold text-emerald-700 mb-4">
          🌱 Recursos Gratuitos
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderCards(recursosGratuitos, false)}
        </div>
      </section>

      {/* Mensuales */}
      <section>
        <h2 className="text-2xl font-bold text-yellow-600 mb-4">
          🌒 Recursos para Suscripción Mensual
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderCards(recursosMensuales, !suscripcionActiva)}
        </div>
      </section>

      {/* Anuales */}
      <section>
        <h2 className="text-2xl font-bold text-rose-700 mb-4">
          🌕 Recursos para Suscripción Anual
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderCards(recursosAnuales, !suscripcionActiva)}
        </div>
      </section>
    </div>
  );
}
