"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import AvatarUploader from "./AvatarUploader";

export default function SetupPerfil() {
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        router.push("/login");
        return;
      }

      setUserId(user.id);

      const { data: perfil } = await supabase
        .from("perfiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (perfil) {
        setUsername(perfil.display_name || perfil.username || "");
        setAvatarUrl(perfil.avatar_url || "");
      }

      setLoading(false);
    };

    fetchUser();
  }, [router]);

  const handleSave = async () => {
    const { error } = await supabase
      .from("perfiles")
      .update({
        display_name: username,
        avatar_url: avatarUrl,
        perfil_completo: true, // 👈 marcamos como completo
      })
      .eq("user_id", userId);

    if (error) {
      alert("❌ Error al guardar: " + error.message);
    } else {
      alert("✅ Perfil completado");
      router.push("/dashboard"); // Redirige al inicio del ciclo
    }
  };

  if (loading) return <p className="text-center mt-10">Cargando perfil...</p>;

  return (
    <div className="bg-white p-6 rounded shadow text-pink-900">
      <h2 className="text-xl font-semibold text-center mb-4">
        Completá tu perfil
      </h2>

      <label className="block text-sm font-medium mb-1">
        Tu nombre o seudónimo
      </label>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full border border-pink-300 p-2 rounded mb-4"
      />

      <div>
        <label className="block text-sm font-medium mb-1">
          Tu imagen de perfil
        </label>
        <AvatarUploader userId={userId} onUpload={(url) => setAvatarUrl(url)} />

        <Image
          src={avatarUrl}
          alt="Avatar"
          width={96}
          height={96}
          className="mt-4 rounded-full object-cover mx-auto border-2 border-pink-500"
        />

        <button
          onClick={handleSave}
          className="mt-6 w-full bg-pink-700 text-white py-2 rounded hover:bg-pink-800 transition"
        >
          Guardar y continuar
        </button>
      </div>
    </div>
  );
}
