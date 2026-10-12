import "server-only";
import { getShopProducts } from "./public";
import { imageUrl } from "./types";
import type { CartEntry, CartQuote } from "./cart";

export async function quoteCart(items: CartEntry[]): Promise<CartQuote> {
  const products = await getShopProducts();
  const variants = new Map(products.filter(product => !product.is_demo).flatMap(product => product.variants.filter(variant => variant.active).map(variant => [variant.id, { product, variant }] as const)));
  const quote: CartQuote = { lines: [], unavailable: [], subtotal_cents: 0 };
  for (const item of items) {
    const found = variants.get(item.variantId);
    if (!found) { quote.unavailable.push(item.variantId); continue; }
    const { product, variant } = found;
    quote.lines.push({ ...item, name: product.name, slug: product.slug, size: `${variant.name} · ${variant.width_cm} × ${variant.height_cm} cm`, image: imageUrl(product.main_image_path), price_cents: variant.price_cents, total_cents: variant.price_cents * item.quantity });
    quote.subtotal_cents += variant.price_cents * item.quantity;
  }
  return quote;
}
