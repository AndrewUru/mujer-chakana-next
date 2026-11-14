// Solo para código de servidor (rutas /api). Usa la clave service_role, que
// salta RLS: nunca importes este archivo desde un componente cliente.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export class AdminAuthError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

function serviceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new AdminAuthError(
      "La gestión de usuarias no está configurada: falta SUPABASE_SERVICE_ROLE_KEY en el servidor.",
      503,
    );
  }
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

/** Valida el token de quien llama y exige rol admin. Devuelve el cliente con privilegios. */
export async function requireAdmin(request: Request) {
  const token = request.headers.get("authorization")?.match(/^Bearer (.+)$/i)?.[1];
  if (!token) throw new AdminAuthError("Inicia sesión para continuar.", 401);

  const admin = serviceClient();
  const { data: { user }, error } = await admin.auth.getUser(token);
  if (error || !user) throw new AdminAuthError("Tu sesión ha caducado. Vuelve a iniciar sesión.", 401);

  const { data: profile } = await admin.from("perfiles").select("rol").eq("user_id", user.id).maybeSingle();
  if (profile?.rol !== "admin") throw new AdminAuthError("Tu cuenta no tiene permisos de administración.", 403);

  return { admin, callerId: user.id };
}
