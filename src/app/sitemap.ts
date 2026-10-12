import type { MetadataRoute } from "next";
import { publicPages, SITE_URL } from "@/lib/seo";
import { getPublicResources } from "@/lib/public-resources";
import { getShopProducts } from "@/lib/shop/public";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [resources, products] = await Promise.all([
    getPublicResources(),
    // Keep the existing sitemap available during the one-time shop installation.
    getShopProducts().catch(() => []),
  ]);
  return [
    ...publicPages.map(path => ({ url: new URL(path, SITE_URL).href })),
    ...resources.map(({ id }) => ({ url: `${SITE_URL}/recursos/${encodeURIComponent(id)}` })),
    { url: `${SITE_URL}/tienda` },
    ...products.filter(product => !product.is_demo).map(product => ({ url: `${SITE_URL}/tienda/${product.slug}`, lastModified: product.updated_at })),
  ];
}
