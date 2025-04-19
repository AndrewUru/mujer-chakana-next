"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import AvatarUploader from "./AvatarUploader";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [userId, setUserId] = useState("");
  const [mensaje, setMensaje] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMensaje("❌ Error: " + error.message);
      return;
    }

    const user = data.user;
    if (user) {
      setUserId(user.id);

      const { error: insertError } = await supabase.from("perfiles").insert([
        {
          id: user.id, // 👈 esta línea soluciona el error
          user_id: user.id,
          display_name: username,
          avatar_url: avatarUrl,
          perfil_completo: false, // 👈 muy importante
        },
      ]);

      if (insertError) {
        setMensaje("❌ Error al crear el perfil: " + insertError.message);
        return;
      }

      // Redirigimos a setup para que termine de completar
      router.push("/setup");
    }
  };

  return (
    <form
      onSubmit={handleRegister}
      className="flex flex-col gap-4 max-w-md mx-auto mt-10 bg-white p-6 rounded shadow"
    >
      <h1 className="text-2xl font-bold text-center text-pink-800">
        Crear cuenta
      </h1>

      <input
        type="email"
        placeholder="Correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border border-pink-300 p-2 rounded placeholder-pink-500"
        required
      />

      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border border-pink-300 p-2 rounded placeholder-pink-500"
        required
      />

      <input
        type="text"
        placeholder="Nombre de usuaria"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="border border-pink-300 p-2 rounded placeholder-pink-500"
      />

      {userId && (
        <div className="mt-2">
          <label className="text-sm font-medium">Tu imagen de perfil</label>
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
              className="mt-2 rounded-full object-cover border-2 border-pink-500 placeholder-pink-500"
            />
          )}
        </div>
      )}

      <button
        type="submit"
        className="bg-pink-700 text-white p-2 rounded hover:bg-pink-800 transition"
      >
        Registrarse
      </button>

      {mensaje && <p className="text-sm text-red-600">{mensaje}</p>}
    </form>
  );
}
