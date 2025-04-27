"use client";

import { useEffect, useState } from "react";
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
    return <p className="text-center mt-10">Cargando registros...</p>;

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6 text-rose-900">
      <h1 className="text-2xl font-bold mb-6 text-center">
        📖 Mis Registros Diarios
      </h1>

      {registros.length === 0 ? (
        <p className="text-center text-pink-600">
          Aún no has registrado ningún día. 🌸
        </p>
      ) : (
        registros.map((registro) => (
          <div
            key={registro.id}
            className="bg-white p-4 rounded-xl shadow border border-pink-200 transition hover:shadow-lg"
          >
            <h2 className="text-lg font-semibold mb-2">
              📅 {new Date(registro.fecha).toLocaleDateString()}
            </h2>
            <p>💬 Emociones: {registro.emociones || "Sin registrar"}</p>
            <p>🔥 Energía: {registro.energia}</p>
            <p>🎨 Creatividad: {registro.creatividad}</p>
            <p>🌟 Espiritualidad: {registro.espiritualidad}</p>
            <p>📝 Notas: {registro.notas || "Sin notas"}</p>
          </div>
        ))
      )}
    </main>
  );
}
