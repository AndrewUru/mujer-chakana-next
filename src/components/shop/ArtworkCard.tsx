import Link from "next/link";
import Image from "next/image";
import { fromPrice, imageUrl, money, type ShopProduct } from "@/lib/shop/types";
import ArtworkPlaceholder from "./ArtworkPlaceholder";
import styles from "./shop.module.css";
export default function ArtworkCard({ product, index }: { product: ShopProduct; index: number }) {
  const src = imageUrl(product.main_image_path); const price = fromPrice(product);
  const alt = product.images.find(image => image.storage_path === product.main_image_path)?.alt_text || product.name;
  return <article className={styles.artwork}><Link href={`/tienda/${product.slug}`}><div className={styles.artworkImage}>{src ? <Image src={src} alt={alt} fill sizes="(max-width: 640px) 90vw, (max-width: 1000px) 45vw, 42vw" priority={index < 2} /> : <ArtworkPlaceholder name={product.name} />}</div><div className={styles.artworkCaption}><div><span>{String(index + 1).padStart(2, "0")} / {product.author}</span><h2>{product.name}</h2></div><p>{price === null ? "Próximamente" : `Desde ${money(price)}`}</p></div></Link></article>;
}
