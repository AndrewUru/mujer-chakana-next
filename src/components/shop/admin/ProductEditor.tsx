"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { loadShopProduct, removeUnusedShopImages, saveShopProduct, shopError, uploadShopImage } from "@/lib/shop/admin";
import { slugify, type ImageType, type ShopProduct } from "@/lib/shop/types";
import VariantEditor from "./VariantEditor";
import ImageEditor from "./ImageEditor";

export default function ProductEditor({ id }: { id: string }) {
  const [product, setProduct] = useState<ShopProduct | null>(null);
  const [snapshot, setSnapshot] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [retry, setRetry] = useState(0);
  const [customSlug, setCustomSlug] = useState(false);
  const pathsToClean = useRef(new Set<string>());
  const dirty = Boolean(product && JSON.stringify(product) !== snapshot);
  useEffect(() => {
    let active = true;
    setError("");
    void loadShopProduct(id).then(result => {
      if (!active) return;
      setProduct(result); setSnapshot(JSON.stringify(result)); setCustomSlug(!result.slug.startsWith("obra-") || result.name !== "Nueva ilustración");
      pathsToClean.current = new Set(result.images.map(image => image.storage_path));
    }).catch(failure => { if (active) setError(shopError(failure)); });
    return () => { active = false; };
  }, [id, retry]);
  useEffect(() => {
    if (!dirty && !busy) return;
    const unload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    const navigate = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest("a") : null;
      if (!target || target.target === "_blank" || target.getAttribute("href")?.startsWith("#")) return;
      if (!window.confirm(busy ? "Hay una operación en curso. ¿Salir de todas formas?" : "Tienes cambios sin guardar. ¿Salir y descartarlos?")) { event.preventDefault(); event.stopPropagation(); }
    };
    window.addEventListener("beforeunload", unload); document.addEventListener("click", navigate, true);
    return () => { window.removeEventListener("beforeunload", unload); document.removeEventListener("click", navigate, true); };
  }, [dirty, busy]);
  const update = (values: Partial<ShopProduct>) => { setProduct(current => current ? { ...current, ...values } : current); setNotice(""); };
  async function upload(files: File[], type: ImageType) {
    if (!product || !files.length) return;
    if (product.images.length + files.length > 30) { setError("Puedes añadir hasta 30 imágenes por obra."); return; }
    setBusy(true); setError(""); setNotice("Subiendo imágenes…");
    try {
      for (const file of files) {
        const path = await uploadShopImage(product.id, file);
        pathsToClean.current.add(path);
        setProduct(current => current ? { ...current, main_image_path: current.main_image_path || (type === "original" ? path : null), images: [...current.images, { id: crypto.randomUUID(), product_id: current.id, storage_path: path, image_type: type, alt_text: "", sort_order: current.images.length }] } : current);
      }
      setNotice("Imágenes subidas. Añade sus textos ALT y guarda los cambios.");
    } catch (failure) { setError(shopError(failure)); setNotice(""); }
    finally { setBusy(false); }
  }
  async function save(event: FormEvent) {
    event.preventDefault(); if (!product || busy) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const saved = await saveShopProduct({ ...product, variants: product.variants.map((variant, order) => ({ ...variant, sort_order: order })), images: product.images.map((image, order) => ({ ...image, sort_order: order })) });
      setProduct(saved); setSnapshot(JSON.stringify(saved));
      setNotice(saved.status === "published" ? "Cambios guardados. La obra ya está publicada en la tienda." : "Cambios guardados correctamente.");
      try { await removeUnusedShopImages([...pathsToClean.current]); pathsToClean.current = new Set(saved.images.map(image => image.storage_path)); }
      catch { setError("La obra se guardó, pero no pudimos limpiar algunos archivos retirados. Pulsa Guardar cambios para volver a intentarlo."); }
    } catch (failure) { setError(shopError(failure)); }
    finally { setBusy(false); }
  }
  if (!product) return <main className="admin-page"><Link href="/admin/tienda">Volver a Tienda</Link>{error ? <div className="admin-notice error" role="alert">{error}<button className="admin-button" onClick={() => setRetry(value => value + 1)}>Reintentar</button></div> : <p role="status">Abriendo la ilustración…</p>}</main>;
  return <main className="admin-page shop-admin">
    <header className="admin-heading"><div><Link href="/admin/tienda">Tienda / Ilustraciones</Link><h1>{product.name || "Nueva ilustración"}</h1><p className="admin-subtitle">Completa la información, añade las imágenes y elige cuándo publicar.</p></div>{product.status === "published" && <Link className="admin-button" target="_blank" href={`/tienda/${product.slug}`}>Ver en la tienda</Link>}</header>
    <form onSubmit={save}>
      <div className="shop-savebar"><span role="status">{busy ? "Procesando…" : dirty ? "Tienes cambios sin guardar" : "Todos los cambios están guardados"}</span><button className="admin-button primary" type="submit" disabled={busy}>{busy ? "Espera un momento…" : "Guardar cambios"}</button></div>
      {error && <p className="admin-notice error" role="alert">{error}</p>}{notice && <p className="admin-notice" role="status">{notice}</p>}
      <fieldset className="shop-form" disabled={busy}>
        <section className="admin-card"><h2>Información</h2><div className="admin-fields">
          <label>Nombre<input required maxLength={160} value={product.name} onChange={event => update({ name: event.target.value, ...(!customSlug ? { slug: slugify(event.target.value) } : {}) })} /></label>
          <label>Slug (URL de la obra)<input required maxLength={120} pattern="[a-z0-9]+(-[a-z0-9]+)*" value={product.slug} onChange={event => { setCustomSlug(true); update({ slug: event.target.value }); }} /><small>/tienda/{product.slug}</small><button type="button" className="admin-button" onClick={() => { setCustomSlug(false); update({ slug: slugify(product.name) }); }}>Generar desde el nombre</button></label>
          <label className="wide">Descripción corta<textarea rows={2} maxLength={500} value={product.description} onChange={event => update({ description: event.target.value })} /></label>
          <label className="wide">Descripción / historia de la obra<textarea rows={6} maxLength={12000} value={product.story} onChange={event => update({ story: event.target.value })} /></label>
          <label>Autor/a<input required maxLength={160} value={product.author} onChange={event => update({ author: event.target.value })} /></label>
          <label>Estado<select value={product.status} onChange={event => update({ status: event.target.value as ShopProduct["status"] })}><option value="draft">Borrador</option><option value="published">Publicada</option><option value="archived">Desactivada</option></select></label>
          <label className="wide">Sobre el autor/a<textarea rows={3} maxLength={4000} value={product.author_bio} onChange={event => update({ author_bio: event.target.value })} /></label>
          <label className="wide">Información del papel<textarea rows={2} maxLength={1000} value={product.paper_info} onChange={event => update({ paper_info: event.target.value })} /></label>
        </div><div className="shop-actions"><label className="shop-check"><input type="checkbox" checked={product.featured} onChange={event => update({ featured: event.target.checked })} /> Destacada</label><label className="shop-check"><input type="checkbox" checked={product.is_demo} onChange={event => update({ is_demo: event.target.checked })} /> Obra de demostración (no se puede comprar)</label></div></section>
        <ImageEditor images={product.images} mainPath={product.main_image_path} onUpload={upload} onMainChange={path => update({ main_image_path: path })} onChange={images => update({ images, main_image_path: images.some(image => image.storage_path === product.main_image_path && image.image_type === "original") ? product.main_image_path : images.find(image => image.image_type === "original")?.storage_path ?? null, og_image_path: images.some(image => image.storage_path === product.og_image_path) ? product.og_image_path : null })} />
        <VariantEditor productId={product.id} variants={product.variants} onChange={variants => update({ variants })} />
        <section className="admin-card"><h2>SEO · Cómo se comparte la obra</h2><div className="admin-fields"><label className="wide">Título SEO<input maxLength={160} value={product.seo_title} placeholder={product.name} onChange={event => update({ seo_title: event.target.value })} /></label><label className="wide">Meta description<textarea rows={3} maxLength={320} value={product.meta_description} placeholder={product.description} onChange={event => update({ meta_description: event.target.value })} /></label><label className="wide">Imagen Open Graph<select value={product.og_image_path ?? ""} onChange={event => update({ og_image_path: event.target.value || null })}><option value="">Usar imagen principal</option>{product.images.map((image, index) => <option key={image.id} value={image.storage_path}>{index + 1} · {image.alt_text || image.image_type}</option>)}</select></label></div></section>
      </fieldset>
      <div className="shop-actions"><button className="admin-button primary" type="submit" disabled={busy}>Guardar cambios</button><Link className="admin-button" href="/admin/tienda">Volver a la lista</Link></div>
    </form>
  </main>;
}
