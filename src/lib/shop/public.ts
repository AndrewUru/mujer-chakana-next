import "server-only";
import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import { SHOP_SELECT, type ShopProduct } from "./types";

function client() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
  });
}
export const getShopProducts = cache(async (): Promise<ShopProduct[]> => {
  const { data, error } = await client().from("shop_products").select(SHOP_SELECT).eq("status", "published").order("featured", { ascending: false }).order("created_at").limit(500).abortSignal(AbortSignal.timeout(10000));
  if (error) throw new Error("La galería no está disponible en este momento.");
  return (data ?? []) as ShopProduct[];
});
export const getShopProduct = cache(async (slug: string): Promise<ShopProduct | null> => {
  const { data, error } = await client().from("shop_products").select(SHOP_SELECT).eq("status", "published").eq("slug", slug).abortSignal(AbortSignal.timeout(10000)).maybeSingle();
  if (error) throw new Error("No pudimos consultar esta obra.");
  return data as ShopProduct | null;
});
