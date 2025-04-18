"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMensaje("❌ Error al actualizar la contraseña: " + error.message);
    } else {
      setMensaje("✅ Contraseña actualizada con éxito");
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-50 p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow max-w-md w-full"
      >
        <h1 className="text-xl font-bold mb-4 text-center">Nueva contraseña</h1>

        <input
          type="password"
          placeholder="Escribí tu nueva contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-pink-300 p-2 rounded w-full mb-4"
          required
        />

        <button
          type="submit"
          className="w-full bg-pink-700 text-white p-2 rounded hover:bg-pink-800"
        >
          Actualizar
        </button>

        {mensaje && <p className="mt-2 text-sm text-center">{mensaje}</p>}
      </form>
    </div>
  );
}
