"use client";
import { useEffect, useState } from "react";
import { Save, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
type FaseLunar = { id: string; color: string; rango_inicio: number; rango_fin: number; mensaje: string; nombre_fase: string; simbolo: string; };
export default function EditarMoonboardPage() {
  const [fases, setFases] = useState<FaseLunar[]>([]);
  const [dirty, setDirty] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null);
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const { data, error } = await supabase.from("fases_lunares").select("*").order("rango_inicio").returns<FaseLunar[]>();
        if (error) throw error;
        if (!cancelled) setFases(data ?? []);
      } catch { if (!cancelled) setNotice({ text: "No se pudieron cargar las fases. Recarga la página para intentarlo de nuevo.", error: true }); }
      finally { if (!cancelled) setLoading(false); }
    }
    void load(); return () => { cancelled = true; };
  }, []);
  useEffect(() => {
    if (!dirty.length) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty.length]);
  function update(id: string, field: keyof FaseLunar, value: string | number) {
    setFases(prev => prev.map(fase => fase.id === id ? { ...fase, [field]: value } : fase));
    setDirty(prev => prev.includes(id) ? prev : [...prev, id]); setNotice(null);
  }
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setNotice(null);
    const saved: string[] = [];
    try {
      for (const fase of fases.filter(item => dirty.includes(item.id))) {
        if (!fase.nombre_fase.trim() || !Number.isFinite(fase.rango_inicio) || !Number.isFinite(fase.rango_fin) || fase.rango_inicio > fase.rango_fin) throw new Error("Revisa los nombres y rangos: el inicio debe ser menor o igual que el final.");
        const { id, ...values } = fase;
        const { data, error } = await supabase.from("fases_lunares").update(values).eq("id", id).select("id");
        if (error || !data?.length) throw new Error("No se pudieron guardar todas las fases. Los cambios pendientes se conservan para volver a intentarlo.");
        saved.push(id);
      }
      setNotice({ text: "Todos los cambios se han guardado." });
    } catch (error) { setNotice({ text: error instanceof Error ? error.message : "No se pudieron guardar los cambios.", error: true }); }
    finally { setDirty(prev => prev.filter(id => !saved.includes(id))); setBusy(false); }
  }
  async function remove(fase: FaseLunar) {
    if (!confirm(`¿Eliminar la fase «${fase.nombre_fase}»? Esta acción no se puede deshacer.`)) return;
    setBusy(true); setNotice(null);
    try {
      const { data, error } = await supabase.from("fases_lunares").delete().eq("id", fase.id).select("id");
      if (error || !data?.length) throw error ?? new Error("Sin cambios");
      setFases(prev => prev.filter(item => item.id !== fase.id)); setDirty(prev => prev.filter(id => id !== fase.id));
      setNotice({ text: "Fase eliminada correctamente." });
    } catch { setNotice({ text: "No se pudo eliminar la fase. Inténtalo de nuevo.", error: true }); }
    finally { setBusy(false); }
  }
  return <main className="admin-page"><form onSubmit={save}>
    <header className="admin-heading"><div><p className="admin-eyebrow">El ritmo de la luna</p><h1>Moonboard.</h1><p className="admin-subtitle">Edita las fases y sus mensajes. Guarda cuando estén listos.</p></div><button type="submit" className="admin-button primary" disabled={loading || busy || !dirty.length}><Save size={17} />{busy ? "Procesando…" : "Guardar cambios"}</button></header>
    {notice && <div role={notice.error ? "alert" : "status"} className={`admin-notice ${notice.error ? "error" : ""}`}>{notice.text}</div>}
    <p className="admin-subtitle" role="status" style={{ marginBottom: 24 }}>{dirty.length ? `${dirty.length} fases con cambios sin guardar` : "No hay cambios pendientes"}</p>
    {loading ? <div className="admin-empty" role="status">Cargando fases lunares…</div> : !fases.length ? <div className="admin-empty">No hay fases lunares disponibles.</div> : <div className="admin-grid">{fases.map((fase, index) => <fieldset key={fase.id} disabled={busy} className="admin-card"><legend className="admin-eyebrow" style={{ padding: "0 8px" }}>Fase {String(index + 1).padStart(2, "0")}{dirty.includes(fase.id) ? " · Sin guardar" : ""}</legend><div className="admin-fields">
      <label className="wide">Nombre de la fase<input required value={fase.nombre_fase || ""} onChange={e => update(fase.id, "nombre_fase", e.target.value)} /></label>
      <label>Color<input required placeholder="#783c59" value={fase.color || ""} onChange={e => update(fase.id, "color", e.target.value)} /></label>
      <label>Símbolo<input value={fase.simbolo || ""} onChange={e => update(fase.id, "simbolo", e.target.value)} /></label>
      <label>Inicio del rango<input type="number" step="any" required value={Number.isFinite(fase.rango_inicio) ? fase.rango_inicio : ""} onChange={e => update(fase.id, "rango_inicio", e.target.valueAsNumber)} /></label>
      <label>Final del rango<input type="number" step="any" required min={Number.isFinite(fase.rango_inicio) ? fase.rango_inicio : undefined} value={Number.isFinite(fase.rango_fin) ? fase.rango_fin : ""} onChange={e => update(fase.id, "rango_fin", e.target.valueAsNumber)} /></label>
      <label className="wide">Mensaje para la comunidad<textarea rows={4} value={fase.mensaje || ""} onChange={e => update(fase.id, "mensaje", e.target.value)} /></label>
    </div><div className="admin-card-actions"><button type="button" className="admin-button danger" onClick={() => remove(fase)}><Trash2 size={15} /> Eliminar fase</button></div></fieldset>)}</div>}
  </form></main>;
}
