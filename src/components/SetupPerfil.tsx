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
  const [isUploading, setIsUploading] = useState(false);
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
        setFechaInicio(perfil.fecha_inicio || "");
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

    if (isUploading) {
      alert("⏳ La imagen aún se está subiendo. Por favor espera.");
      return;
    }

    if (!avatarUrl) {
      const confirmar = confirm(
        "⚠️ No subiste una imagen de perfil. ¿Quieres continuar sin ella?"
      );
      if (!confirmar) return;
    }

    console.log("🖼 Guardando con avatar:", avatarUrl);

    const { data: cicloExistente } = await supabase

      .from("ciclos")
      .select("*")
      .eq("usuario_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    let cicloId;

    if (cicloExistente) {
      const { error: errorUpdateCiclo } = await supabase
        .from("ciclos")
        .update({ fecha_inicio: fechaInicio })
        .eq("id", cicloExistente.id);

      if (errorUpdateCiclo) {
        alert("❌ Error al actualizar el ciclo: " + errorUpdateCiclo.message);
        return;
      }

      cicloId = cicloExistente.id;
    } else {
      const { data: cicloNuevo, error: errorCicloNuevo } = await supabase
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

      if (errorCicloNuevo) {
        alert("❌ Error al crear ciclo: " + errorCicloNuevo.message);
        return;
      }

      cicloId = cicloNuevo.id;
    }

    const { error: errorPerfil } = await supabase
      .from("perfiles")
      .update({
        display_name: username,
        avatar_url: avatarUrl,
        fecha_inicio: fechaInicio,
        ciclo_actual: cicloId,
        perfil_completo: true,
      })
      .eq("user_id", userId);

    if (errorPerfil) {
      alert("❌ Error al guardar perfil: " + errorPerfil.message);
    } else {
      alert("✅ Perfil y ciclo actualizados con éxito.");
      router.push("/dashboard");
    }
  };

  if (loading) return <p className="text-center mt-10">Cargando perfil...</p>;

  return (
    <div className="bg-white p-6 rounded shadow text-pink-900 max-w-md mx-auto mt-10">
      <label className="block text-sm font-medium mb-1">
        Tu nombre o seudónimo
      </label>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full border border-pink-300 p-2 rounded mb-4"
      />

      <label className="block text-sm font-medium mb-1">Tu imagen</label>
      <AvatarUploader
        userId={userId}
        onUpload={(url) => setAvatarUrl(url)}
        setIsUploading={setIsUploading}
      />

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
        className="w-full border border-pink-300 p-2 rounded mb-2"
      />
      <p className="text-xs text-pink-500 mb-6">
        ✨ Puedes corregir esta fecha más adelante si es necesario.
      </p>

      <button
        onClick={handleSave}
        disabled={isUploading}
        className={`w-full py-2 rounded transition ${
          isUploading
            ? "bg-gray-400 text-white cursor-not-allowed"
            : "bg-pink-700 text-white hover:bg-pink-800"
        }`}
      >
        {isUploading ? "Subiendo imagen..." : "Guardar y continuar 🌸"}
      </button>
    </div>
  );
}
