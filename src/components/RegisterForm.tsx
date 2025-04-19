"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import Image from "next/image";
import AvatarUploader from "./AvatarUploader";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [userId, setUserId] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword || !username) {
      alert("⚠️ Por favor completá todos los campos.");
      return;
    }

    if (password.length < 6) {
      alert("⚠️ La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      alert("❌ Las contraseñas no coinciden.");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert("❌ Error al registrarse: " + error.message);
      return;
    }

    const user = data.user;
    if (user) {
      setUserId(user.id);

      await supabase.from("perfiles").insert([
        {
          user_id: user.id,
          username,
          display_name: username,
          avatar_url: avatarUrl,
        },
      ]);

      alert("✅ Registro exitoso. Revisa tu correo para confirmar tu cuenta.");
      router.push("/dashboard");
    }
  };

  return (
    <form
      onSubmit={handleRegister}
      className="flex flex-col gap-4 max-w-md mx-auto mt-10 bg-white p-6 rounded shadow"
    >
      <h1 className="text-2xl font-bold text-center text-pink-900">
        Crear cuenta
      </h1>

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
        type="password"
        placeholder="Repetir contraseña"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="border border-pink-300 p-2 rounded"
        required
      />

      <input
        type="text"
        placeholder="Nombre de usuaria"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="border border-pink-300 p-2 rounded"
        required
      />

      {userId && (
        <div className="mt-2">
          <label className="text-sm font-medium text-pink-800">
            Tu imagen de perfil
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
              className="mt-2 rounded-full object-cover border-2 border-pink-500"
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
    </form>
  );
}
