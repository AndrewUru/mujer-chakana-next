"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Calendar,
  BookOpen,
  ChevronUp,
  ChevronDown,
  Moon,
  Heart,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface QuickNavProps {
  currentDay?: number;
  userName?: string;
}

const QuickNav = ({ currentDay, userName }: QuickNavProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const navItems = [
    {
      icon: <Home className="w-5 h-5" />,
      label: "Dashboard",
      href: "/dashboard",
      description: "Tu espacio principal",
      color: "from-pink-500 to-rose-500",
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      label: "Registros",
      href: "/registros",
      description: "Historial de tus días",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: <BookOpen className="w-5 h-5" />,
      label: "Recursos",
      href: "/recursos",
      description: "Contenido espiritual",
      color: "from-blue-500 to-purple-500",
    },
    {
      icon: <Moon className="w-5 h-5" />,
      label: "Ciclo",
      href: "/ciclo",
      description: "Galería de arquetipos",
      color: "from-indigo-500 to-blue-500",
    },
    {
      icon: <Heart className="w-5 h-5" />,
      label: "Perfil",
      href: "/perfil",
      description: "Configuración personal",
      color: "from-rose-500 to-pink-500",
    },
  ];

  return (
    <motion.div
      className="fixed bottom-6 right-6 mb-20 not-last:z-40"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.5 }}
    >
      {/* Botón principal */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-white/90 backdrop-blur-md border border-pink-200 rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={
          isExpanded ? "Cerrar navegación rápida" : "Abrir navegación rápida"
        }
      >
        {isExpanded ? (
          <ChevronDown className="w-6 h-6 text-pink-600" />
        ) : (
          <ChevronUp className="w-6 h-6 text-pink-600" />
        )}
      </motion.button>

      {/* Menú expandido */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="absolute bottom-16 right-0 bg-white/95 backdrop-blur-md border border-pink-200 rounded-2xl shadow-xl p-4 min-w-64"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="mb-4 pb-3 border-b border-pink-100">
              <h3 className="font-semibold text-pink-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Navegación Rápida
              </h3>
              {userName && (
                <p className="text-sm text-pink-600 mt-1">Hola, {userName}</p>
              )}
              {currentDay && (
                <p className="text-xs text-pink-500 mt-1">
                  Día {currentDay} de tu ciclo
                </p>
              )}
            </div>

            {/* Lista de navegación */}
            <nav className="space-y-2">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.2 }}
                >
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-pink-50 transition-all duration-200 group"
                    onClick={() => setIsExpanded(false)}
                  >
                    <div
                      className={`w-10 h-10 rounded-full bg-gradient-to-r ${item.color} flex items-center justify-center text-white shadow-md group-hover:shadow-lg transition-shadow duration-200`}
                    >
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-pink-800 group-hover:text-pink-900 transition-colors">
                        {item.label}
                      </p>
                      <p className="text-xs text-pink-600 group-hover:text-pink-700 transition-colors">
                        {item.description}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-pink-100">
              <p className="text-xs text-pink-500 text-center">
                Acceso rápido a todas las secciones
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default QuickNav;
