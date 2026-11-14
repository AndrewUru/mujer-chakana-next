import { NextResponse } from "next/server";
import { AdminAuthError, requireUser } from "@/lib/supabaseAdmin";
import { cancelSubscription, PayPalError } from "@/lib/paypal";

export const dynamic = "force-dynamic";

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

// Cancela en PayPal (si la suscripción se creó desde la app) y desactiva el acceso.
export async function POST(request: Request) {
  try {
    const { admin, user } = await requireUser(request);
    const { data: profile, error: profileError } = await admin
      .from("perfiles")
      .select("paypal_subscription_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (profileError) throw profileError;
    if (!profile) return json({ error: "No encontramos tu perfil." }, 404);

    const subscriptionId = profile.paypal_subscription_id as string | null;
    if (subscriptionId) await cancelSubscription(subscriptionId, "Cancelada por la usuaria desde Ginergética");

    const { error } = await admin
      .from("perfiles")
      .update({ suscripcion_activa: false, tipo_plan: "gratuito", fecha_expiracion: null })
      .eq("user_id", user.id);
    if (error) throw error;

    return json({ ok: true, cancelledInPayPal: Boolean(subscriptionId) });
  } catch (error) {
    if (error instanceof AdminAuthError || error instanceof PayPalError) return json({ error: error.message }, error.status);
    console.error("Cancelar suscripción:", error);
    return json({ error: "No se pudo cancelar la suscripción. Inténtalo de nuevo." }, 500);
  }
}
