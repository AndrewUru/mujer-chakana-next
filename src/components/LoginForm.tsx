"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const passwordRef = useRef<HTMLInputElement>(null);

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
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMensaje(
        error.message === "Invalid login credentials"
          ? "⚠️ Correo o contraseña incorrectos. Intenta de nuevo."
          : `⚠️ Error: ${error.message}`
      );
      setLoading(false);
      if (passwordRef.current) passwordRef.current.focus();
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
    <motion.form
      onSubmit={handleLogin}
      initial={{ opacity: 0, y: 30, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-full flex flex-col gap-1 bg-white/90 p-8 rounded-2xl shadow-md border border-pink-100"
      autoComplete="on"
    >
      <p className="text-center text-sm text-pink-600">
        Bienvenida de nuevo, hermana.
        <br />
        <span className="text-pink-400">Accede a tu espacio sagrado 🌙</span>
      </p>

      {/* Email */}
      <div className="my-2">
        <label
          htmlFor="email"
          className="block text-xs text-pink-600 font-semibold mb-1 ml-1"
        >
          Correo electrónico
        </label>
        <motion.input
          id="email"
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          whileFocus={{ scale: 1.04, boxShadow: "0 0 0 2px #f472b6" }}
          className="w-full border border-pink-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all placeholder:text-pink-200 text-pink-900"
          autoComplete="email"
        />
      </div>

      {/* Password */}
      <div className="mb-1">
        <label
          htmlFor="password"
          className="block text-xs text-pink-600 font-semibold mb-1 ml-1"
        >
          Contraseña
        </label>
        <motion.input
          id="password"
          ref={passwordRef}
          type="password"
          placeholder="Tu contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
          whileFocus={{ scale: 1.04, boxShadow: "0 0 0 2px #f472b6" }}
          className="w-full border border-pink-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all placeholder:text-pink-200 text-pink-900"
          autoComplete="current-password"
        />
        {/* Recuperar contraseña */}
        <div className="flex justify-end mt-1">
          <button
            type="button"
            tabIndex={-1}
            className="text-xs text-pink-500 hover:underline hover:text-pink-700 transition"
            onClick={() => router.push("/auth/recuperar")}
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      </div>

      {/* Botón login */}
      <motion.button
        type="submit"
        disabled={loading}
        whileHover={{ scale: !loading ? 1.03 : 1 }}
        whileTap={{ scale: 0.97 }}
        className="mt-2 bg-gradient-to-br from-pink-700 to-pink-600 text-white py-3 rounded-lg font-semibold flex justify-center items-center gap-2 shadow-md hover:from-pink-800 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin h-5 w-5" /> Iniciando sesión...
          </>
        ) : (
          "Iniciar sesión"
        )}
      </motion.button>

      {/* Mensaje de error */}
      <AnimatePresence>
        {mensaje && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.3 }}
            className="flex items-center space-x-2 bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-sm shadow-md mt-4"
            role="alert"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{mensaje}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA registro */}
      <div className="flex flex-col items-center mt-6">
        <span className="text-xs text-pink-500 mb-1">
          ¿Aún no tienes cuenta?
        </span>
        <button
          type="button"
          onClick={() => router.push("/auth/register")}
          className="text-pink-700 font-bold hover:underline hover:text-pink-900 text-sm transition"
        >
          Regístrate gratis aquí
        </button>
      </div>
    </motion.form>
  );
}
