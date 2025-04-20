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
  const [fechaInicio, setFechaInicio] = useState("");
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
        setUsername(perfil.display_name || "");
        setAvatarUrl(perfil.avatar_url || "");
      }

      setLoading(false);
    };

    fetchUser();
  }, [router]);

  const handleSave = async () => {
    if (!fechaInicio) {
      alert("⛔️ Por favor selecciona la fecha de inicio de tu ciclo.");
      return;
    }

    // 1. Crear ciclo nuevo
    const { data: cicloNuevo, error: cicloError } = await supabase
      .from("ciclos")
      .insert({
        usuario_id: userId,
        fecha_inicio: fechaInicio,
        duracion: 28,
        fase_actual: "agua",
        notas_generales: "Inicio del ciclo desde SetupPerfil",
      })
      .select()
      .single();

    if (cicloError) {
      alert("❌ Error al crear ciclo: " + cicloError.message);
      return;
    }

    // 2. Actualizar perfil con datos + ciclo_id
    const { error: perfilError } = await supabase
      .from("perfiles")
      .update({
        display_name: username,
        avatar_url: avatarUrl,
        fecha_inicio: fechaInicio,
        ciclo_actual: cicloNuevo.id,
        perfil_completo: true,
      })
      .eq("user_id", userId);

    if (perfilError) {
      alert("❌ Error al guardar perfil: " + perfilError.message);
    } else {
      alert("✅ Perfil y ciclo creados con éxito.");
      router.push("/dashboard");
    }
  };

  if (loading) return <p className="text-center mt-10">Cargando perfil...</p>;

  return (
    <div className="bg-white p-6 rounded shadow text-pink-900 max-w-md mx-auto mt-10">
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

      <label className="block text-sm font-medium mb-1">Tu imagen</label>
      <AvatarUploader userId={userId} onUpload={(url) => setAvatarUrl(url)} />

      {avatarUrl && (
        <Image
          src={avatarUrl}
          alt="Avatar"
          width={96}
          height={96}
          className="mt-4 rounded-full object-cover mx-auto border-2 border-pink-500"
        />
      )}

      <label className="block text-sm font-medium mt-6 mb-1">
        ¿Cuándo comenzó tu último ciclo?
      </label>
      <input
        type="date"
        value={fechaInicio}
        onChange={(e) => setFechaInicio(e.target.value)}
        className="w-full border border-pink-300 p-2 rounded mb-6"
      />

      <button
        onClick={handleSave}
        className="w-full bg-pink-700 text-white py-2 rounded hover:bg-pink-800 transition"
      >
        Guardar y comenzar 🌸
      </button>
    </div>
  );
}
