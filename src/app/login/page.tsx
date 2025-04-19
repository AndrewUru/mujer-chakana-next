"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import "@/app/globals.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [modo, setModo] = useState<"password" | "magic">("password");

  const router = useRouter();

  useEffect(() => {
    setMensaje("");
    setPassword(""); // Limpiar password si se cambia de modo
  }, [modo]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje("");

    if (!email) {
      setMensaje("⚠️ Por favor ingresá tu correo electrónico.");
      return;
    }

    if (modo === "password" && !password) {
      setMensaje("⚠️ Por favor ingresá tu contraseña.");
      return;
    }

    try {
      if (modo === "password") {
        console.log("Login con contraseña", email, password);

        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setMensaje(`⚠️ Error al iniciar sesión: ${error.message}`);
        } else {
          router.push("/dashboard");
        }
      } else {
        console.log("Login con enlace mágico", email);

        const { error } = await supabase.auth.signInWithOtp({ email });

        if (error) {
          setMensaje(`⚠️ Error al enviar el enlace mágico: ${error.message}`);
        } else {
          setMensaje("📩 Revisa tu correo: ¡Te enviamos un enlace mágico!");
        }
      }
    } catch (err) {
      setMensaje("❌ Ocurrió un error inesperado. Intentalo de nuevo.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-pink-50 text-pink-900 p-6">
      <h1 className="text-3xl font-bold mb-4">Iniciá sesión</h1>

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setModo("password")}
          className={`px-3 py-1 rounded ${
            modo === "password"
              ? "bg-pink-700 text-white"
              : "bg-white border border-pink-300"
          }`}
        >
          Contraseña
        </button>
        <button
          onClick={() => setModo("magic")}
          className={`px-3 py-1 rounded ${
            modo === "magic"
              ? "bg-pink-700 text-white"
              : "bg-white border border-pink-300"
          }`}
        >
          Enlace mágico
        </button>
      </div>

      <form
        onSubmit={handleLogin}
        className="max-w-md w-full bg-white p-6 rounded-lg shadow space-y-4"
      >
        <label className="block text-sm font-medium">Correo electrónico</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-2 border border-pink-300 rounded-md shadow-sm"
        />

        {modo === "password" && (
          <>
            <label className="block text-sm font-medium">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-2 border border-pink-300 rounded-md shadow-sm"
            />
          </>
        )}

        <button
          type="submit"
          className="w-full bg-pink-700 text-white p-2 rounded hover:bg-pink-800 transition"
        >
          {modo === "password" ? "Iniciar sesión" : "Enviar enlace mágico"}
        </button>

        {mensaje && <p className="text-sm mt-2">{mensaje}</p>}
      </form>
    </div>
  );
}
