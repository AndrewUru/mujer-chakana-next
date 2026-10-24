"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Pencil, Trash2, Search, FileText } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
interface Arquetipo { id: number; arquetipo: string; elemento: string; descripcion: string; imagen_url?: string; audio_url?: string; ritual_pdf?: string; }
export default function AdminMujerChakanaPage() {
  const [items, setItems] = useState<Arquetipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState<number | null>(null);
  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null);
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const { data, error } = await supabase.from("mujer_chakana").select("*").order("arquetipo");
        if (error) throw error;
        if (!cancelled) setItems(data ?? []);
      } catch { if (!cancelled) setNotice({ text: "No se pudieron cargar los arquetipos. Recarga la página para volver a intentarlo.", error: true }); }
      finally { if (!cancelled) setLoading(false); }
    }
    void load(); return () => { cancelled = true; };
  }, []);
  async function remove(item: Arquetipo) {
    if (!confirm(`¿Eliminar «${item.arquetipo}»? Esta acción no se puede deshacer.`)) return;
    setPending(item.id); setNotice(null);
    try {
      const { data, error } = await supabase.from("mujer_chakana").delete().eq("id", item.id).select("id");
      if (error || !data?.length) throw error ?? new Error("Sin cambios");
      setItems(prev => prev.filter(value => value.id !== item.id)); setNotice({ text: "Arquetipo eliminado correctamente." });
    } catch { setNotice({ text: "No se pudo eliminar el arquetipo. Inténtalo de nuevo.", error: true }); }
    finally { setPending(null); }
  }
  const filtered = items.filter(item => `${item.arquetipo} ${item.elemento}`.toLocaleLowerCase("es").includes(query.trim().toLocaleLowerCase("es")));
  return <main className="admin-page"><header className="admin-heading"><div><p className="admin-eyebrow">La esencia de cada arquetipo</p><h1>Mujer Chakana.</h1><p className="admin-subtitle">Cuida las historias, los rituales y los elementos de cada arquetipo.</p></div><span className="admin-badge">{items.length} arquetipos</span></header>
    {notice && <div role={notice.error ? "alert" : "status"} className={`admin-notice ${notice.error ? "error" : ""}`}>{notice.text}</div>}
    <div className="admin-toolbar" style={{ padding: "0 0 24px" }}><label className="admin-search"><Search size={18} /><input value={query} onChange={e => setQuery(e.target.value)} aria-label="Buscar arquetipos" placeholder="Buscar por arquetipo o elemento…" /></label></div>
    {loading ? <div role="status" className="admin-empty">Cargando arquetipos…</div> : !filtered.length ? <div className="admin-empty">{items.length ? "No encontramos arquetipos con esa búsqueda." : "Todavía no hay arquetipos registrados."}</div> : <section className="admin-grid" aria-label="Arquetipos">{filtered.map(item => <article className="admin-card" key={item.id}><div className="admin-archetype-heading">{item.imagen_url && <Image src={item.imagen_url} alt={`Arquetipo ${item.arquetipo}`} width={80} height={80} className="admin-archetype-image" />}<div><span className="admin-badge">{item.elemento || "Sin elemento"}</span><h2 style={{ marginTop: 12 }}>{item.arquetipo}</h2></div></div><p>{item.descripcion || "Sin descripción."}</p>{item.audio_url && <audio controls preload="none" aria-label={`Audio de ${item.arquetipo}`} style={{ width: "100%" }} src={item.audio_url} />}{item.ritual_pdf && <a className="admin-button" style={{ marginTop: 12 }} href={item.ritual_pdf} target="_blank" rel="noopener noreferrer"><FileText size={15} /> Ver ritual PDF</a>}<div className="admin-card-actions"><Link className="admin-button" href={`/admin/mujer-chakana/editar/${item.id}`}><Pencil size={15} /> Editar</Link><button className="admin-button danger" disabled={pending !== null} onClick={() => remove(item)} aria-label={`Eliminar ${item.arquetipo}`}><Trash2 size={15} />{pending === item.id ? "Eliminando…" : "Eliminar"}</button></div></article>)}</section>}
  </main>;
}
