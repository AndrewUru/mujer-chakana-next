import "server-only";
import { cache } from "react";
import { createClient } from "@supabase/supabase-js";

export interface PublicResource {
  id: string;
  tipo: string;
  titulo: string;
  descripcion: string;
  tipo_suscripcion: "gratuito" | "mensual" | "anual" | ("gratuito" | "mensual" | "anual")[];
  imagen_url?: string;
  fase?: string;
  arquetipo?: string;
  elemento?: string;
}

function publicClient() {
  // Only publish records already readable anonymously under the existing RLS policies.
  // Never use a service-role key or serialize paid file URLs into the public HTML.
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
  });
}

export const isResourceId = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

function publicFields(row: PublicResource): PublicResource {
  // Optional descriptive columns vary across installations. Query the existing row,
  // then explicitly whitelist the fields allowed across the server/client boundary.
  const { id, tipo, titulo, descripcion, tipo_suscripcion, imagen_url, fase, arquetipo, elemento } = row;
  return { id, tipo, titulo, descripcion, tipo_suscripcion, imagen_url, fase, arquetipo, elemento };
}

export const getPublicResource = cache(async (id: string): Promise<PublicResource | null> => {
  const { data, error } = await publicClient().from("recursos")
    .select("*")
    .eq("id", id).eq("activo", true).abortSignal(AbortSignal.timeout(10000)).maybeSingle();
  if (error) throw new Error("No se pudo consultar la información pública del recurso.");
  return data ? publicFields(data as PublicResource) : null;
});

export const getPublicResources = cache(async (): Promise<PublicResource[]> => {
  const client = publicClient();
  const resources: PublicResource[] = [];
  const batchSize = 500;
  for (let offset = 0; ; offset += batchSize) {
    const { data, error } = await client.from("recursos")
      .select("*").eq("activo", true)
      .order("creado_en", { ascending: false }).order("id").range(offset, offset + batchSize - 1).abortSignal(AbortSignal.timeout(10000));
    if (error) throw new Error("No se pudo consultar la biblioteca pública.");
    resources.push(...((data ?? []) as PublicResource[]).map(publicFields));
    if (!data || data.length < batchSize) break;
  }
  return resources;
});
