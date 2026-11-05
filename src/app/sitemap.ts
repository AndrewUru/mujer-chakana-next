import type { MetadataRoute } from "next";
import { publicPages, SITE_URL } from "@/lib/seo";
import { getPublicResources } from "@/lib/public-resources";
import { SHOP_ENABLED } from "@/lib/shop/config";
import { getShopProducts } from "@/lib/shop/public";

export const dynamic = "force-dynamic";

async function shopEntries(): Promise<MetadataRoute.Sitemap> {
  if (!SHOP_ENABLED) return [];
  // Keep the existing sitemap available during the one-time shop installation.
  const products = await getShopProducts().catch(() => []);
  return [
    { url: `${SITE_URL}/tienda` },
    ...products.filter(product => !product.is_demo).map(product => ({ url: `${SITE_URL}/tienda/${product.slug}`, lastModified: product.updated_at })),
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [resources, shop] = await Promise.all([getPublicResources(), shopEntries()]);
  return [
    ...publicPages.map(path => ({ url: new URL(path, SITE_URL).href })),
    ...resources.map(({ id }) => ({ url: `${SITE_URL}/recursos/${encodeURIComponent(id)}` })),
    ...shop,
  ];
}
