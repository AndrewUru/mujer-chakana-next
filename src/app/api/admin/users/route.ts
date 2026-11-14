import { NextResponse } from "next/server";
import { AdminAuthError, requireAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PROFILE_COLUMNS = "user_id, email, display_name, rol, tipo_plan, suscripcion_activa";

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

function fail(error: unknown) {
  if (error instanceof AdminAuthError) return json({ error: error.message }, error.status);
  console.error("Admin users error:", error);
  return json({ error: "No se pudo completar la operación. Inténtalo de nuevo." }, 500);
}

// Crea una usuaria ya confirmada: no depende del correo de confirmación.
export async function POST(request: Request) {
  try {
    const { admin } = await requireAdmin(request);
    const body = await request.json().catch(() => null);
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";
    const displayName = typeof body?.display_name === "string" ? body.display_name.trim().slice(0, 80) : "";

    if (!EMAIL.test(email)) return json({ error: "Escribe un correo válido." }, 400);
    if (password.length < 6) return json({ error: "La contraseña debe tener al menos 6 caracteres." }, 400);
    if (displayName.length < 2) return json({ error: "El nombre debe tener al menos 2 caracteres." }, 400);

    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: displayName },
    });
    if (error || !data.user) {
      if (error?.code === "email_exists" || /already (been )?registered/i.test(error?.message ?? "")) {
        return json({ error: "Ya existe una cuenta con ese correo." }, 409);
      }
      if (error?.code === "weak_password") {
        return json({ error: "La contraseña no cumple los requisitos de seguridad del proyecto." }, 400);
      }
      throw error ?? new Error("createUser sin usuaria");
    }

    // El trigger on_auth_user_created_profile crea el perfil; el upsert cubre
    // el caso de que no esté instalado.
    const id = data.user.id;
    const { data: profile, error: profileError } = await admin
      .from("perfiles")
      .upsert(
        { id, user_id: id, email, display_name: displayName },
        { onConflict: "id" },
      )
      .select(PROFILE_COLUMNS)
      .single();
    if (profileError) throw profileError;

    return json({ user: profile }, 201);
  } catch (error) {
    return fail(error);
  }
}

// Elimina la cuenta, su perfil (cascade) y sus datos de ciclo.
export async function DELETE(request: Request) {
  try {
    const { admin, callerId } = await requireAdmin(request);
    const userId = new URL(request.url).searchParams.get("id") ?? "";
    if (!UUID.test(userId)) return json({ error: "Identificador de usuaria no válido." }, 400);
    if (userId === callerId) return json({ error: "No puedes eliminar tu propia cuenta desde aquí." }, 400);

    const { error } = await admin.auth.admin.deleteUser(userId);
    if (error && error.status !== 404) throw error;

    // Perfiles sin cuenta asociada y tablas sin clave foránea a auth.users.
    const warnings: string[] = [];
    const { data: ciclos } = await admin.from("ciclos").select("id").eq("usuario_id", userId);
    const cicloIds = (ciclos ?? []).map(ciclo => ciclo.id as string);
    const cleanups = [
      admin.from("perfiles").delete().eq("user_id", userId),
      admin.from("registros").delete().eq("user_id", userId),
      ...(cicloIds.length ? [admin.from("fases").delete().in("ciclo_id", cicloIds)] : []),
      admin.from("ciclos").delete().eq("usuario_id", userId),
    ];
    for (const cleanup of cleanups) {
      const { error: cleanupError } = await cleanup;
      if (cleanupError) warnings.push(cleanupError.message);
    }
    if (warnings.length) console.error("Admin users cleanup:", userId, warnings);

    return json({ ok: true, cleanupIncomplete: warnings.length > 0 });
  } catch (error) {
    return fail(error);
  }
}
