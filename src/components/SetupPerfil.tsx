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
      alert("🌙 Por favor selecciona la fecha de inicio de tu ciclo.");
      return;
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Elimina la hora

    const fechaSeleccionada = new Date(fechaInicio);
    fechaSeleccionada.setHours(0, 0, 0, 0); // También sin hora

    if (fechaSeleccionada > hoy) {
      alert(
        "🚫 No puedes seleccionar una fecha futura. Por favor elige un día anterior o el actual."
      );
      return;
    }

    if (!avatarUrl) {
      const confirmar = confirm(
        "⚠️ No subiste una imagen de perfil. ¿Deseas continuar sin ella?"
      );
      if (!confirmar) return;
    }

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
      alert("🌺 Perfil y ciclo guardados. Bienvenida al viaje lunar.");
      router.push("/dashboard");
    }
  };

  if (loading)
    return (
      <p className="text-center mt-10 text-pink-600">
        Cargando tu perfil sagrado...
      </p>
    );

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-pink-100 text-pink-900  mx-auto mt-10 relative overflow-hidden">
      <div className="relative z-10">
        <label className="block text-sm font-semibold mb-1">
          🌸 Tu nombre o seudónimo
        </label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border border-pink-300 p-2 rounded-xl mb-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
        />

        <label className="block text-sm font-semibold mb-1">🌕 Tu imagen</label>
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

        <label className="block text-sm font-semibold mt-6 mb-1">
          🩸 ¿Cuándo comenzó tu último ciclo?
        </label>
        <input
          type="date"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
          className="w-full border border-pink-300 p-2 rounded-xl shadow-sm"
        />
        <p className="text-xs text-pink-500 mt-1 mb-6">
          ✨ Puedes corregir esta fecha más adelante si lo necesitas.
        </p>

        <button
          onClick={handleSave}
          disabled={isUploading}
          className={`w-full py-3 rounded-xl font-semibold transition shadow-md ${
            isUploading
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:scale-105"
          }`}
        >
          {isUploading ? "Subiendo imagen..." : "Guardar y continuar 🌺"}
        </button>
      </div>
    </div>
  );
}
