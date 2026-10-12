export type ProductStatus = "draft" | "published" | "archived";
export type ImageType = "original" | "mockup" | "detail";
export interface ShopVariant {
  id: string; product_id: string; name: string; width_cm: number; height_cm: number;
  price_cents: number; active: boolean; sort_order: number;
}
export interface ShopImage {
  id: string; product_id: string; storage_path: string; image_type: ImageType; alt_text: string; sort_order: number;
}
export interface ShopProduct {
  id: string; slug: string; name: string; description: string; story: string; author: string;
  author_bio: string; paper_info: string; status: ProductStatus; featured: boolean; is_demo: boolean;
  main_image_path: string | null; seo_title: string; meta_description: string; og_image_path: string | null;
  created_at: string; updated_at: string; variants: ShopVariant[]; images: ShopImage[];
}
export const SHOP_SELECT = "*, variants:shop_variants(*), images:shop_images(*)";
export const SHOP_BUCKET = "shop-products";
export const money = (cents: number) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(cents / 100);
export const slugify = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 120).replace(/-$/, "");
export function imageUrl(path: string | null): string | null {
  return path ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${SHOP_BUCKET}/${path.split("/").map(encodeURIComponent).join("/")}` : null;
}
export function fromPrice(product: ShopProduct): number | null {
  const active = product.variants.filter(variant => variant.active);
  return active.length ? Math.min(...active.map(variant => variant.price_cents)) : null;
}
export function validateProduct(product: ShopProduct): string | null {
  if (!product.name.trim()) return "Escribe el nombre de la ilustración.";
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(product.slug)) return "La URL solo admite letras minúsculas sin acentos, números y guiones.";
  if (!product.author.trim()) return "Indica la autoría de la obra.";
  if (product.variants.length > 30 || product.images.length > 30) return "Puedes añadir hasta 30 tamaños y 30 imágenes.";
  for (const variant of product.variants) {
    if (!variant.name.trim() || !Number.isFinite(variant.width_cm) || !Number.isFinite(variant.height_cm) || variant.width_cm <= 0 || variant.height_cm <= 0 || !Number.isInteger(variant.price_cents) || variant.price_cents <= 0 || variant.price_cents > 100000000) return "Revisa los tamaños: cada uno necesita nombre, medidas y un precio mayor que cero.";
  }
  if (product.status === "published" && !product.is_demo) {
    if (!product.variants.some(variant => variant.active)) return "Activa al menos un tamaño antes de publicar.";
    if (!product.images.some(image => image.storage_path === product.main_image_path && image.image_type === "original" && image.alt_text.trim())) return "Sube una imagen original, márcala como principal y escribe su texto ALT antes de publicar.";
  }
  return null;
}
