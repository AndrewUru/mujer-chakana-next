import type { MetadataRoute } from "next";
import { publicPages, SITE_URL } from "@/lib/seo";
import { getPublicResources } from "@/lib/public-resources";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const resources = await getPublicResources();
  return [
    ...publicPages.map(path => ({ url: new URL(path, SITE_URL).href })),
    ...resources.map(({ id }) => ({ url: `${SITE_URL}/recursos/${encodeURIComponent(id)}` })),
  ];
}
