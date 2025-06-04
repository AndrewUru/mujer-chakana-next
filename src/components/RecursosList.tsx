"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Book,
  Music,
  FileText,
  Lock,
  BadgeCheck,
  Star,
  Gift,
} from "lucide-react";
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
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) return;

        const { data, error } = await supabase
          .from("perfiles")
          .select("suscripcion_activa")
          .eq("user_id", user.id)
          .single();

        if (error) {
          console.error("Error obteniendo perfil:", error.message);
          return;
        }

        if (data?.suscripcion_activa) {
          setSuscripcionActiva(true);
        }
      } catch (err) {
        console.error("Error general en fetchPerfil:", err);
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

  const renderCards = (
    lista: Recurso[],
    tipo: "gratuito" | "mensual" | "anual"
  ) => {
    const badgeStyle = {
      gratuito:
        "bg-emerald-100 text-emerald-700 font-semibold px-2 py-1 rounded-full text-xs flex items-center gap-1 shadow",
      mensual:
        "bg-yellow-100 text-yellow-700 font-semibold px-2 py-1 rounded-full text-xs flex items-center gap-1 shadow",
      anual:
        "bg-rose-100 text-rose-700 font-semibold px-2 py-1 rounded-full text-xs flex items-center gap-1 shadow",
    };
    return lista.map((recurso) => {
      // ¿Está bloqueado para el usuario?
      const isBlocked = tipo !== "gratuito" && !suscripcionActiva;

      if (!isBlocked) {
        // Card accesible
        return (
          <Link
            key={recurso.id}
            href={`/recursos/${recurso.id}`}
            target="_self"
            className="bg-white p-5 rounded-2xl shadow-md hover:shadow-xl transition-all border border-pink-100 hover:border-pink-300 group relative"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                {iconByTipo(recurso.tipo)}
                <h3 className="text-lg font-semibold text-rose-800">
                  {recurso.titulo}
                </h3>
              </div>
              <span className={badgeStyle[tipo]}>
                {tipo === "gratuito" ? (
                  <>
                    🆓 <span>Gratis</span>
                  </>
                ) : (
                  <>
                    {tipo === "mensual" ? "★" : "💎"}{" "}
                    <span>{tipo.charAt(0).toUpperCase() + tipo.slice(1)}</span>
                  </>
                )}
              </span>
            </div>
            <p className="text-sm text-gray-600">{recurso.descripcion}</p>
          </Link>
        );
      } else {
        // Card bloqueada: premium sin suscripción
        return (
          <div
            key={recurso.id}
            className="relative bg-gray-50 p-5 rounded-2xl shadow-inner border border-gray-200 opacity-70 cursor-not-allowed flex flex-col justify-between transition-all hover:shadow-xl group overflow-visible"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                {iconByTipo(recurso.tipo, true)}
                <h3 className="text-lg font-semibold text-gray-500 line-through">
                  {recurso.titulo}
                </h3>
              </div>
              <span className={badgeStyle[tipo]}>
                {tipo === "mensual" ? "★" : "💎"}{" "}
                <span>{tipo.charAt(0).toUpperCase() + tipo.slice(1)}</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 italic">
              {recurso.descripcion}
            </p>
            <div className="mt-4 text-center">
              <Lock className="mx-auto w-5 h-5 text-gray-400 mb-1 group-hover:text-pink-500 transition" />
              <Link
                href="/suscripcion"
                className="inline-block mt-2 text-xs text-pink-600 font-medium hover:underline group-hover:text-pink-700"
                tabIndex={-1}
                aria-disabled="true"
              >
                Desbloquear con suscripción
              </Link>
            </div>
            {/* Tooltip en hover */}
            <span className="hidden group-hover:block absolute top-2 right-2 bg-pink-600 text-white text-xs rounded px-3 py-1 shadow-lg animate-fadeIn">
              💡 ¡Hazte Premium y accede!
            </span>
          </div>
        );
      }
    });
  };

  const recursosGratuitos = recursos.filter(
    (r) => r.tipo_suscripcion?.toLowerCase().trim() === "gratuito"
  );

  const recursosMensuales = recursos.filter(
    (r) => r.tipo_suscripcion?.toLowerCase().trim() === "mensual"
  );

  const recursosAnuales = recursos.filter(
    (r) => r.tipo_suscripcion?.toLowerCase().trim() === "anual"
  );

  return (
    <div className="space-y-12">
      {/* Gratuitos */}
      <section>
        <h2 className="text-xl sm:text-2xl font-bold text-emerald-700 mb-4 flex items-center gap-2">
          <Gift className="w-5 h-5 text-emerald-600" />
          Recursos Gratuitos
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderCards(recursosGratuitos, "gratuito")}
        </div>
      </section>

      {/* Mensuales */}
      <section>
        <h2 className="text-xl sm:text-2xl font-bold text-yellow-600 mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          Contenido Exclusivo Mensual
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderCards(recursosMensuales, "mensual")}
        </div>
      </section>

      {/* Anuales */}
      <section>
        <h2 className="text-xl sm:text-2xl font-bold text-rose-700 mb-4 flex items-center gap-2">
          <BadgeCheck className="w-5 h-5 text-rose-600" />
          Recursos para Suscripción Anual
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderCards(recursosAnuales, "anual")}
        </div>
      </section>

      {/* Animación para el tooltip */}
      <style jsx>{`
        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease;
        }
      `}</style>
    </div>
  );
}
