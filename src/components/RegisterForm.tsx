"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import AvatarUploader from "./AvatarUploader";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [userId, setUserId] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert("Error: " + error.message);
      return;
    }

    const user = data.user;
    if (user) {
      setUserId(user.id); // 👈 para usar en el uploader

      await supabase.from("perfiles").insert([
        {
          user_id: user.id,
          username,
          display_name: username,
          avatar_url: avatarUrl,
        },
      ]);

      router.push("/dashboard");
    }
  };

  return (
    <form
      onSubmit={handleRegister}
      className="flex flex-col gap-4 max-w-md mx-auto mt-10"
    >
      <h1 className="text-2xl font-bold text-center">Crear cuenta</h1>

      <input
        type="email"
        placeholder="Correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border border-pink-300 p-2 rounded"
        required
      />

      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border border-pink-300 p-2 rounded"
        required
      />

      <input
        type="text"
        placeholder="Nombre de usuaria"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="border border-pink-300 p-2 rounded"
      />

      {/* AvatarUploader se muestra cuando ya se creó el usuario (para tener el userId) */}
      {userId && (
        <div className="mt-2">
          <label className="text-sm font-medium">Tu imagen de perfil</label>
          <AvatarUploader
            userId={userId}
            onUpload={(url) => setAvatarUrl(url)}
          />
          {avatarUrl && (
            <img
              src={avatarUrl}
              alt="Avatar preview"
              className="mt-2 rounded-full w-20 h-20 object-cover border-2 border-pink-500"
            />
          )}
        </div>
      )}

      {/* Si no vas a usar input URL, puedes quitar esto */}
      {/* <input
        type="text"
        placeholder="URL del avatar"
        value={avatarUrl}
        onChange={(e) => setAvatarUrl(e.target.value)}
        className="border border-pink-300 p-2 rounded"
      /> */}

      <button
        type="submit"
        className="bg-pink-700 text-white p-2 rounded hover:bg-pink-800 transition"
      >
        Registrarse
      </button>
    </form>
  );
}
