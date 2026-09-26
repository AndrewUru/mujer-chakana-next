"use client";

import AccountGateway from "@/components/ui/AccountGateway";

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
        router.push("/auth/login");
      }, 3000);
    }
  };

  return (
    <AccountGateway eyebrow="Un nuevo comienzo" title="Vuelve a tu espacio." accent="A tu ritmo." description="Elige una nueva contraseña para continuar tu recorrido personal." formTitle="Tu nueva contraseña.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span >Nueva contraseña</span>
          <input
            type="password"
            autoComplete="new-password"
            className="mt-1 block w-full border rounded px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <label className="block">
          <span >Confirmar contraseña</span>
          <input
            type="password"
            autoComplete="new-password"
            className="mt-1 block w-full border rounded px-3 py-2"
            value={confirmacion}
            onChange={(e) => setConfirmacion(e.target.value)}
            required
          />
        </label>
        {error && <div role="alert">{error}</div>}
        <button
          type="submit"
          className="w-full bg-rose-600 text-white py-2 rounded hover:bg-rose-700 transition"
        >
          Guardar contraseña
        </button>
        {exito && (
          <div role="status">
            ✅ Contraseña actualizada. Serás redirigida al inicio de sesión.
          </div>
        )}
      </form>
    </AccountGateway>
  );
}
