"use client";
import { useState } from "react";
import Image from "next/image";
import { imageUrl, type ShopImage } from "@/lib/shop/types";
import ArtworkPlaceholder from "./ArtworkPlaceholder";
import styles from "./shop.module.css";
const labels = { original: "Obra original", mockup: "Mockup · representación en un interior", detail: "Detalle de la ilustración" };
export default function ArtworkGallery({ images, mainPath, name }: { images: ShopImage[]; mainPath: string | null; name: string }) {
  const ordered = [...images].sort((a, b) => Number(b.storage_path === mainPath) - Number(a.storage_path === mainPath) || a.sort_order - b.sort_order);
  const [selected, setSelected] = useState(ordered[0]?.id);
  const current = ordered.find(image => image.id === selected) ?? ordered[0];
  return <section aria-label="Galería de la obra"><div className={styles.detailImage}>{current ? <Image src={imageUrl(current.storage_path)!} alt={current.alt_text || name} fill sizes="(max-width: 800px) 90vw, 55vw" priority /> : <ArtworkPlaceholder name={name} />}</div><p className={styles.caption} aria-live="polite">{current ? labels[current.image_type] : "Imagen pendiente de incorporar"}</p>{ordered.length > 1 && <div className={styles.thumbnails}>{ordered.map((image, index) => <button key={image.id} type="button" aria-pressed={image.id === current?.id} aria-label={`Ver imagen ${index + 1}: ${labels[image.image_type]}`} onClick={() => setSelected(image.id)}><Image src={imageUrl(image.storage_path)!} alt="" fill sizes="80px" /></button>)}</div>}</section>;
}
