import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicResource, isResourceId } from "@/lib/public-resources";
import { privateMetadata, publicMetadata } from "@/lib/seo";
import ResourceDetail from "./resource-detail";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (!isResourceId(id)) notFound();
  const resource = await getPublicResource(id);
  if (!resource) return { ...privateMetadata, title: "Recurso de tu biblioteca" };
  return publicMetadata(resource.titulo, resource.descripcion || "Explora este recurso de autoconocimiento y acompaña tu práctica a tu ritmo en Ginergética.", `/recursos/${resource.id}`);
}

export default async function RecursoPage({ params }: Props) {
  const { id } = await params;
  if (!isResourceId(id)) notFound();
  const resource = await getPublicResource(id);
  // Anonymous RLS visibility cannot distinguish a private record from a missing one.
  // Preserve the authenticated client lookup, with noindex until a public record exists.
  return <ResourceDetail key={id} id={id} initialResource={resource} />;
}
