"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordMinLength = 6;

interface TouchedState {
  email: boolean;
  password: boolean;
}

export default function LoginForm() {
  const router = useRouter();
  const passwordRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState<TouchedState>({
    email: false,
    password: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    async function checkSession() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: perfiles } = await supabase
        .from("perfiles")
        .select("perfil_completo")
        .eq("user_id", user.id);

      if (perfiles && perfiles.length > 0) {
        const perfil = perfiles[0];
        router.push(perfil.perfil_completo ? "/bienvenida" : "/setup");
      }
    }

    checkSession();
  }, [router]);

  const isEmailInvalid = useMemo(
    () => touched.email && !emailPattern.test(form.email.trim()),
    [form.email, touched.email]
  );

  const isPasswordInvalid = useMemo(
    () => touched.password && form.password.length < passwordMinLength,
    [form.password, touched.password]
  );

  const handleChange =
    (field: "email" | "password") =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
    };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setTouched((prev) => ({
      email: true,
      password: true,
    }));

    if (
      !emailPattern.test(form.email.trim()) ||
      form.password.length < passwordMinLength
    ) {
      return;
    }

    setFeedback("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: form.email.trim(),
      password: form.password,
    });

    if (error) {
      const message =
        error.message === "Invalid login credentials"
          ? "Correo o contrasena incorrectos. Intenta de nuevo."
          : `Error: ${error.message}`;
      setFeedback(message);
      setLoading(false);
      passwordRef.current?.focus();
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
        setFeedback("No encontramos un perfil asociado a este usuario.");
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
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex flex-col gap-5"
      aria-label="Formulario de inicio de sesion"
    >
      <div className="space-y-2 text-left">
        <label
          htmlFor="email"
          className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-500"
        >
          Correo electronico
        </label>
        <div className="relative">
          <motion.input
            id="email"
            type="email"
            placeholder="tu@email.com"
            value={form.email}
            onChange={handleChange("email")}
            onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
            required
            disabled={loading}
            whileFocus={{ scale: 1.01 }}
            className="w-full rounded-xl border border-rose-100 bg-white/70 px-4 py-3 text-sm text-rose-900 shadow-inner placeholder:text-rose-400 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200 transition disabled:opacity-60"
            autoComplete="email"
            aria-invalid={isEmailInvalid}
            aria-describedby={isEmailInvalid ? "email-error" : undefined}
          />
          {loading && (
            <Loader2 className="absolute right-3 top-3 h-5 w-5 animate-spin text-rose-400" />
          )}
        </div>
        {isEmailInvalid && (
          <motion.p
            id="email-error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-1 text-xs text-rose-500"
          >
            <AlertCircle className="h-4 w-4" />
            Ingresa un correo valido.
          </motion.p>
        )}
      </div>

      <div className="space-y-2 text-left">
        <label
          htmlFor="password"
          className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-500"
        >
          Contrasena
        </label>
        <div className="relative">
          <motion.input
            id="password"
            ref={passwordRef}
            type={showPassword ? "text" : "password"}
            placeholder="Tu contrasena"
            value={form.password}
            onChange={handleChange("password")}
            onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
            required
            disabled={loading}
            whileFocus={{ scale: 1.01 }}
            className="w-full rounded-xl border border-rose-100 bg-white/70 px-4 py-3 text-sm text-rose-900 shadow-inner placeholder:text-rose-400 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200 transition disabled:opacity-60"
            autoComplete="current-password"
            aria-invalid={isPasswordInvalid}
            aria-describedby={isPasswordInvalid ? "password-error" : undefined}
          />
          <button
            type="button"
            tabIndex={-1}
            className="absolute right-3 top-3 text-rose-400 transition hover:text-rose-600"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {isPasswordInvalid && (
          <motion.p
            id="password-error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-1 text-xs text-rose-500"
          >
            <AlertCircle className="h-4 w-4" />
            Minimo {passwordMinLength} caracteres.
          </motion.p>
        )}
        <div className="flex justify-end text-xs">
          <button
            type="button"
            tabIndex={-1}
            className="text-rose-500 underline-offset-2 transition hover:text-rose-700 hover:underline"
            onClick={() => router.push("/auth/recuperar")}
          >
            Olvidaste tu contrasena?
          </button>
        </div>
      </div>

      <motion.button
        type="submit"
        disabled={loading}
        whileHover={{ scale: loading ? 1 : 1.02 }}
        whileTap={{ scale: loading ? 1 : 0.96 }}
        className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-rose-600 via-rose-700 to-rose-800 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Iniciando sesion...
          </>
        ) : (
          "Iniciar sesion"
        )}
      </motion.button>

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow"
            role="alert"
            aria-live="assertive"
          >
            <AlertCircle className="h-5 w-5" />
            <span>{feedback}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col items-center gap-2 text-xs text-rose-500">
        <span>No tienes cuenta todavia?</span>
        <button
          type="button"
          onClick={() => router.push("/auth/register")}
          className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100"
        >
          Registrate gratis aqui
        </button>
      </div>
    </motion.form>
  );
}
