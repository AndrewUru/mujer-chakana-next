"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function ActualizarClavePage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setExito(false);

    if (password.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmacion) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setError("Error al actualizar la contraseña. Intenta nuevamente.");
    } else {
      setExito(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold text-center text-rose-700 mb-4">
        Establecer nueva contraseña
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="text-gray-700">Nueva contraseña</span>
          <input
            type="password"
            className="mt-1 block w-full border rounded px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <label className="block">
          <span className="text-gray-700">Confirmar contraseña</span>
          <input
            type="password"
            className="mt-1 block w-full border rounded px-3 py-2"
            value={confirmacion}
            onChange={(e) => setConfirmacion(e.target.value)}
            required
          />
        </label>
        {error && <div className="text-red-600">{error}</div>}
        <button
          type="submit"
          className="w-full bg-rose-600 text-white py-2 rounded hover:bg-rose-700 transition"
        >
          Guardar contraseña
        </button>
        {exito && (
          <div className="text-green-600 mt-2 text-center">
            ✅ Contraseña actualizada. Serás redirigida al inicio de sesión.
          </div>
        )}
      </form>
    </div>
  );
}
