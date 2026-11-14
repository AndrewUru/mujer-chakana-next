// Límite de uso respaldado por Postgres (funciona entre instancias serverless).
import "server-only";
import { createHash } from "node:crypto";
import { serviceClient } from "@/lib/supabaseAdmin";

interface Limit {
  /** Usos permitidos por ventana. */
  limit: number;
  windowSeconds: number;
}

/**
 * Suma un uso a `key` y devuelve false si ya superó el límite.
 * Si el contador no está disponible deja pasar: una avería del límite no debe
 * tumbar la función que protege.
 */
export async function allowRequest(key: string, { limit, windowSeconds }: Limit): Promise<boolean> {
  try {
    const { data, error } = await serviceClient().rpc("consume_rate_limit", {
      p_key: key,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    });
    if (error) throw error;
    return data !== false;
  } catch (error) {
    console.error("Rate limit no disponible:", error);
    return true;
  }
}

/** Clave anónima por visitante: la IP nunca se guarda en claro. */
export function clientKey(request: Request): string {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "desconocida";
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

export function tooManyRequests(message: string) {
  return Response.json({ error: message }, { status: 429, headers: { "Cache-Control": "no-store" } });
}
