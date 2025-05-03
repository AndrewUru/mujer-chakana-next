"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";

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
  const router = useRouter(); // ✅ nuevo hook para redirección

  useEffect(() => {
    async function fetchRegistros() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // 🔁 Redirección si no hay usuario autenticado
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

  return (
    <main className="mx-auto px-4 py-8 text-rose-900 max-w-7xl pb-24">
      <section className="text-center bg-pink-100/60 backdrop-blur-md rounded-3xl p-8 shadow-xl mb-10">
        <h1 className="text-4xl font-extrabold text-pink-800 mb-4">
          🌸 Mis Registros Diarios
        </h1>
        <p className="text-lg text-rose-700 max-w-2xl mx-auto">
          Cada día que completas tu registro, das un paso hacia tu
          autoconocimiento y bienestar cíclico.
          <p>
            <span className="font-semibold">
              {" "}
              Las suscriptoras pueden, al completar sus registros, solicitar una
              video consulta personalizada con Samari Luz
            </span>
          </p>
          para profundizar en su camino y recibir una guía exclusiva. ✨
        </p>
      </section>

      {registros.length === 0 ? (
        <p className="text-center text-pink-500 italic text-lg">
          No has registrado ningún día aún. 🌸
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {registros.map((registro) => (
            <motion.div
              key={registro.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className={`rounded-3xl p-6 shadow-xl border transition-all hover:scale-[1.02] hover:shadow-2xl bg-white/90
          ${
            registro.energia && registro.energia >= 4
              ? "border-pink-400"
              : "border-rose-200"
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
                <div className="mt-4 p-4 rounded-xl bg-pink-50 border-l-4 border-pink-300 text-rose-800 text-sm shadow-sm">
                  🌸 <strong>Reflexión del día:</strong>
                  <br />
                  {registro.mensaje}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </main>
  );
}
