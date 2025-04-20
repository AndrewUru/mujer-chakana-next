"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import AvatarUploader from "./AvatarUploader";
import { Loader2 } from "lucide-react";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [userId, setUserId] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje("");
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
        },
      ]);

      if (insertError) {
        setMensaje("❌ Error al crear el perfil: " + insertError.message);
        setLoading(false);
        return;
      }

      // 💫 Redirige al Setup para completar el ciclo
      router.push("/dashboard");
    }

    setLoading(false);
  };

  return (
    <form
      onSubmit={handleRegister}
      className="flex flex-col gap-5 max-w-md mx-auto mt-10 bg-white p-8 rounded-2xl shadow-md border border-pink-100"
    >
      <h1 className="text-3xl font-bold text-center text-pink-800">
        🌺 Crear cuenta
      </h1>

      <p className="text-center text-sm text-pink-600">
        Únete al camino del ciclo y la transformación.
      </p>

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
          "Registrarse"
        )}
      </button>

      {mensaje && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm">
          {mensaje}
        </div>
      )}
    </form>
  );
}
