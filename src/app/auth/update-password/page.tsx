"use client";

import AccountGateway from "@/components/ui/AccountGateway";

//import { useEffect, useState } from "react";
import { useState } from "react";
import "@/app/globals.css";

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
    <AccountGateway eyebrow="Cuida tu espacio" title="Tu refugio." accent="Tu tranquilidad." description="Actualiza tu contraseña y vuelve a conectar con tu ciclo." formTitle="Tu nueva contraseña.">
      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <label htmlFor="new-password">Nueva contraseña</label>

        <input
          id="new-password"
          type="password"
          autoComplete="new-password"
          minLength={6}
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

        {mensaje && <p role="status">{mensaje}</p>}
      </form>
    </AccountGateway>
  );
}
