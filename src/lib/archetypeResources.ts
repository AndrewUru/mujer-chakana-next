import { supabase } from "@/lib/supabaseClient";

export type ResourceKind = "audio" | "pdf";
export const RESOURCE_BUCKET = "arquetipo-recursos";
const audioTypes: Record<string, string> = {
  "audio/mpeg": "mp3", "audio/mp3": "mp3", "audio/mp4": "m4a",
  "audio/x-m4a": "m4a", "audio/wav": "wav", "audio/x-wav": "wav",
  "audio/ogg": "ogg", "audio/aac": "aac", "audio/webm": "webm",
};
export const resourceOptions = {
  audio: { label: "Audio", accept: Object.keys(audioTypes).join(","), maxMB: 50, formats: "MP3, M4A, WAV, OGG, AAC o WebM" },
  pdf: { label: "Ritual PDF", accept: "application/pdf", maxMB: 20, formats: "PDF" },
};

export function validateArchetypeResource(file: File, kind: ResourceKind): string | null {
  const options = resourceOptions[kind];
  if (kind === "pdf" ? file.type !== "application/pdf" : !audioTypes[file.type]) return `Elige un archivo ${options.formats}.`;
  if (!file.size) return "El archivo está vacío. Elige otro archivo.";
  if (file.size > options.maxMB * 1024 * 1024) return `El archivo no puede superar los ${options.maxMB} MB.`;
  return null;
}

export async function uploadArchetypeResource(id: string, file: File, kind: ResourceKind): Promise<string> {
  const problem = validateArchetypeResource(file, kind);
  if (problem) throw new Error(problem);
  if (!/^\d+$/.test(id)) throw new Error("No se ha identificado el arquetipo.");
  const extension = kind === "pdf" ? "pdf" : audioTypes[file.type];
  const path = `${id}/${kind}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(RESOURCE_BUCKET).upload(path, file, {
    contentType: file.type, upsert: false, cacheControl: "31536000",
  });
  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes("bucket") && message.includes("not found")) throw new Error("Falta configurar el almacenamiento de audios y PDF en Supabase.");
    if (/row-level security|unauthorized|permission/.test(message)) throw new Error("No tienes permiso para subir archivos. Comprueba tu sesión de administradora.");
    throw new Error(`No se pudo subir ${kind === "audio" ? "el audio" : "el PDF"}. Comprueba tu conexión y vuelve a guardar.`);
  }
  return supabase.storage.from(RESOURCE_BUCKET).getPublicUrl(path).data.publicUrl;
}
