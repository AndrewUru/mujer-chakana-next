import type { ShopVariant } from "@/lib/shop/types";

export default function VariantEditor({ productId, variants, onChange }: { productId: string; variants: ShopVariant[]; onChange: (variants: ShopVariant[]) => void }) {
  const update = (id: string, values: Partial<ShopVariant>) => onChange(variants.map(variant => variant.id === id ? { ...variant, ...values } : variant));
  return <section className="admin-card"><h2>Tamaños y precios</h2><p>Precios en euros. Desactiva un tamaño para que deje de estar disponible.</p>
    {variants.map((variant, index) => <fieldset className="shop-variant" key={variant.id}><legend>Tamaño {index + 1}</legend><div className="admin-fields">
      <label>Nombre<input required maxLength={100} value={variant.name} onChange={event => update(variant.id, { name: event.target.value })} /></label>
      <label>Precio (€)<input aria-label={`Precio de ${variant.name || `tamaño ${index + 1}`} (€)`} type="number" min="0.01" max="1000000" step="0.01" required value={variant.price_cents ? variant.price_cents / 100 : ""} onChange={event => update(variant.id, { price_cents: Math.round(Number(event.target.value) * 100) })} /></label>
      <label>Ancho (cm)<input type="number" min="0.01" max="99999" step="0.01" required value={variant.width_cm || ""} onChange={event => update(variant.id, { width_cm: Number(event.target.value) })} /></label>
      <label>Alto (cm)<input type="number" min="0.01" max="99999" step="0.01" required value={variant.height_cm || ""} onChange={event => update(variant.id, { height_cm: Number(event.target.value) })} /></label>
    </div><div className="shop-actions"><label className="shop-check"><input type="checkbox" checked={variant.active} onChange={event => update(variant.id, { active: event.target.checked })} /> Activo</label><button type="button" className="admin-button" onClick={() => { if (window.confirm(`¿Eliminar el tamaño «${variant.name || index + 1}»? El cambio se aplicará al guardar.`)) onChange(variants.filter(item => item.id !== variant.id)); }}>Eliminar tamaño</button></div></fieldset>)}
    <button type="button" className="admin-button" disabled={variants.length >= 30} onClick={() => onChange([...variants, { id: crypto.randomUUID(), product_id: productId, name: "", width_cm: 0, height_cm: 0, price_cents: 0, active: true, sort_order: variants.length }])}>Añadir tamaño</button>
  </section>;
}
