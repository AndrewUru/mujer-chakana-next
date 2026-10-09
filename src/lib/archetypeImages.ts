import { supabase } from "@/lib/supabaseClient";

export const ARCHETYPE_IMAGE_BUCKET = "arquetipos";
export const MAX_ARCHETYPE_IMAGE_SIZE = 5 * 1024 * 1024;
const extensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function validateArchetypeImage(file: File): string | null {
  if (!extensions[file.type]) return "Elige una imagen JPG, PNG o WebP.";
  if (file.size === 0) return "El archivo está vacío. Elige otra imagen.";
  if (file.size > MAX_ARCHETYPE_IMAGE_SIZE) return "La imagen no puede superar los 5 MB.";
  return null;
}

export async function uploadArchetypeImage(archetypeId: string, file: File): Promise<string> {
  const validationError = validateArchetypeImage(file);
  if (validationError) throw new Error(validationError);
  if (!/^\d+$/.test(archetypeId)) throw new Error("No se ha identificado el arquetipo.");

  // A unique path avoids cached images and never overwrites the current artwork.
  const path = `${archetypeId}/${crypto.randomUUID()}.${extensions[file.type]}`;
  const { error } = await supabase.storage.from(ARCHETYPE_IMAGE_BUCKET).upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type,
    upsert: false,
  });
  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes("bucket") && message.includes("not found")) {
      throw new Error("Falta configurar el almacenamiento de arquetipos en Supabase.");
    }
    if (message.includes("row-level security") || message.includes("unauthorized") || message.includes("permission")) {
      throw new Error("No tienes permiso para subir imágenes. Comprueba tu sesión de administradora.");
    }
    throw new Error("No se pudo subir la imagen. Comprueba tu conexión y vuelve a guardar.");
  }
  return supabase.storage.from(ARCHETYPE_IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}
