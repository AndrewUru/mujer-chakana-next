"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function SetupPage() {
  const [fecha, setFecha] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [userId, setUserId] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function cargarFecha() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.push("/login");
        return;
      }

      setUserId(session.user.id);

      const { data } = await supabase
        .from("perfiles")
        .select("fecha_inicio")
        .eq("id", session.user.id)
        .single();

      if (data?.fecha_inicio) {
        setFecha(data.fecha_inicio);
      }
    }

    cargarFecha();
  }, [router]);

  const guardarFecha = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase
      .from("perfiles")
      .upsert({ id: userId, fecha_inicio: fecha }, { onConflict: "id" });

    if (error) {
      setMensaje("❌ Hubo un error al guardar la fecha.");
      console.error(error);
    } else {
      setMensaje("✨ Fecha guardada correctamente.");
      setTimeout(() => {
        router.push("/dashboard?refreshed=" + Date.now());
      }, 1200);
    }
  };

  return (
    <main className="min-h-screen bg-pink-50 flex items-center justify-center px-4 py-8 text-pink-900">
      <form
        onSubmit={guardarFecha}
        className="bg-white max-w-md w-full rounded-2xl shadow-xl p-6 border border-pink-200 text-center"
      >
        <h1 className="text-3xl font-bold text-pink-700 mb-4">
          🌸 Configura tu ciclo
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          Selecciona tu fecha de inicio del ciclo personal para comenzar el
          viaje de 28 días.
        </p>

        <label
          htmlFor="fecha_inicio"
          className="block text-left text-sm font-medium mb-1"
        >
          Fecha de inicio
        </label>
        <input
          type="date"
          id="fecha_inicio"
          name="fecha_inicio"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="w-full border border-pink-300 p-3 rounded-lg shadow-sm mb-4"
          required
        />

        <button
          type="submit"
          className="w-full bg-pink-700 hover:bg-pink-800 text-white py-2 rounded-lg font-semibold transition"
        >
          Guardar fecha
        </button>

        {mensaje && <p className="mt-4 text-sm text-pink-600">{mensaje}</p>}

        <a
          href="/dashboard"
          className="inline-block mt-6 text-sm text-pink-500 hover:underline"
        >
          ← Volver al dashboard
        </a>
      </form>
    </main>
  );
}
