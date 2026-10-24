import Link from "next/link";
import { getShopProducts } from "@/lib/shop/public";
import ArtworkCard from "@/components/shop/ArtworkCard";
import styles from "@/components/shop/shop.module.css";
export const dynamic = "force-dynamic";
export const metadata = { title: "Arte de Samari", description: "Una galería de ilustraciones originales de Samari y sus reproducciones sobre papel artístico.", alternates: { canonical: "/tienda" } };
export default async function ShopPage() {
  const products = await getShopProducts();
  return <main className={styles.page}><div className={styles.container}><nav className={styles.topline}><Link href="/dashboard">Ginergética / Tienda</Link><Link href="/carrito">Mi carrito</Link></nav><header className={styles.hero}><p className={styles.eyebrow}>Una galería para habitar</p><h1>Arte de<br /><em>Samari.</em></h1><div className={styles.heroNote}><span>La obra continúa contigo.</span><p>Ilustraciones del universo de Ginergética. Una invitación a detener la mirada y encontrar una obra con la que convivir.</p></div></header>{products.some(product => product.is_demo) && <p className={styles.demo}>La galería incluye obras de demostración, identificadas como “Obra”. Sus imágenes y textos reales se incorporarán próximamente.</p>}<section className={styles.gallery} aria-label="Ilustraciones">{products.map((product, index) => <ArtworkCard key={product.id} product={product} index={index} />)}</section>{!products.length && <div className={styles.empty}><h2>El espacio está preparado.</h2><p>Las primeras ilustraciones llegarán pronto. Vuelve a visitarnos.</p></div>}<footer className={styles.footer}><p>Una obra. Un espacio. Una nueva forma de mirar.</p><Link href="/recursos">Seguir explorando Ginergética</Link></footer></div></main>;
}
