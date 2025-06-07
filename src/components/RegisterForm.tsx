"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import AvatarUploader from "./AvatarUploader";
import { Loader2, AlertCircle } from "lucide-react";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [userId, setUserId] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [tipoPlan] = useState("gratuito");

  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje("");
    setLoading(true);

    const {
      data: { user },
      error,
    } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMensaje("❌ Error: " + error.message);
      setLoading(false);
      return;
    }

    if (user) {
      setUserId(user.id);

      const { error: insertError } = await supabase.from("perfiles").insert([
        {
          id: user.id,
          user_id: user.id,
          display_name: username,
          avatar_url: avatarUrl,
          perfil_completo: false,
          tipo_plan: tipoPlan,
          activo: true, // <-- si lo necesitas explícitamente
        },
      ]);

      if (insertError) {
        setMensaje("❌ Error al crear el perfil: " + insertError.message);
        setLoading(false);
        return;
      }

      // 📿 Inserción automática del día 1 del ciclo
      const today = new Date().toISOString().split("T")[0];
      const arquetipoInicial = "La Visionaria";
      const descripcionInicial =
        "En su cueva interior, La Visionaria recibe imágenes, sueños y revelaciones. Día para descansar y visionar el ciclo que comienza.";

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
        console.error(
          "❌ Error al asignar día 1 del ciclo:",
          cicloError.message
        );
      }

      if (tipoPlan === "gratuito") {
        router.push("/dashboard");
      } else {
        router.push("/suscripcion");
      }
    }

    setLoading(false);
  };

  const handleSocialLogin = async (
    provider: "google" | "github" | "facebook"
  ) => {
    const { error } = await supabase.auth.signInWithOAuth({ provider });
    if (error) {
      setMensaje("❌ Error con " + provider + ": " + error.message);
    }
  };

  return (
    <div className="w-full max-w-md">
      <form
        onSubmit={handleRegister}
        className="flex flex-col gap-4 bg-white p-3 sm:p-4 rounded-2xl shadow-xl border border-rose-200"
      >
        <h1 className="text-3xl font-bold text-center text-pink-800">
          🌺 Crear cuenta
        </h1>

        <button
          type="button"
          onClick={() => handleSocialLogin("google")}
          className="bg-white text-pink-800 border border-pink-300 py-2 rounded-lg font-semibold hover:bg-pink-50 transition flex items-center justify-center gap-2"
        >
          <Image src="/google-icon.svg" width={20} height={20} alt="Google" />
          Continuar con Google
        </button>

        <div className="flex items-center my-2">
          <hr className="flex-grow border-pink-200" />
          <span className="px-3 text-pink-400 text-sm">o</span>
          <hr className="flex-grow border-pink-200" />
        </div>

        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-pink-300 p-3 rounded-lg placeholder-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200 transition"
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-pink-300 p-3 rounded-lg placeholder-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200 transition"
          required
        />
        <input
          type="text"
          placeholder="Nombre de usuaria"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border border-pink-300 p-3 rounded-lg placeholder-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200 transition"
        />

        {userId && (
          <div>
            <label className="text-sm font-medium text-pink-700">
              🌸 Tu imagen de perfil
            </label>
            <AvatarUploader
              userId={userId}
              onUpload={(url) => setAvatarUrl(url)}
            />
            {avatarUrl && (
              <Image
                src={avatarUrl}
                alt="Avatar preview"
                width={80}
                height={80}
                className="mt-1 rounded-full border-2 border-pink-500 object-cover"
              />
            )}
          </div>
        )}

        {/* ⚠️ Advertencia sobre inicio automático del ciclo */}
        <div className="bg-yellow-100 border-l-4 border-yellow-400 text-yellow-800 p-4 text-sm rounded-xl shadow-sm">
          🔔 <strong>Importante:</strong> Al crear tu cuenta, el sistema
          iniciará tu ciclo en el <strong>Día 1</strong> automáticamente. Podrás
          modificarlo más adelante si lo necesitas.
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-pink-700 text-white py-3 rounded-lg font-semibold flex justify-center items-center gap-2 hover:bg-pink-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin h-5 w-5" /> Creando cuenta...
            </>
          ) : (
            "Registrarse con email"
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
