"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, Info, X, Loader2 } from "lucide-react";
import { useEffect, useSyncExternalStore } from "react";
import { enter } from "@/lib/motion";

export type ToastType = "success" | "error" | "info" | "loading";

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

// Almacén compartido: cualquier componente puede lanzar un toast y el
// contenedor montado (uno por página) lo muestra.
let toasts: ToastItem[] = [];
const NO_TOASTS: ToastItem[] = [];
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((listener) => listener());
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export function addToast(type: ToastType, message: string) {
  const id = Math.random().toString(36).slice(2, 11);
  toasts = [...toasts, { id, type, message }];
  emit();
  return id;
}

export function removeToast(id: string) {
  toasts = toasts.filter((toast) => toast.id !== id);
  emit();
}

const icons = {
  success: <CheckCircle className="w-5 h-5 text-success" />,
  error: <AlertCircle className="w-5 h-5 text-danger" />,
  info: <Info className="w-5 h-5 text-cielo" />,
  loading: <Loader2 className="w-5 h-5 text-blush animate-spin" />,
};

const accents = {
  success: "border-success/30",
  error: "border-danger/40",
  info: "border-cielo/25",
  loading: "border-blush/30",
};

function Toast({ id, type, message, duration = 5000 }: ToastItem & { duration?: number }) {
  useEffect(() => {
    if (type === "loading") return;
    const timer = setTimeout(() => removeToast(id), duration);
    return () => clearTimeout(timer);
  }, [duration, id, type]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.96 }}
      transition={enter()}
      className={`pointer-events-auto w-full rounded-2xl border bg-plum/95 p-4 text-ink shadow-[0_16px_55px_rgb(13_3_11/0.45)] backdrop-blur-xl ${accents[type]}`}
      role={type === "error" ? "alert" : "status"}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">{icons[type]}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{message}</p>
        </div>
        {type !== "loading" && (
          <button
            type="button"
            onClick={() => removeToast(id)}
            className="-m-1 ml-1 grid h-8 w-8 flex-shrink-0 place-items-center rounded-full text-ink/70 hover:bg-white/10 hover:text-ink"
            aria-label="Cerrar notificación"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

export function ToastContainer() {
  const items = useSyncExternalStore(subscribe, () => toasts, () => NO_TOASTS);

  return (
    <div className="pointer-events-none fixed top-4 left-4 right-4 z-[60] ml-auto flex max-w-sm flex-col gap-2">
      <AnimatePresence initial={false}>
        {items.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </AnimatePresence>
    </div>
  );
}

export const useToast = () => ({ addToast, removeToast, ToastContainer });
