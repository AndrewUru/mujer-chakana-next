"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import AvatarUploader from "@/components/AvatarUploader";
import "@/app/globals.css";

export default function PerfilPage() {
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
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

    fetchData();
  }, [router]);

  const handleSave = async () => {
    const { error } = await supabase
      .from("perfiles")
      .update({
        display_name: username,
        avatar_url: avatarUrl,
        fecha_inicio: new Date(), // solo si la estás estableciendo aquí
      })
      .eq("user_id", userId);

    if (error) {
      alert("❌ Error al guardar: " + error.message);
    } else {
      alert("✅ Perfil actualizado");
      router.push("/dashboard"); // 👈 Redirige después de guardar
    }
  };

  if (loading) return <p className="text-center mt-10">Cargando perfil...</p>;

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded shadow text-pink-900">
      <h1 className="text-2xl font-bold text-center mb-4">Editar perfil</h1>

      <label className="block text-sm font-medium mb-1">
        Nombre o seudónimo
      </label>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full border border-pink-300 p-2 rounded mb-4"
      />

      <label className="block text-sm font-medium mb-1">
        Tu imagen de perfil
      </label>
      <AvatarUploader userId={userId} onUpload={(url) => setAvatarUrl(url)} />

      {avatarUrl && (
        <img
          src={avatarUrl}
          alt="Avatar"
          className="mt-4 rounded-full w-24 h-24 object-cover mx-auto border-2 border-pink-500"
        />
      )}

      <button
        onClick={handleSave}
        className="mt-6 w-full bg-pink-700 text-white py-2 rounded hover:bg-pink-800 transition"
      >
        Guardar cambios
      </button>
    </div>
  );
}
