"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";

// ---- Modal de confirmación ----

function ConfirmModal({
  mensaje,
  onConfirmar,
  onCancelar,
}: {
  mensaje: string;
  onConfirmar: () => void;
  onCancelar: () => void;
}) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="glass-panel max-w-md rounded-3xl p-8 text-center"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.8 }}
        >
          <p className="text-rose-800 text-lg mb-6">{mensaje}</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={onCancelar}
              className="glass-soft px-4 py-2 rounded-lg text-rose-700 hover:bg-white/70"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirmar}
              className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
            >
              Sí, eliminar
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ---- Página principal ----

interface Registro {
  id: string;
  fecha: string;
  emociones?: string;
  energia?: number;
  creatividad?: number;
  espiritualidad?: number;
  notas?: string;
  mensaje?: string;
}

export default function RegistroPage() {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(true);
  const [mesSeleccionado, setMesSeleccionado] = useState<string>("todos");
  const router = useRouter();
  const [registroAEliminar, setRegistroAEliminar] = useState<string | null>(
    null
  );
  const [mostrandoConfirmacion, setMostrandoConfirmacion] = useState(false);

  useEffect(() => {
    async function fetchRegistros() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/");
        return;
      }

      const { data, error } = await supabase
        .from("registros")
        .select("*")
        .eq("user_id", user.id)
        .order("fecha", { ascending: false });

      if (error) {
        console.error("Error cargando registros", error.message);
      } else {
        setRegistros(data || []);
      }

      setLoading(false);
    }

    fetchRegistros();
  }, [router]);

  // Agrupa meses disponibles
  const mesesDisponibles = Array.from(
    new Set(
      registros.map((r) =>
        new Date(r.fecha).toLocaleString("default", {
          month: "long",
          year: "numeric",
        })
      )
    )
  );

  // Filtrar por mes
  const registrosFiltrados =
    mesSeleccionado === "todos"
      ? registros
      : registros.filter(
          (r) =>
            new Date(r.fecha).toLocaleString("default", {
              month: "long",
              year: "numeric",
            }) === mesSeleccionado
        );

  // ----- Pedir confirmación antes de eliminar -----
  function pedirConfirmacion(id: string) {
    setRegistroAEliminar(id);
    setMostrandoConfirmacion(true);
  }

  // ----- Eliminar registro -----
  async function eliminarRegistro(id: string) {
    const { error } = await supabase.from("registros").delete().eq("id", id);

    if (error) {
      console.error("Error eliminando el registro:", error.message);
      return;
    }

    setRegistros((prev) => prev.filter((r) => r.id !== id));
    setMostrandoConfirmacion(false);
  }

  // ----- Loading -----
  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white-700">
        <motion.div
          className="w-16 h-16 border-4 border-pink-300 border-t-transparent rounded-full animate-spin mb-4"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, ease: "linear", duration: 1 }}
        />
        <p className="text-2xl font-semibold">🌙 Cargando tus registros...</p>
      </div>
    );

  // ----- Render -----
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 pb-24 text-rose-900">
      <section className="glass-shell mb-10 rounded-3xl p-8 text-center">
        <h1 className="text-4xl font-extrabold text-pink-800 mb-4">
          🌸 Mis Registros Diarios
        </h1>
        <p className="text-lg text-rose-700 max-w-2xl mx-auto">
          Cada día que completas tu registro, das un paso hacia tu
          autoconocimiento y bienestar cíclico.
          <p>
            <span className="font-semibold">
              Las suscriptoras pueden solicitar una video consulta personalizada
              con Samari Luz
            </span>
          </p>
          para profundizar en su camino y recibir una guía exclusiva. ✨
        </p>
      </section>

      <div className="mb-6 flex justify-center">
        <select
          className="rounded-xl border border-rose-300 bg-white/70 p-2 text-rose-800 shadow-inner"
          onChange={(e) => setMesSeleccionado(e.target.value)}
          value={mesSeleccionado}
        >
          <option value="todos">🌕 Ver todos los meses</option>
          {mesesDisponibles.map((mes) => (
            <option key={mes} value={mes}>
              {mes}
            </option>
          ))}
        </select>
      </div>

      {registrosFiltrados.length === 0 ? (
        <div className="glass-soft mx-auto max-w-md rounded-xl p-4">
          <p className="text-center text-pink-500 italic text-lg">
            No hay registros para este mes. 🌸
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {registrosFiltrados.map((registro) => (
              <motion.div
                key={registro.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4 }}
                className={`glass-panel rounded-3xl p-6 transition-all hover:scale-[1.02]
              ${
                registro.energia && registro.energia >= 4
                  ? "border-pink-300/70"
                  : "border-rose-100/70"
              }`}
              >
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-pink-700">
                  📅 {new Date(registro.fecha).toLocaleDateString()}
                </h2>

                <ul className="text-sm space-y-2">
                  <li>
                    💬 <strong>Emociones:</strong>{" "}
                    {registro.emociones || "Sin registrar"}
                  </li>
                  <li>
                    🔥 <strong>Energía:</strong>{" "}
                    {registro.energia ?? "No registrado"}
                  </li>
                  <li>
                    🎨 <strong>Creatividad:</strong>{" "}
                    {registro.creatividad ?? "No registrado"}
                  </li>
                  <li>
                    🪷 <strong>Espiritualidad:</strong>{" "}
                    {registro.espiritualidad ?? "No registrado"}
                  </li>
                </ul>

                {registro.notas && (
                  <blockquote className="mt-4 text-sm italic text-rose-600 border-l-4 border-rose-300 pl-4">
                    “{registro.notas}”
                  </blockquote>
                )}

                {registro.mensaje && (
                  <div className="glass-soft mt-4 rounded-xl border-l-4 border-pink-300 p-4 text-sm text-rose-800">
                    🌸 <strong>Reflexión del día:</strong>
                    <br />
                    {registro.mensaje}
                  </div>
                )}

                <button
                  onClick={() => pedirConfirmacion(registro.id)}
                  className="mt-4 rounded-lg border border-red-200/70 bg-red-100/70 px-4 py-2 text-red-700 transition hover:bg-red-100"
                >
                  🗑 Eliminar
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal de confirmación */}
      {mostrandoConfirmacion && registroAEliminar && (
        <ConfirmModal
          mensaje="¿Estás segura de que quieres eliminar este registro? Esta acción no se puede deshacer."
          onConfirmar={() => eliminarRegistro(registroAEliminar)}
          onCancelar={() => setMostrandoConfirmacion(false)}
        />
      )}
    </main>
  );
}
