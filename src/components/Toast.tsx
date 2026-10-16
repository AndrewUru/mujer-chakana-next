"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, Info, X, Loader2 } from "lucide-react";
import { useEffect, useSyncExternalStore } from "react";

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
  success: <CheckCircle className="w-5 h-5 text-green-500" />,
  error: <AlertCircle className="w-5 h-5 text-red-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
  loading: <Loader2 className="w-5 h-5 text-pink-500 animate-spin" />,
};

const colors = {
  success: "bg-green-50 border-green-200 text-green-800",
  error: "bg-red-50 border-red-200 text-red-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
  loading: "bg-pink-50 border-pink-200 text-pink-800",
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
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      className={`pointer-events-auto w-full p-4 rounded-lg shadow-lg border backdrop-blur-sm ${colors[type]}`}
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
            className="flex-shrink-0 ml-2 p-1 rounded-full hover:bg-black/10"
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
