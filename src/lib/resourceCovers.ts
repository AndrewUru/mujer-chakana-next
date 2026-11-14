import { supabase } from "@/lib/supabaseClient";
import { validateArchetypeImage } from "@/lib/archetypeImages";

// Bucket y permisos: supabase/migrations/202611140002_resource_covers.sql
export const RESOURCE_COVER_BUCKET = "recursos-portadas";
const extensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/** Sube la portada y devuelve su URL pública para guardarla en recursos.imagen_url. */
export async function uploadResourceCover(file: File): Promise<string> {
  const validationError = validateArchetypeImage(file);
  if (validationError) throw new Error(validationError);

  // Ruta única: evita imágenes cacheadas y nunca pisa la portada de otro recurso.
  const path = `${crypto.randomUUID()}.${extensions[file.type]}`;
  const { error } = await supabase.storage.from(RESOURCE_COVER_BUCKET).upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type,
    upsert: false,
  });
  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes("bucket") && message.includes("not found")) {
      throw new Error("Falta configurar el almacenamiento de portadas en Supabase.");
    }
    if (message.includes("row-level security") || message.includes("unauthorized") || message.includes("permission")) {
      throw new Error("No tienes permiso para subir imágenes. Comprueba tu sesión de administradora.");
    }
    throw new Error("No se pudo subir la portada. Comprueba tu conexión y vuelve a guardar.");
  }
  return supabase.storage.from(RESOURCE_COVER_BUCKET).getPublicUrl(path).data.publicUrl;
}
