import { NextResponse } from "next/server";
import { AdminAuthError, requireUser } from "@/lib/supabaseAdmin";
import { getSubscription, isPayPalConfigured, isSubscriptionId, nextBillingDate, PayPalError } from "@/lib/paypal";
import { planTypeFromId } from "@/lib/paypalPlans";

export const dynamic = "force-dynamic";

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

// La página de suscripción lo consulta antes de mostrar los botones de pago:
// sin verificación en servidor no se debe poder pagar.
export async function GET() {
  return json({ configured: isPayPalConfigured() && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY) });
}

// Activa la suscripción solo si PayPal confirma que existe, está en vigor,
// es de uno de nuestros planes y la creó esta misma usuaria.
export async function POST(request: Request) {
  try {
    const { admin, user } = await requireUser(request);
    const body = await request.json().catch(() => null);
    const subscriptionId: unknown = body?.subscriptionID;
    if (!isSubscriptionId(subscriptionId)) return json({ error: "Identificador de suscripción no válido." }, 400);

    const subscription = await getSubscription(subscriptionId);
    if (!subscription) return json({ error: "PayPal no reconoce esa suscripción." }, 400);

    const plan = planTypeFromId(subscription.plan_id);
    if (!plan) return json({ error: "La suscripción no corresponde a un plan de Ginergética." }, 400);
    if (subscription.custom_id !== user.id) return json({ error: "Esa suscripción pertenece a otra cuenta." }, 403);
    if (!["ACTIVE", "APPROVED"].includes(subscription.status)) {
      return json({ error: "PayPal todavía no ha confirmado el pago. Inténtalo de nuevo en unos minutos." }, 409);
    }

    const { data, error } = await admin
      .from("perfiles")
      .update({
        suscripcion_activa: true,
        tipo_plan: plan,
        paypal_subscription_id: subscription.id,
        fecha_expiracion: nextBillingDate(subscription),
      })
      .eq("user_id", user.id)
      .select("user_id");
    if (error) throw error;
    if (!data?.length) return json({ error: "No encontramos tu perfil." }, 404);

    return json({ ok: true, plan });
  } catch (error) {
    if (error instanceof AdminAuthError || error instanceof PayPalError) return json({ error: error.message }, error.status);
    console.error("Activar suscripción:", error);
    return json({ error: "No se pudo activar la suscripción. Inténtalo de nuevo." }, 500);
  }
}
