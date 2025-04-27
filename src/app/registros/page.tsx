"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    async function fetchRegistros() {
      const user = await supabase.auth.getUser();
      if (user.data?.user?.id) {
        const { data, error } = await supabase
          .from("registros")
          .select("*")
          .eq("user_id", user.data.user.id)
          .order("fecha", { ascending: false });

        if (error) {
          console.error("Error cargando registros", error.message);
        } else {
          setRegistros(data || []);
        }
      }
      setLoading(false);
    }

    fetchRegistros();
  }, []);

  if (loading)
    return (
      <p className="text-center mt-10 text-pink-600">
        🌙 Cargando registros...
      </p>
    );

  return (
    <main className="max-w-3xl mx-auto p-4 space-y-8 text-rose-900">
      <h1 className="text-3xl font-extrabold text-center mb-8 text-pink-700">
        📖 Mis Registros Diarios
      </h1>

      {registros.length === 0 ? (
        <p className="text-center text-pink-500 italic">
          No has registrado ningún día aún. 🌸
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {registros.map((registro) => (
            <motion.div
              key={registro.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className={`rounded-2xl p-5 shadow-md border-2 ${
                registro.energia && registro.energia >= 4
                  ? "border-pink-400 bg-pink-50"
                  : "border-rose-200 bg-white"
              } hover:shadow-lg hover:scale-[1.02] transition-all`}
            >
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                📅 {new Date(registro.fecha).toLocaleDateString()}
              </h2>

              <div className="text-sm space-y-1">
                <p>
                  💬 <strong>Emociones:</strong>{" "}
                  {registro.emociones || "Sin registrar"}
                </p>
                <p>
                  🔥 <strong>Energía:</strong>{" "}
                  {registro.energia ?? "No registrado"}
                </p>
                <p>
                  🎨 <strong>Creatividad:</strong>{" "}
                  {registro.creatividad ?? "No registrado"}
                </p>
                <p>
                  🌟 <strong>Espiritualidad:</strong>{" "}
                  {registro.espiritualidad ?? "No registrado"}
                </p>
                {registro.notas && (
                  <p className="text-rose-700 italic pt-2">
                    &quot;{registro.notas}&quot;
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </main>
  );
}
