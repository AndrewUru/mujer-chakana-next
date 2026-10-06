"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Plus, Pencil, Trash2, BookOpen } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
interface Recurso { id: number; titulo: string; tipo: string; descripcion: string; url?: string; }
export default function RecursosAdminPage() {
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [tipo, setTipo] = useState("");
  const [pending, setPending] = useState<number | null>(null);
  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null);
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const { data, error } = await supabase.from("recursos").select("*").order("titulo");
        if (error) throw error;
        if (!cancelled) setRecursos(data ?? []);
      } catch { if (!cancelled) setNotice({ text: "No se pudieron cargar los recursos. Recarga la página para intentarlo de nuevo.", error: true }); }
      finally { if (!cancelled) setLoading(false); }
    }
    void load(); return () => { cancelled = true; };
  }, []);
  async function remove(recurso: Recurso) {
    if (!confirm(`¿Eliminar «${recurso.titulo}»? Esta acción no se puede deshacer.`)) return;
    setPending(recurso.id); setNotice(null);
    try {
      const { data, error } = await supabase.from("recursos").delete().eq("id", recurso.id).select("id");
      if (error || !data?.length) throw error ?? new Error("Sin cambios");
      setRecursos(prev => prev.filter(item => item.id !== recurso.id));
      setNotice({ text: "Recurso eliminado correctamente." });
    } catch { setNotice({ text: "No se pudo eliminar el recurso. Inténtalo de nuevo.", error: true }); }
    finally { setPending(null); }
  }
  const filtered = recursos.filter(item => `${item.titulo} ${item.descripcion}`.toLocaleLowerCase("es").includes(query.trim().toLocaleLowerCase("es")) && (!tipo || item.tipo === tipo));
  return <main className="admin-page">
    <header className="admin-heading"><div><p className="admin-eyebrow">Biblioteca de la comunidad</p><h1>Recursos para crecer.</h1><p className="admin-subtitle">Organiza los materiales que acompañan cada experiencia.</p></div><Link href="/admin/recursos/nuevo" className="admin-button primary"><Plus size={17} /> Nuevo recurso</Link></header>
    {notice && <div role={notice.error ? "alert" : "status"} className={`admin-notice ${notice.error ? "error" : ""}`}>{notice.text}</div>}
    <section className="admin-panel" style={{ marginBottom: 24 }}><div className="admin-panel-heading"><h2>Biblioteca</h2><span className="admin-badge">{filtered.length} recursos</span></div><div className="admin-toolbar"><label className="admin-search"><Search size={18} /><input aria-label="Buscar recursos" value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar un título o una descripción…" /></label><select value={tipo} onChange={e => setTipo(e.target.value)} aria-label="Filtrar por tipo"><option value="">Todos los formatos</option>{Array.from(new Set(recursos.map(item => item.tipo))).filter(Boolean).sort().map(value => <option key={value} value={value}>{value}</option>)}</select></div></section>
    {loading ? <div role="status" className="admin-empty">Cargando recursos…</div> : !filtered.length ? <div className="admin-empty"><BookOpen size={30} style={{ margin: "0 auto 16px" }} /><h2>{recursos.length ? "No encontramos coincidencias" : "Tu biblioteca empieza aquí"}</h2><p>{recursos.length ? "Prueba otra búsqueda o cambia el formato." : "Añade el primer recurso para la comunidad."}</p></div> : <section className="admin-grid" aria-label="Recursos">{filtered.map(item => <article key={item.id} className="admin-card"><span className="admin-badge">{item.tipo || "Recurso"}</span><h2 style={{ marginTop: 16 }}>{item.titulo}</h2><p>{item.descripcion || "Sin descripción."}</p><div className="admin-card-actions"><Link className="admin-button" href={`/admin/recursos/editar/${item.id}`}><Pencil size={15} /> Editar</Link><button className="admin-button danger" disabled={pending !== null} onClick={() => remove(item)} aria-label={`Eliminar ${item.titulo}`}><Trash2 size={15} />{pending === item.id ? "Eliminando…" : "Eliminar"}</button></div></article>)}</section>}
  </main>;
}
