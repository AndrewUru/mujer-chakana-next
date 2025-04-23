"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface AvatarUploaderProps {
  userId: string;
  onUpload: (url: string) => void;
  setIsUploading?: (uploading: boolean) => void; // ✅ Ahora es una prop opcional
}

export default function AvatarUploader({
  userId,
  onUpload,
  setIsUploading,
}: AvatarUploaderProps) {
  const [error, setError] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("La imagen debe ser menor a 2MB");
      return;
    }

    const fileExt = file.name.split(".").pop();
    const filePath = `${userId}/avatar.${fileExt}`;

    setIsUploading?.(true);

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    setIsUploading?.(false);

    if (uploadError) {
      console.error("❌ Error al subir imagen:", uploadError.message);
      setError(`Error: ${uploadError.message}`);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    if (data?.publicUrl) {
      onUpload(data.publicUrl);
    }
  };

  return (
    <div className="text-center">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="w-full border border-dashed border-pink-300 p-2 rounded bg-pink-50 text-sm"
      />
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
