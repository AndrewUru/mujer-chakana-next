"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMensaje(`⚠️ Error al iniciar sesión: ${error.message}`);
      return;
    }

    // Obtenemos el usuario actual
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: perfiles, error: perfilError } = await supabase
        .from("perfiles")
        .select("perfil_completo")
        .eq("user_id", user.id);

      if (perfilError || !perfiles || perfiles.length === 0) {
        setMensaje("⚠️ No se encontró un perfil para este usuario.");
        return;
      }

      const perfil = perfiles[0];

      // Redirigir según estado del perfil
      if (perfil?.perfil_completo) {
        router.push("/dashboard");
      } else {
        router.push("/setup");
      }
    }
  };

  return (
    <form
      onSubmit={handleLogin}
      className="max-w-md mx-auto mt-10 flex flex-col gap-4 bg-white p-6 rounded shadow"
    >
      <h1 className="text-2xl font-bold text-center text-pink-800">
        Iniciar sesión
      </h1>

      <input
        type="email"
        placeholder="Correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="border border-pink-300 p-2 rounded"
      />

      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="border border-pink-300 p-2 rounded"
      />

      <button
        type="submit"
        className="bg-pink-700 text-white py-2 rounded hover:bg-pink-800 transition"
      >
        Iniciar sesión
      </button>

      {mensaje && <p className="text-sm text-red-600">{mensaje}</p>}
    </form>
  );
}
