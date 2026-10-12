export interface CartEntry { variantId: string; quantity: number }
export interface CartLine extends CartEntry { name: string; slug: string; size: string; image: string | null; price_cents: number; total_cents: number }
export interface CartQuote { lines: CartLine[]; unavailable: string[]; subtotal_cents: number }
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function parseCart(value: unknown): CartEntry[] {
  if (!Array.isArray(value) || value.length > 50) throw new Error("Carrito no válido.");
  const seen = new Set<string>();
  return value.map(item => {
    if (!item || typeof item.variantId !== "string" || !uuid.test(item.variantId) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 20 || seen.has(item.variantId)) throw new Error("Revisa los productos y cantidades del carrito.");
    seen.add(item.variantId);
    return { variantId: item.variantId, quantity: item.quantity };
  });
}
