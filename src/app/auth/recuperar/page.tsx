"use client";

import AccountGateway from "@/components/ui/AccountGateway";

import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function RecuperarPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitted(false);

    if (!email) {
      setError("Por favor, ingresa tu correo electrónico.");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/actualizar-clave`,
    });

    if (error) {
      setError("Ocurrió un error al enviar el correo. Intenta nuevamente.");
      return;
    }

    setSubmitted(true);
  };

  return (
    <AccountGateway eyebrow="Volver a conectar" title="Retoma tu camino." accent="Estamos aquí." description="Recupera el acceso a tus registros y rituales. Te enviaremos por correo los pasos para elegir una nueva contraseña." formTitle="Recupera tu acceso.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span >Correo electrónico</span>
          <input
            type="email"
            autoComplete="email"
            className="mt-1 block w-full border rounded px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        {error && <div role="alert">{error}</div>}
        <button
          type="submit"
          className="w-full bg-rose-600 text-white py-2 rounded hover:bg-rose-700 transition"
        >
          Enviar instrucciones
        </button>
        {submitted && (
          <div role="status">
            Si el correo existe, recibirás instrucciones para restablecer tu
            contraseña.
          </div>
        )}
      </form>
    </AccountGateway>
  );
}
