"use client";

import { motion } from "framer-motion";
import {
  Inbox,
  Calendar,
  BookOpen,
  Heart,
  Sparkles,
  Plus,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  type: "registros" | "recursos" | "ciclo" | "perfil" | "general";
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  icon?: React.ReactNode;
  onAction?: () => void;
}

const EmptyState = ({
  type,
  title,
  description,
  actionLabel,
  actionHref,
  icon,
  onAction,
}: EmptyStateProps) => {
  const defaultIcons = {
    registros: <Calendar className="w-16 h-16 text-pink-400" />,
    recursos: <BookOpen className="w-16 h-16 text-pink-400" />,
    ciclo: <Heart className="w-16 h-16 text-pink-400" />,
    perfil: <Sparkles className="w-16 h-16 text-pink-400" />,
    general: <Inbox className="w-16 h-16 text-pink-400" />,
  };

  const defaultActionLabels = {
    registros: "Crear primer registro",
    recursos: "Explorar recursos",
    ciclo: "Ver mi ciclo",
    perfil: "Completar perfil",
    general: "Comenzar",
  };

  const displayIcon = icon || defaultIcons[type];
  const displayActionLabel = actionLabel || defaultActionLabels[type];

  return (
    <motion.div
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Icono animado */}
      <motion.div
        className="mb-6"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
      >
        {displayIcon}
      </motion.div>

      {/* Contenido */}
      <div className="max-w-md mx-auto space-y-4">
        <motion.h3
          className="text-2xl font-bold text-pink-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {title}
        </motion.h3>

        <motion.p
          className="text-pink-600 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          {description}
        </motion.p>

        {/* Acción */}
        {(actionHref || onAction) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="pt-4"
          >
            {actionHref ? (
              <Link
                href={actionHref}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2"
              >
                <Plus className="w-5 h-5" />
                {displayActionLabel}
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <button
                onClick={onAction}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2"
              >
                <Plus className="w-5 h-5" />
                {displayActionLabel}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </motion.div>
        )}
      </div>

      {/* Decoración de fondo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-pink-100 rounded-full opacity-20 blur-xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-rose-100 rounded-full opacity-20 blur-xl"></div>
      </div>
    </motion.div>
  );
};

// Componentes específicos para diferentes tipos de estados vacíos
export const EmptyRegistros = () => (
  <EmptyState
    type="registros"
    title="No hay registros aún"
    description="Comienza tu viaje de autoconocimiento registrando tus emociones y experiencias diarias. Cada registro te ayudará a entender mejor tu ciclo lunar."
    actionHref="/dashboard"
    actionLabel="Crear mi primer registro"
  />
);

export const EmptyRecursos = () => (
  <EmptyState
    type="recursos"
    title="Recursos en camino"
    description="Pronto tendrás acceso a audios, rituales y guías espirituales cuidadosamente seleccionados para tu crecimiento personal."
    actionHref="/suscripcion"
    actionLabel="Ver suscripciones"
  />
);

export const EmptyCiclo = () => (
  <EmptyState
    type="ciclo"
    title="Configura tu ciclo"
    description="Para acceder a la galería de arquetipos, necesitas configurar tu fecha de inicio de ciclo en tu perfil."
    actionHref="/perfil"
    actionLabel="Completar perfil"
  />
);

export default EmptyState;
