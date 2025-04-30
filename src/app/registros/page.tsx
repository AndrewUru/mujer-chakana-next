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
      <p className="text-center mt-10 text-pink-600">
        🌙 Cargando registros...
      </p>
    );

  return (
    <main className="mx-auto px-4 py-8 text-rose-900 max-w-7xl">
      <h1 className="text-3xl font-extrabold text-center mb-10 text-pink-700">
        📖 Mis Registros Diarios
      </h1>

      {registros.length === 0 ? (
        <p className="text-center text-pink-500 italic">
          No has registrado ningún día aún. 🌸
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {registros.map((registro) => (
            <motion.div
              key={registro.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className={`rounded-3xl p-6 shadow-xl border-2 transition-all hover:scale-[1.02] hover:shadow-2xl
            ${
              registro.energia && registro.energia >= 4
                ? "border-pink-400 bg-gradient-to-br from-pink-50 to-white"
                : "border-rose-200 bg-white"
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
                  🌟 <strong>Espiritualidad:</strong>{" "}
                  {registro.espiritualidad ?? "No registrado"}
                </li>
              </ul>

              {registro.notas && (
                <blockquote className="mt-4 text-sm italic text-rose-600 border-l-4 border-rose-300 pl-4">
                  “{registro.notas}”
                </blockquote>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </main>
  );
}
