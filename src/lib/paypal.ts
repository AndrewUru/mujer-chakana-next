// Cliente mínimo de la API REST de PayPal para suscripciones. Solo servidor.
import "server-only";
import { PAYPAL_CLIENT_ID } from "@/lib/paypalPlans";

const API_BASE = process.env.PAYPAL_API_BASE || "https://api-m.paypal.com";

export class PayPalError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export interface PayPalSubscription {
  id: string;
  status: string;
  plan_id: string;
  custom_id?: string;
  billing_info?: { next_billing_time?: string };
}

export function isPayPalConfigured() {
  return Boolean(process.env.PAYPAL_CLIENT_SECRET);
}

export const isSubscriptionId = (value: unknown): value is string =>
  typeof value === "string" && /^I-[A-Z0-9]{6,40}$/.test(value);

async function accessToken(): Promise<string> {
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!secret) throw new PayPalError("Falta PAYPAL_CLIENT_SECRET en el servidor.", 503);

  const response = await fetch(`${API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!response.ok) throw new PayPalError("PayPal rechazó las credenciales del servidor.", 502);
  return (await response.json()).access_token as string;
}

async function call(path: string, init: { method?: string; body?: string } = {}) {
  return fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${await accessToken()}`, "Content-Type": "application/json" },
    cache: "no-store",
  });
}

/** Devuelve la suscripción tal como la conoce PayPal, o null si no existe. */
export async function getSubscription(id: string): Promise<PayPalSubscription | null> {
  const response = await call(`/v1/billing/subscriptions/${encodeURIComponent(id)}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new PayPalError("No se pudo consultar la suscripción en PayPal.", 502);
  return (await response.json()) as PayPalSubscription;
}

export async function cancelSubscription(id: string, reason: string) {
  const response = await call(`/v1/billing/subscriptions/${encodeURIComponent(id)}/cancel`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
  // 422: ya estaba cancelada o caducada. 404: PayPal ya no la conoce.
  if (!response.ok && response.status !== 422 && response.status !== 404) {
    throw new PayPalError("PayPal no pudo cancelar la suscripción.", 502);
  }
}

/** Comprueba con PayPal que el aviso recibido en el webhook es auténtico. */
export async function verifyWebhook(headers: Headers, rawBody: string): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) throw new PayPalError("Falta PAYPAL_WEBHOOK_ID en el servidor.", 503);

  const fields = {
    auth_algo: headers.get("paypal-auth-algo"),
    cert_url: headers.get("paypal-cert-url"),
    transmission_id: headers.get("paypal-transmission-id"),
    transmission_sig: headers.get("paypal-transmission-sig"),
    transmission_time: headers.get("paypal-transmission-time"),
    webhook_id: webhookId,
  };
  if (Object.values(fields).some(value => !value)) return false;

  // El evento se reenvía tal cual llegó: reserializarlo puede invalidar la firma.
  const body = `${JSON.stringify(fields).slice(0, -1)},"webhook_event":${rawBody}}`;
  const response = await call("/v1/notifications/verify-webhook-signature", { method: "POST", body });
  if (!response.ok) return false;
  return (await response.json()).verification_status === "SUCCESS";
}

/** Fecha (YYYY-MM-DD) del próximo cobro, que usamos como vencimiento del acceso. */
export function nextBillingDate(subscription: PayPalSubscription): string | null {
  return subscription.billing_info?.next_billing_time?.slice(0, 10) ?? null;
}
