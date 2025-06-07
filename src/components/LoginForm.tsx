"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const router = useRouter();
  const passwordRef = useRef<HTMLInputElement>(null);

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

  // Validaciones simples
  const emailRegex = /\S+@\S+\.\S+/;
  const passMin = 6;

  const isEmailInvalid = touched.email && !emailRegex.test(email);
  const isPasswordInvalid = touched.password && password.length < passMin;

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
      className="w-full max-w-md flex flex-col gap-2 bg-white/70  p-6 rounded-2xl shadow-xl border border-pink-100"
      autoComplete="on"
      aria-label="Formulario de inicio de sesión"
    >
      {/* Email */}
      <div className="my-1">
        <label
          htmlFor="email"
          className="block text-xs text-pink-900 font-semibold ml-1 mb-1"
        >
          Correo electrónico
        </label>
        <div className="relative">
          <motion.input
            id="email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            required
            disabled={loading}
            whileFocus={{ scale: 1.03, boxShadow: "0 0 0 2px #f472b6" }}
            className={`w-full border ${
              isEmailInvalid ? "border-rose-400" : "border-pink-300"
            } p-3 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all placeholder:text-pink-700 text-pink-900`}
            autoComplete="email"
            aria-invalid={isEmailInvalid}
            aria-describedby={isEmailInvalid ? "email-error" : undefined}
          />
          {loading && (
            <Loader2 className="animate-spin h-5 w-5 absolute right-3 top-3 text-pink-400" />
          )}
        </div>
        {isEmailInvalid && (
          <motion.div
            id="email-error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-rose-500 mt-1 flex items-center gap-1"
          >
            <AlertCircle className="w-4 h-4" /> Ingresa un correo válido.
          </motion.div>
        )}
      </div>

      {/* Password */}
      <div className="mb-1">
        <label
          htmlFor="password"
          className="block text-xs text-pink-600 font-semibold ml-1 mb-1"
        >
          Contraseña
        </label>
        <div className="relative">
          <motion.input
            id="password"
            ref={passwordRef}
            type={showPass ? "text" : "password"}
            placeholder="Tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, password: true }))}
            required
            disabled={loading}
            whileFocus={{ scale: 1.03, boxShadow: "0 0 0 2px #f472b6" }}
            className={`w-full border ${
              isPasswordInvalid ? "border-rose-400" : "border-pink-300"
            } p-3 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all placeholder:text-pink-700 text-pink-900`}
            autoComplete="current-password"
            aria-invalid={isPasswordInvalid}
            aria-describedby={isPasswordInvalid ? "password-error" : undefined}
          />
          <button
            type="button"
            tabIndex={-1}
            className="absolute right-3 top-3 text-pink-400 hover:text-pink-600 transition"
            onClick={() => setShowPass((v) => !v)}
            aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {isPasswordInvalid && (
          <motion.div
            id="password-error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-rose-500 mt-1 flex items-center gap-1"
          >
            <AlertCircle className="w-4 h-4" /> Mínimo {passMin} caracteres.
          </motion.div>
        )}
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
        disabled={loading || isEmailInvalid || isPasswordInvalid}
        whileHover={{ scale: !loading ? 1.04 : 1 }}
        whileTap={{ scale: 0.96 }}
        className="mt-2 bg-gradient-to-br from-pink-700 to-pink-600 text-white py-3 rounded-lg font-bold flex justify-center items-center gap-2 shadow-lg hover:from-pink-800 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
      <div className="flex flex-col items-center mt-3">
        <span className="text-xs text-pink-500 mb-1 font-semibold tracking-wide">
          ¿Aún no tienes cuenta?
        </span>
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push("/auth/register")}
          className="text-pink-700 font-bold bg-pink-50 hover:bg-pink-100 rounded-lg px-4 py-2 mt-1 shadow transition text-base"
        >
          Regístrate gratis aquí
        </motion.button>
      </div>
    </motion.form>
  );
}
