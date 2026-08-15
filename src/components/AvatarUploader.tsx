"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ImagePlus, Loader2 } from "lucide-react";

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const extensionByMimeType: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

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
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    setFileName(file.name);

    if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
      setError("Usa una imagen JPG, PNG o WebP.");
      setFileName("");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setError("La imagen debe pesar menos de 2 MB.");
      setFileName("");
      e.target.value = "";
      return;
    }

    const fileExt = extensionByMimeType[file.type];
    const filePath = `${userId}/avatar.${fileExt}`;

    setUploading(true);
    setIsUploading?.(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || user.id !== userId) {
        setError("Tu sesión ha caducado. Inicia sesión de nuevo para subir la imagen.");
        return;
      }

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
          contentType: file.type,
          upsert: true,
        });

      if (uploadError) {
        console.error("Error al subir imagen:", uploadError.message);
        const isPolicyError = uploadError.message
          .toLocaleLowerCase("en")
          .includes("row-level security");

        setError(
          isPolicyError
            ? "No tienes permiso para subir la imagen. Vuelve a iniciar sesión y reinténtalo."
            : `No pudimos subir la imagen: ${uploadError.message}`
        );
        return;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      if (data.publicUrl) {
        onUpload(`${data.publicUrl}?v=${Date.now()}`);
      }
    } catch (uploadError) {
      console.error("Error inesperado al subir imagen:", uploadError);
      setError("Ocurrió un problema al subir la imagen. Inténtalo de nuevo.");
    } finally {
      setUploading(false);
      setIsUploading?.(false);
    }
  };

  return (
    <div className="text-left">
      <label
        htmlFor="avatar-upload"
        className="app-focus-ring flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-rose-300 bg-rose-50/70 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:border-rose-400 hover:bg-rose-100/70"
      >
        {uploading ? (
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        ) : (
          <ImagePlus className="h-5 w-5" aria-hidden="true" />
        )}
        {uploading ? "Subiendo imagen..." : "Elegir una imagen"}
      </label>
      <input
        id="avatar-upload"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="sr-only"
        disabled={uploading}
        aria-describedby={error ? "avatar-help avatar-error" : "avatar-help"}
      />
      <div className="mt-2 flex items-start justify-between gap-3 text-xs">
        <p id="avatar-help" className="text-rose-600/70">
          JPG, PNG o WebP · máximo 2 MB
        </p>
        {fileName ? (
          <p className="max-w-[55%] truncate font-medium text-rose-700" title={fileName}>
            {fileName}
          </p>
        ) : null}
      </div>
      {error ? (
        <p
          id="avatar-error"
          className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
