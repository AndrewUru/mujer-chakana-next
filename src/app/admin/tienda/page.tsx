"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { SHOP_SELECT, fromPrice, imageUrl, money, type ShopProduct } from "@/lib/shop/types";
import { shopError } from "@/lib/shop/admin";

export default function ShopAdminPage() {
  const router = useRouter();
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const { data, error: failure } = await supabase.from("shop_products").select(SHOP_SELECT).order("created_at", { ascending: false });
      if (failure) throw failure;
      setProducts((data ?? []) as ShopProduct[]);
    } catch (failure) { setError(shopError(failure)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  async function create(copyId?: string) {
    setPending(true); setError("");
    try {
      const { data, error: failure } = copyId ? await supabase.rpc("shop_duplicate_product", { p_id: copyId }) : await supabase.rpc("shop_create_product");
      if (failure) throw failure;
      router.push(`/admin/tienda/${data}`);
    } catch (failure) { setError(shopError(failure)); setPending(false); }
  }
  async function changeStatus(product: ShopProduct, next: "draft" | "archived") {
    if (!window.confirm(next === "archived" ? `¿Desactivar «${product.name}»? Se retirará de la tienda. Podrás recuperarla editándola.` : `¿Ocultar «${product.name}» y guardarla como borrador?`)) return;
    setPending(true); setError(""); setNotice("");
    try {
      const { data, error: failure } = await supabase.from("shop_products").update({ status: next }).eq("id", product.id).eq("updated_at", product.updated_at).select("id");
      if (failure) throw failure;
      if (!data?.length) throw new Error("La obra ha cambiado. Recarga la lista antes de continuar.");
      setNotice(next === "archived" ? "Ilustración desactivada. Puedes recuperarla desde el editor." : "Ilustración guardada como borrador.");
      await load();
    } catch (failure) { setError(shopError(failure)); }
    finally { setPending(false); }
  }
  const filtered = products.filter(product => product.name.toLocaleLowerCase("es").includes(query.toLocaleLowerCase("es")) && (status === "all" || product.status === status));
  return <main className="admin-page shop-admin">
    <header className="admin-heading"><div><p className="admin-eyebrow">Arte de Samari</p><h1>Tienda</h1><p className="admin-subtitle">Tus ilustraciones, listas para encontrar su lugar.</p></div><div className="shop-actions"><Link className="admin-button" href="/tienda">Ver tienda</Link><button className="admin-button primary" disabled={pending || loading || Boolean(error)} onClick={() => void create()}>{pending ? "Preparando…" : "Nueva ilustración"}</button></div></header>
    {error && <div className="admin-notice error" role="alert">{error} <button className="admin-button" onClick={() => void load()}>Reintentar</button></div>}
    {notice && <p className="admin-notice" role="status">{notice}</p>}
    <div className="admin-toolbar"><label className="admin-search"><input aria-label="Buscar ilustración" placeholder="Buscar por nombre…" value={query} onChange={event => setQuery(event.target.value)} /></label><select aria-label="Filtrar por estado" value={status} onChange={event => setStatus(event.target.value)}><option value="all">Todos los estados</option><option value="published">Publicadas</option><option value="draft">Borradores</option><option value="archived">Desactivadas</option></select></div>
    {loading ? <p role="status" className="admin-empty">Cargando ilustraciones…</p> : <div className="shop-product-list">{filtered.map(product => {
      const src = imageUrl(product.main_image_path); const price = fromPrice(product);
      return <article className="shop-product-row" key={product.id}><div className="shop-thumb">{src ? <Image src={src} alt="" fill sizes="80px" /> : <span>Sin imagen</span>}</div><div><h2>{product.name}</h2><p>{price === null ? "Sin tamaños activos" : `Desde ${money(price)}`}</p><p>{product.status === "published" ? "Publicada" : product.status === "draft" ? "Borrador" : "Desactivada"}{product.featured ? " · Destacada" : ""}{product.is_demo ? " · Demostración" : ""}</p></div><div className="shop-actions"><Link className="admin-button" href={`/admin/tienda/${product.id}`}>Editar</Link><button className="admin-button" disabled={pending} onClick={() => void create(product.id)}>Duplicar</button>{product.status === "published" && <button className="admin-button" disabled={pending} onClick={() => void changeStatus(product, "draft")}>Ocultar</button>}{product.status !== "archived" && <button className="admin-button" disabled={pending} onClick={() => void changeStatus(product, "archived")}>Desactivar</button>}</div></article>;
    })}{!filtered.length && !error && <div className="admin-empty"><h2>{products.length ? "No hay coincidencias" : "Tu galería empieza aquí"}</h2><p>{products.length ? "Prueba otro nombre o estado." : "Pulsa Nueva ilustración para añadir la primera obra."}</p></div>}</div>}
  </main>;
}
