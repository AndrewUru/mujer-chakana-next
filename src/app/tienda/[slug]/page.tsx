import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getShopProduct } from "@/lib/shop/public";
import { imageUrl } from "@/lib/shop/types";
import ArtworkGallery from "@/components/shop/ArtworkGallery";
import ArtworkPurchase from "@/components/shop/ArtworkPurchase";
import styles from "@/components/shop/shop.module.css";
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getShopProduct((await params).slug);
  if (!product) return { title: "Obra no disponible", robots: { index: false, follow: false } };
  const title = product.seo_title || product.name; const description = product.meta_description || product.description;
  const image = imageUrl(product.og_image_path || product.main_image_path);
  return { title, description, alternates: { canonical: `/tienda/${product.slug}` }, robots: product.is_demo ? { index: false, follow: true } : undefined, openGraph: { title, description, type: "website", images: image ? [{ url: image, alt: product.images.find(item => item.storage_path === (product.og_image_path || product.main_image_path))?.alt_text || product.name }] : [] } };
}
export default async function ArtworkPage({ params }: Props) {
  const product = await getShopProduct((await params).slug);
  if (!product) notFound();
  return <main className={styles.page}><div className={styles.container}><nav className={styles.topline}><Link href="/tienda">← Volver a la galería</Link><Link href="/carrito">Mi carrito</Link></nav><div className={styles.detail}><ArtworkGallery images={product.images} mainPath={product.main_image_path} name={product.name} /><div className={styles.detailText}><p className={styles.eyebrow}>Una obra de {product.author}</p><h1>{product.name}</h1><p className={styles.description}>{product.description}</p><ArtworkPurchase variants={product.variants} isDemo={product.is_demo} /><p className={styles.paper}>{product.paper_info}</p><section className={styles.story}><h2>Sobre la obra</h2><p>{product.story || "La historia de esta obra se incorporará próximamente."}</p></section><section className={styles.story}><h2>Sobre {product.author}</h2><p>{product.author_bio || "Próximamente podrás conocer más sobre la autora y su proceso creativo."}</p></section></div></div></div></main>;
}
