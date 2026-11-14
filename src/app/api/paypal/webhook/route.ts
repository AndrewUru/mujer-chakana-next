import { NextResponse } from "next/server";
import { serviceClient } from "@/lib/supabaseAdmin";
import { isSubscriptionId, nextBillingDate, verifyWebhook, type PayPalSubscription } from "@/lib/paypal";
import { planTypeFromId } from "@/lib/paypalPlans";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ACTIVATED = ["BILLING.SUBSCRIPTION.ACTIVATED", "BILLING.SUBSCRIPTION.RE-ACTIVATED"];
const ENDED = ["BILLING.SUBSCRIPTION.CANCELLED", "BILLING.SUBSCRIPTION.SUSPENDED", "BILLING.SUBSCRIPTION.EXPIRED"];

// PayPal avisa aquí de altas, cancelaciones, impagos y vencimientos, de modo
// que el acceso sigue al estado real del cobro aunque la usuaria no vuelva a la app.
export async function POST(request: Request) {
  const rawBody = await request.text();
  try {
    if (!(await verifyWebhook(request.headers, rawBody))) {
      return NextResponse.json({ error: "Firma no válida." }, { status: 400 });
    }

    const event = JSON.parse(rawBody) as { event_type?: string; resource?: PayPalSubscription };
    const subscription = event.resource;
    if (!event.event_type || !subscription || !isSubscriptionId(subscription.id)) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const admin = serviceClient();
    if (ACTIVATED.includes(event.event_type)) {
      const plan = planTypeFromId(subscription.plan_id);
      if (plan && subscription.custom_id && UUID.test(subscription.custom_id)) {
        const { error } = await admin
          .from("perfiles")
          .update({
            suscripcion_activa: true,
            tipo_plan: plan,
            paypal_subscription_id: subscription.id,
            fecha_expiracion: nextBillingDate(subscription),
          })
          .eq("user_id", subscription.custom_id);
        if (error) throw error;
      }
    } else if (ENDED.includes(event.event_type)) {
      const { error } = await admin
        .from("perfiles")
        .update({ suscripcion_activa: false, tipo_plan: "gratuito", fecha_expiracion: null })
        .eq("paypal_subscription_id", subscription.id);
      if (error) throw error;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    // Un 5xx hace que PayPal reintente el aviso más tarde.
    console.error("PayPal webhook:", error);
    return NextResponse.json({ error: "No se pudo procesar el aviso." }, { status: 500 });
  }
}
