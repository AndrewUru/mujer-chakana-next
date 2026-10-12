import { NextResponse } from "next/server";

// Integration boundary: replace only after implementing server-priced sessions,
// verified webhooks, orders, shipping/tax rules and payment idempotency.
export async function POST() {
  return NextResponse.json({ code: "CHECKOUT_NOT_CONFIGURED", error: "Los pagos de la tienda todavía no están disponibles. Tu carrito queda guardado; no se ha realizado ningún cobro ni pedido." }, { status: 503, headers: { "Cache-Control": "no-store" } });
}
