export const PAYPAL_PLANS = {
  mensual: {
    id: "P-7N840235CX057714NNAJYNLY",
    label: "Suscripción mensual 🌒",
  },
  anual: {
    id: "P-98U01726LR562531RNAJYPGQ",
    label: "Suscripción anual 🌕",
  },
};

export type PlanType = keyof typeof PAYPAL_PLANS;

/** Traduce un plan de PayPal a nuestro tipo de plan; null si no es uno de los nuestros. */
export function planTypeFromId(planId: unknown): PlanType | null {
  const match = (Object.keys(PAYPAL_PLANS) as PlanType[]).find(type => PAYPAL_PLANS[type].id === planId);
  return match ?? null;
}

// Identificador público de la app de PayPal (no es un secreto).
export const PAYPAL_CLIENT_ID =
  process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ||
  "ASQix2Qu6atiH43_jrk18jeSMDjB_YdTjbfI8jrTJ7x5uagNzUhuNMXacO49ZxJWr_EMpBhrpVPbOvR_";

export const PAYPAL_SDK_URL = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&vault=true&intent=subscription`;
