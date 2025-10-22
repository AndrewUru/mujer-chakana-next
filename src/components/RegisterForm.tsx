"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordMinLength = 6;
const usernameMinLength = 2;

interface TouchedState {
  email: boolean;
  password: boolean;
  username: boolean;
}

export default function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    username: "",
  });
  const [touched, setTouched] = useState<TouchedState>({
    email: false,
    password: false,
    username: false,
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const tipoPlan = "gratuito";

  const isEmailInvalid = useMemo(
    () => touched.email && !emailPattern.test(form.email.trim()),
    [form.email, touched.email]
  );

  const isPasswordInvalid = useMemo(
    () => touched.password && form.password.length < passwordMinLength,
    [form.password, touched.password]
  );

  const isUsernameInvalid = useMemo(
    () => touched.username && form.username.trim().length < usernameMinLength,
    [form.username, touched.username]
  );

  const handleChange =
    (field: keyof typeof form) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
    };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setTouched({
      email: true,
      password: true,
      username: true,
    });

    if (
      !emailPattern.test(form.email.trim()) ||
      form.password.length < passwordMinLength ||
      form.username.trim().length < usernameMinLength
    ) {
      return;
    }

    setFeedback("");
    setLoading(true);

    const {
      data: { user },
      error,
    } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
    });

    if (error) {
      setFeedback(`Error: ${error.message}`);
      setLoading(false);
      return;
    }

    if (user) {
      const { error: insertError } = await supabase.from("perfiles").insert([
        {
          id: user.id,
          user_id: user.id,
          display_name: form.username.trim(),
          perfil_completo: false,
          tipo_plan: tipoPlan,
          activo: true,
        },
      ]);

      if (insertError) {
        setFeedback(`Error al crear el perfil: ${insertError.message}`);
        setLoading(false);
        return;
      }

      const today = new Date().toISOString().split("T")[0];
      const arquetipoInicial = "La Visionaria";
      const descripcionInicial =
        "En su cueva interior, La Visionaria recibe imagenes, suenos y revelaciones. Dia para descansar y visionar el ciclo que comienza.";

      const { error: cicloError } = await supabase
        .from("mujer_chakana")
        .insert([
          {
            user_id: user.id,
            dia_ciclo: 1,
            semana: 1,
            fecha: today,
            arquetipo: arquetipoInicial,
            descripcion: descripcionInicial,
          },
        ]);

      if (cicloError) {
        console.error("Error al asignar dia 1 del ciclo:", cicloError.message);
      }

      router.push("/bienvenida");
    }

    setLoading(false);
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex flex-col gap-5 text-left"
      aria-label="Formulario de registro"
    >
      <div className="space-y-2">
        <label
          htmlFor="username"
          className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-500"
        >
          Nombre de usuaria
        </label>
        <motion.input
          id="username"
          type="text"
          placeholder="Como quieres que te llamemos?"
          value={form.username}
          onChange={handleChange("username")}
          onBlur={() => setTouched((prev) => ({ ...prev, username: true }))}
          required
          disabled={loading}
          whileFocus={{ scale: 1.01 }}
          className="w-full rounded-xl border border-rose-100 bg-white/70 px-4 py-3 text-sm text-rose-900 shadow-inner placeholder:text-rose-400 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200 transition disabled:opacity-60"
          aria-invalid={isUsernameInvalid}
          aria-describedby={isUsernameInvalid ? "username-error" : undefined}
        />
        {isUsernameInvalid && (
          <motion.p
            id="username-error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-1 text-xs text-rose-500"
          >
            <AlertCircle className="h-4 w-4" />
            Necesitamos al menos {usernameMinLength} caracteres.
          </motion.p>
        )}
      </div>

      <div className="space-y-2">
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

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-500"
        >
          Contrasena
        </label>
        <motion.input
          id="password"
          type="password"
          placeholder="Crea una contrasena segura"
          value={form.password}
          onChange={handleChange("password")}
          onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
          required
          disabled={loading}
          whileFocus={{ scale: 1.01 }}
          className="w-full rounded-xl border border-rose-100 bg-white/70 px-4 py-3 text-sm text-rose-900 shadow-inner placeholder:text-rose-400 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200 transition disabled:opacity-60"
          autoComplete="new-password"
          aria-invalid={isPasswordInvalid}
          aria-describedby={isPasswordInvalid ? "password-error" : undefined}
        />
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
      </div>

      <div className="rounded-3xl border border-amber-200/60 bg-amber-50/70 px-5 py-4 text-xs text-amber-700">
        <strong>Importante:</strong> al crear tu cuenta configuraremos tu ciclo en
        el Dia 1. Podras ajustarlo desde el dashboard cuando lo necesites.
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
            Creando cuenta...
          </>
        ) : (
          "Registrarme gratis"
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
    </motion.form>
  );
}
