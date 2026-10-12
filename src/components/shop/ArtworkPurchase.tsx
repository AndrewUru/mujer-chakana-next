"use client";
import { useState } from "react";
import Link from "next/link";
import { money, type ShopVariant } from "@/lib/shop/types";
import { useCart } from "./CartProvider";
import styles from "./shop.module.css";
export default function ArtworkPurchase({ variants, isDemo }: { variants: ShopVariant[]; isDemo: boolean }) {
  const active = variants.filter(variant => variant.active).sort((a, b) => a.sort_order - b.sort_order);
  const [selectedId, setSelectedId] = useState(active[0]?.id ?? "");
  const [notice, setNotice] = useState("");
  const selected = active.find(variant => variant.id === selectedId);
  const cart = useCart();
  return <div className={styles.purchase}><p className={styles.price}>{selected ? money(selected.price_cents) : "No disponible"}</p><fieldset><legend>Elige tu tamaño</legend><div className={styles.sizes}>{active.map(variant => <label key={variant.id}><input type="radio" name="artwork-size" value={variant.id} checked={selectedId === variant.id} onChange={() => { setSelectedId(variant.id); setNotice(""); }} /><span>{variant.name}<small>{variant.width_cm} × {variant.height_cm} cm</small></span></label>)}</div></fieldset><p className={styles.caption}>{isDemo ? "Obra de demostración · no disponible para compra" : active.length ? "Disponible para añadir al carrito · pagos próximamente" : "Esta obra no tiene tamaños disponibles actualmente."}</p><button className={styles.primary} disabled={!selected || isDemo || !cart.ready} onClick={() => { if (selected && cart.add(selected.id)) setNotice(`${selected.name} se ha añadido a tu carrito.`); }}>Añadir al carrito</button>{notice && <p role="status" className={styles.feedback}>{notice} <Link href="/carrito">Ver carrito</Link></p>}{cart.error && <p role="alert">{cart.error}</p>}</div>;
}
