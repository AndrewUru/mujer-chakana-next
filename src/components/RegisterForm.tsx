"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import AvatarUploader from "./AvatarUploader";
import { Loader2 } from "lucide-react";
import { AlertCircle } from "lucide-react";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [userId, setUserId] = useState("");
  const [inicioCiclo, setInicioCiclo] = useState(""); // NUEVO CAMPO
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje("");

    if (!inicioCiclo) {
      setMensaje("❌ Debes indicar tu fecha de inicio de ciclo.");
      return;
    }

    const hoy = new Date();
    const fechaCiclo = new Date(inicioCiclo);

    if (fechaCiclo > hoy) {
      setMensaje("❌ La fecha de inicio de ciclo no puede ser futura.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMensaje("❌ Error: " + error.message);
      setLoading(false);
      return;
    }

    const user = data.user;
    if (user) {
      setUserId(user.id);

      const { error: insertError } = await supabase.from("perfiles").insert([
        {
          id: user.id,
          user_id: user.id,
          display_name: username,
          avatar_url: avatarUrl,
          perfil_completo: false,
          inicio_ciclo: inicioCiclo, // Guardar fecha de inicio del ciclo
        },
      ]);

      if (insertError) {
        setMensaje("❌ Error al crear el perfil: " + insertError.message);
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    }

    setLoading(false);
  };

  const handleSocialLogin = async (
    provider: "google" | "github" | "facebook"
  ) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
    });

    if (error) {
      setMensaje("❌ Error al conectar con " + provider + ": " + error.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-60px)] flex justify-center items-center overflow-hidden">
      <div className="w-full max-w-md min-h-screen overflow-y-auto px-4 pb-32 ">
        <form
          onSubmit={handleRegister}
          className="flex flex-col gap-3 bg-white p-8 rounded-2xl shadow-md border border-pink-100"
        >
          <h1 className="text-3xl font-bold text-center text-pink-800">
            🌺 Crear cuenta
          </h1>
          <p className="text-center text-sm text-pink-600">
            Únete al camino del ciclo y la transformación.
          </p>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => handleSocialLogin("google")}
              className="bg-white text-pink-800 border border-pink-300 py-2 rounded-lg font-semibold hover:bg-pink-50 transition flex items-center justify-center gap-2"
            >
              <Image
                src="/google-icon.svg"
                width={20}
                height={20}
                alt="Google"
              />
              Continuar con Google
            </button>
          </div>
          <div className="flex items-center my-1">
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
          <label className="text-sm text-pink-700 mt-2">
            🩸 Fecha de comienzo de tu ciclo (obligatorio)
          </label>
          <input
            type="date"
            value={inicioCiclo}
            onChange={(e) => setInicioCiclo(e.target.value)}
            className="border border-pink-300 p-3 rounded-lg placeholder-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200 transition"
            required
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
                  className="mt-2 rounded-full border-2 border-pink-500 object-cover"
                />
              )}
            </div>
          )}
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
    </div>
  );
}
