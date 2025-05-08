"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, AlertCircle } from "lucide-react";


export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Verificar sesión activa al cargar
  useEffect(() => {
    async function checkSession() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: perfiles } = await supabase
          .from("perfiles")
          .select("perfil_completo")
          .eq("user_id", user.id);

        if (perfiles && perfiles.length > 0) {
          const perfil = perfiles[0];
          router.push(perfil.perfil_completo ? "/bienvenida" : "/setup");
        }
      }
    }

    checkSession();
  }, [router]); // <- aquí agregamos [router] ✅

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMensaje(`⚠️ Error al iniciar sesión: ${error.message}`);
      setLoading(false);
      return;
    }

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
        setLoading(false);
        return;
      }

      const perfil = perfiles[0];
      router.push(perfil.perfil_completo ? "/bienvenida" : "/setup");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-50/25">
      <form
        onSubmit={handleLogin}
        className="max-w-md mx-auto mt-10 flex flex-col gap-1 bg-white p-8 rounded-2xl shadow-md border border-pink-100"
      >
        <h1 className="text-3xl font-bold text-center text-pink-800 mb-2">
          ✨ Iniciar sesión
        </h1>

        <p className="text-center text-sm text-pink-600">
          Bienvenida de nuevo, hermana.
        </p>
        <p className="text-center text-sm text-pink-600">
          Conectemos con tu camino 🌸
        </p>

        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border border-pink-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200 transition"
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border border-pink-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200 transition"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-pink-700 text-white py-3 rounded-lg font-semibold flex justify-center items-center gap-2 hover:bg-pink-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin h-5 w-5" /> Iniciando sesión...
            </>
          ) : (
            "Iniciar sesión"
          )}
        </button>

        {mensaje && (
          <div className="flex items-center space-x-2 bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-sm shadow-md transition-all duration-300">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{mensaje}</span>
          </div>
        )}
      </form>
    </div>
  );
}
