// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithOtp({ email });

    if (error) {
      setMensaje("⚠️ Error al enviar el enlace: " + error.message);
    } else {
      setMensaje("✨ Revisa tu correo. ¡Te enviamos un enlace mágico!");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-pink-50 text-pink-900 p-6">
      <h1 className="text-3xl font-bold mb-4">Inicia sesión</h1>
      <form
        onSubmit={handleLogin}
        className="max-w-md w-full bg-white p-6 rounded-xl shadow space-y-4"
      >
        <label className="block text-sm font-medium">Correo electrónico</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-3 border border-pink-300 rounded-md shadow-sm"
        />
        <button
          type="submit"
          className="w-full bg-pink-700 text-white py-2 rounded-lg font-semibold hover:bg-pink-800 transition"
        >
          Enviar enlace mágico ✨
        </button>
        {mensaje && <p className="text-center mt-2 text-sm">{mensaje}</p>}
      </form>
    </div>
  );
}
