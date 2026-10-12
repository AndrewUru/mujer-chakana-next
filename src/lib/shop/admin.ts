import { supabase } from "@/lib/supabaseClient";
import { SHOP_BUCKET, SHOP_SELECT, validateProduct, type ShopProduct } from "./types";

export async function requireShopAdmin() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Inicia sesión con tu cuenta de administradora para continuar.");
  const { data: profile, error: profileError } = await supabase.from("perfiles").select("rol").eq("user_id", user.id).single();
  if (profileError || profile?.rol !== "admin") throw new Error("Tu cuenta no tiene permisos para gestionar la tienda.");
}
export function shopError(error: unknown): string {
  const message = typeof error === "object" && error && "message" in error ? String(error.message) : "";
  if (message.includes("SHOP_CONFLICT")) return "Otra persona ha modificado esta obra. Copia tus cambios y recarga la página antes de guardar.";
  if (message.includes("duplicate key")) return "Esa URL ya pertenece a otra obra. Elige otra en el campo slug.";
  if (/schema cache|does not exist|Could not find|Bucket not found/i.test(message)) return "La tienda necesita su instalación inicial. Contacta con la persona responsable de la aplicación.";
  if (/row-level|permission denied|JWT|expired/i.test(message)) return "No se pudo autorizar el cambio. Comprueba tu sesión de administradora.";
  if (/constraint|invalid input|null value/i.test(message)) return "Revisa los campos: hay un valor vacío, demasiado largo o fuera del rango permitido.";
  return error instanceof Error ? error.message : "No pudimos completar la operación. Comprueba la conexión y vuelve a intentarlo.";
}
export async function loadShopProduct(id: string): Promise<ShopProduct> {
  const { data, error } = await supabase.from("shop_products").select(SHOP_SELECT).eq("id", id).single();
  if (error) throw error;
  const product = data as ShopProduct;
  product.variants.sort((a, b) => a.sort_order - b.sort_order);
  product.images.sort((a, b) => a.sort_order - b.sort_order);
  return product;
}
export async function saveShopProduct(product: ShopProduct) {
  const validation = validateProduct(product);
  if (validation) throw new Error(validation);
  const { data, error } = await supabase.rpc("shop_save_product", { p_id: product.id, p_expected_updated_at: product.updated_at, p_data: product });
  if (error) throw error;
  return { ...product, updated_at: data as string };
}
export async function uploadShopImage(productId: string, file: File): Promise<string> {
  const extensions: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
  if (!extensions[file.type] || !file.size || file.size > 8 * 1024 * 1024) throw new Error("Elige una imagen JPG, PNG o WebP de hasta 8 MB.");
  const path = `${productId}/${crypto.randomUUID()}.${extensions[file.type]}`;
  const { error } = await supabase.storage.from(SHOP_BUCKET).upload(path, file, { contentType: file.type, upsert: false, cacheControl: "31536000" });
  if (error) throw error;
  return path;
}
// Duplicates can share images. Never remove an object still referenced by any work.
export async function removeUnusedShopImages(paths: string[]) {
  if (!paths.length) return;
  const { data, error } = await supabase.from("shop_images").select("storage_path").in("storage_path", paths);
  if (error) throw error;
  const used = new Set((data ?? []).map(image => image.storage_path));
  const unused = [...new Set(paths)].filter(path => !used.has(path));
  if (!unused.length) return;
  const { error: storageError } = await supabase.storage.from(SHOP_BUCKET).remove(unused);
  if (storageError) throw storageError;
}
