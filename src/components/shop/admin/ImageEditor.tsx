import Image from "next/image";
import { imageUrl, type ImageType, type ShopImage } from "@/lib/shop/types";

export default function ImageEditor({ images, mainPath, onChange, onMainChange, onUpload }: {
  images: ShopImage[]; mainPath: string | null; onChange: (images: ShopImage[]) => void;
  onMainChange: (path: string) => void; onUpload: (files: File[], type: ImageType) => Promise<void>;
}) {
  function move(index: number, direction: number) {
    const next = [...images]; [next[index], next[index + direction]] = [next[index + direction], next[index]];
    onChange(next.map((image, order) => ({ ...image, sort_order: order })));
  }
  return <section className="admin-card"><h2>Imágenes</h2><p>Sube JPG, PNG o WebP de hasta 8 MB. La imagen principal debe mostrar la obra original. Las imágenes se guardan al pulsar Guardar cambios.</p>
    <div className="shop-uploaders">{([['original', 'Subir original'], ['mockup', 'Subir mockups'], ['detail', 'Subir detalles']] as const).map(([type, label]) => <label key={type}>{label}<input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={event => { const files = Array.from(event.target.files ?? []); event.target.value = ""; void onUpload(files, type); }} /></label>)}</div>
    <div className="shop-image-list">{images.map((image, index) => <article className="shop-image-editor" key={image.id}><div className="shop-image-preview"><Image src={imageUrl(image.storage_path)!} alt={image.alt_text || "Vista previa de la imagen subida"} fill sizes="(max-width: 760px) 85vw, 200px" /></div><div className="admin-fields">
      <label>Tipo<select value={image.image_type} onChange={event => onChange(images.map(item => item.id === image.id ? { ...item, image_type: event.target.value as ImageType } : item))}><option value="original">Original</option><option value="mockup">Mockup / interior</option><option value="detail">Detalle</option></select></label>
      <label>Texto ALT<input maxLength={300} value={image.alt_text} placeholder="Describe lo que aparece en la imagen" onChange={event => onChange(images.map(item => item.id === image.id ? { ...item, alt_text: event.target.value } : item))} /></label>
      <div className="shop-actions wide">{image.image_type === "original" && <button type="button" className="admin-button" aria-pressed={mainPath === image.storage_path} onClick={() => onMainChange(image.storage_path)}>{mainPath === image.storage_path ? "Imagen principal" : "Usar como principal"}</button>}<button type="button" className="admin-button" disabled={index === 0} aria-label={`Mover imagen ${index + 1} antes`} onClick={() => move(index, -1)}>Subir</button><button type="button" className="admin-button" disabled={index === images.length - 1} aria-label={`Mover imagen ${index + 1} después`} onClick={() => move(index, 1)}>Bajar</button><button type="button" className="admin-button" onClick={() => { if (window.confirm("¿Eliminar esta imagen de la obra? El cambio se aplicará al guardar.")) onChange(images.filter(item => item.id !== image.id)); }}>Eliminar imagen</button></div>
    </div></article>)}</div>
  </section>;
}
