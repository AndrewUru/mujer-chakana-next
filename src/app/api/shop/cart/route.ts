import { NextResponse } from "next/server";
import { parseCart } from "@/lib/shop/cart";
import { quoteCart } from "@/lib/shop/quote";
export async function POST(request: Request) {
  let items;
  try { items = parseCart(await request.json()); }
  catch { return NextResponse.json({ error: "El carrito contiene datos no válidos." }, { status: 400 }); }
  try { return NextResponse.json(await quoteCart(items), { headers: { "Cache-Control": "no-store" } }); }
  catch { return NextResponse.json({ error: "No pudimos comprobar los precios. Vuelve a intentarlo." }, { status: 503 }); }
}
