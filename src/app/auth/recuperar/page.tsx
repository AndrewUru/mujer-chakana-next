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
    <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4 text-rose-700">
        Recuperar Contraseña
      </h1>
      <p className="mb-6 text-gray-600">
        Ingresa tu correo electrónico y te enviaremos instrucciones para
        restablecer tu contraseña.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="text-gray-700">Correo electrónico</span>
          <input
            type="email"
            className="mt-1 block w-full border rounded px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        {error && <div className="text-red-600">{error}</div>}
        <button
          type="submit"
          className="w-full bg-rose-600 text-white py-2 rounded hover:bg-rose-700 transition"
        >
          Enviar instrucciones
        </button>
        {submitted && (
          <div className="text-green-600 mt-2">
            Si el correo existe, recibirás instrucciones para restablecer tu
            contraseña.
          </div>
        )}
      </form>
    </div>
  );
}
