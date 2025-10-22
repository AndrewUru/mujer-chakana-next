"use client";

import { motion, type MotionProps } from "framer-motion";
import { GalleryThumbnails, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";

interface ArquetiposPanelProps extends MotionProps {
  isLoadingProfile: boolean;
  isSubscriber: boolean;
  onNavigateToArquetipos: () => void;
  onNavigateToSuscripcion: () => void;
}

const motionDefaults: MotionProps = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay: 0.3 },
};

export default function ArquetiposPanel({
  isLoadingProfile,
  isSubscriber,
  onNavigateToArquetipos,
  onNavigateToSuscripcion,
  ...motionOverrides
}: ArquetiposPanelProps) {
  return (
    <motion.section
      {...motionDefaults}
      {...motionOverrides}
      className="rounded-[32px] border border-rose-100/80 bg-white/80 p-8 text-center shadow-xl backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4">
        <h2 className="flex items-center justify-center gap-2 text-2xl font-semibold text-rose-900 sm:text-3xl">
          <GalleryThumbnails className="h-6 w-6 text-rose-500" />
          Galeria de arquetipos
        </h2>
        <p className="text-base text-rose-700">
          Accede a los arquetipos visuales y sus ensenanzas para profundizar cada
          fase. Las suscriptoras activas disfrutan de contenidos anticipados y
          ceremonias guiadas.
        </p>
        {isLoadingProfile ? (
          <div className="flex items-center gap-2 text-rose-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Cargando perfil...</span>
          </div>
        ) : isSubscriber ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNavigateToArquetipos}
            aria-label="Ver arquetipos de la galeria"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-pink-700 px-8 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl"
          >
            <GalleryThumbnails className="h-5 w-5" />
            Ver arquetipos
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNavigateToSuscripcion}
            aria-label="Suscribirse para acceder a la galeria"
            className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-8 py-3 font-semibold text-rose-800 shadow-sm transition hover:bg-rose-100"
          >
            <Sparkles className="h-5 w-5 text-rose-500" />
            Suscribete para acceder
          </motion.button>
        )}
        {!isSubscriber && !isLoadingProfile && (
          <Link
            href="/suscripcion"
            className="text-xs font-semibold text-rose-500 underline-offset-2 hover:underline"
          >
            Conoce los beneficios de la suscripcion
          </Link>
        )}
      </div>
    </motion.section>
  );
}
