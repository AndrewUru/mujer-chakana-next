import { supabase } from "@/lib/supabaseClient";
import { validateArchetypeResource } from "@/lib/archetypeResources";

// Bucket y permisos: supabase/migrations/202611150003_resource_files.sql
export const RESOURCE_FILE_BUCKET = "recursos-archivos";

/** Sube el PDF de un recurso y devuelve su URL pública para guardarla en recursos.url. */
export async function uploadResourcePdf(file: File): Promise<string> {
  const problem = validateArchetypeResource(file, "pdf");
  if (problem) throw new Error(problem);

  // Ruta única: nunca pisa el archivo de otro recurso.
  const path = `${crypto.randomUUID()}.pdf`;
  const { error } = await supabase.storage.from(RESOURCE_FILE_BUCKET).upload(path, file, {
    cacheControl: "31536000",
    contentType: "application/pdf",
    upsert: false,
  });
  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes("bucket") && message.includes("not found")) {
      throw new Error("Falta configurar el almacenamiento de PDF en Supabase (migración 202611150003_resource_files.sql).");
    }
    if (/row-level security|unauthorized|permission/.test(message)) {
      throw new Error("No tienes permiso para subir archivos. Comprueba tu sesión de administradora.");
    }
    throw new Error("No se pudo subir el PDF. Comprueba tu conexión y vuelve a guardar.");
  }
  return supabase.storage.from(RESOURCE_FILE_BUCKET).getPublicUrl(path).data.publicUrl;
}
