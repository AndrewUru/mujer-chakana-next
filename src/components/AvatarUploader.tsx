"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AvatarUploader({
  userId,
  onUpload,
}: {
  userId: string;
  onUpload: (url: string) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    setError(""); // limpiar errores anteriores

    if (!userId) {
      setError("No se ha cargado el usuario aún.");
      return;
    }

    const file = e.dataTransfer.files[0];
    if (!file) return;

    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    setUploading(true);
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("❌ Error al subir imagen:", uploadError.message);
      setError(`Error: ${uploadError.message}`);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    if (data?.publicUrl) {
      onUpload(data.publicUrl);
    }

    setUploading(false);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded p-6 text-center cursor-pointer ${
        dragging ? "border-pink-700 bg-pink-100" : "border-pink-300"
      }`}
    >
      {uploading ? "Subiendo..." : "Arrastrá y soltá tu imagen de perfil aquí"}
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
