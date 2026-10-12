"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "./CartProvider";
import type { CartQuote } from "@/lib/shop/cart";
import { money } from "@/lib/shop/types";
import styles from "./shop.module.css";
export default function CartContent() {
  const cart = useCart();
  const [result, setResult] = useState<{ key: string; quote: CartQuote } | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [checkingOut, setCheckingOut] = useState(false);
  const key = JSON.stringify(cart.items);
  useEffect(() => {
    if (!cart.ready || !cart.items.length) return;
    const controller = new AbortController();
    setError(""); setCheckoutMessage(""); setResult(null);
    void fetch("/api/shop/cart", { method: "POST", headers: { "Content-Type": "application/json" }, body: key, signal: controller.signal }).then(async response => {
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "No pudimos comprobar el carrito.");
      setResult({ key, quote: body as CartQuote });
    }).catch(failure => { if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : "No pudimos comprobar los precios."); });
    return () => controller.abort();
  }, [key, cart.ready, cart.items.length, attempt]);
  async function checkout() {
    setCheckingOut(true); setCheckoutMessage("");
    try {
      const response = await fetch("/api/shop/checkout", { method: "POST" });
      const body = await response.json();
      setCheckoutMessage(body.error || "El pago no está disponible todavía. No se ha realizado ningún cobro.");
    } catch { setCheckoutMessage("No pudimos conectar. No se ha realizado ningún cobro ni pedido."); }
    finally { setCheckingOut(false); }
  }
  const quote = result?.key === key ? result.quote : null;
  return <main className={styles.page}><div className={styles.container}><nav className={styles.topline}><Link href="/tienda">← Seguir explorando</Link><span>Arte de Samari</span></nav><header className={styles.cartHeader}><p className={styles.eyebrow}>Tu selección</p><h1>Un lugar<br /><em>para estas obras.</em></h1></header>{cart.error && <div role="alert" className={styles.demo}>{cart.error} <button className={styles.secondary} onClick={() => { if (window.confirm("Vaciar y restablecer el carrito guardado?")) cart.reset(); }}>Restablecer carrito</button></div>}{!cart.ready ? <p role="status">Recuperando tu carrito…</p> : !cart.items.length ? <div className={styles.empty}><h2>Tu carrito está esperando una obra.</h2><p>Recorre la galería y elige la ilustración y el tamaño que prefieras.</p><Link className={styles.primary} href="/tienda">Explorar ilustraciones</Link></div> : <>
    {error && <div role="alert" className={styles.demo}>{error}<button className={styles.secondary} onClick={() => setAttempt(value => value + 1)}>Reintentar</button></div>}
    {!quote && !error && <p role="status">Comprobando precios y disponibilidad…</p>}
    <div className={styles.cartLayout}><section aria-label="Obras seleccionadas">{quote ? <>{quote.lines.map(line => <article className={styles.cartItem} key={line.variantId}><Link className={styles.cartImage} href={`/tienda/${line.slug}`}>{line.image ? <Image src={line.image} alt={line.name} fill sizes="110px" /> : <span>Imagen pendiente</span>}</Link><div><h2><Link href={`/tienda/${line.slug}`}>{line.name}</Link></h2><p>{line.size}</p><p>{money(line.price_cents)} / unidad</p><div className={styles.cartControls}><label>Cantidad<select value={line.quantity} onChange={event => cart.setQuantity(line.variantId, Number(event.target.value))}>{Array.from({ length: 20 }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}</select></label><button className={styles.secondary} onClick={() => cart.remove(line.variantId)}>Eliminar</button></div></div><strong>{money(line.total_cents)}</strong></article>)}{quote.unavailable.map(id => <article className={styles.unavailable} key={id}><p>Una obra o tamaño de tu carrito ya no está disponible. Retíralo para continuar.</p><button className={styles.secondary} onClick={() => cart.remove(id)}>Retirar producto no disponible</button></article>)}</> : error ? cart.items.map(item => <p key={item.variantId}>Tamaño guardado · {item.quantity} unidades <button className={styles.secondary} onClick={() => cart.remove(item.variantId)}>Retirar del carrito</button></p>) : null}</section>
    <aside className={styles.summary}><h2>Tu selección, en resumen</h2><div><span>Subtotal</span><strong>{quote ? money(quote.subtotal_cents) : "—"}</strong></div><p>El subtotal se calcula con los precios actuales. El envío y las condiciones finales se indicarán cuando se habiliten las compras.</p><button className={styles.primary} disabled={!quote?.lines.length || Boolean(quote?.unavailable.length) || checkingOut} onClick={() => void checkout()}>{checkingOut ? "Comprobando…" : "Finalizar compra"}</button><p>Los pagos todavía no están habilitados.</p>{checkoutMessage && <p role="status" className={styles.feedback}>{checkoutMessage}</p>}</aside></div></>}
  </div></main>;
}
