"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface AvatarUploaderProps {
  userId: string;
  onUpload: (url: string) => void;
}

export default function AvatarUploader({
  userId,
  onUpload,
}: AvatarUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    const fileExt = file.name.split(".").pop();
    const filePath = `${userId}/${userId}.${fileExt}`;

    setUploading(true);
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    setUploading(false);

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
      {uploading && (
        <p className="text-pink-600 text-sm mt-2">Subiendo imagen...</p>
      )}
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
