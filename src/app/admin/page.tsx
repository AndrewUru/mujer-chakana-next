"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Search, ChevronLeft, ChevronRight, Plus, Trash2, X } from "lucide-react";

interface Usuario {
  user_id: string;
  display_name: string;
  email: string;
  rol: string;
  suscripcion_activa: boolean;
  tipo_plan?: string;
}
const PAGE_SIZE = 10;
const EMPTY_FORM = { display_name: "", email: "", password: "" };

// Crear y eliminar cuentas requiere privilegios de servidor (/api/admin/users).
async function adminUsersRequest(path: string, init: RequestInit) {
  const { data: { session } } = await supabase.auth.getSession();
  const response = await fetch(path, { ...init, headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token ?? ""}` } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body?.error || "No se pudo completar la operación. Inténtalo de nuevo.");
  return body;
}

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null);
  const [pending, setPending] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [currentUserId, setCurrentUserId] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  // Confirmación en la propia fila: confirm() bloquea el hilo principal.
  const [confirmingId, setConfirmingId] = useState("");
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (!user) { router.replace("/auth/login"); return; }
        const { data: profile, error } = await supabase.from("perfiles").select("rol, display_name").eq("user_id", user.id).single();
        if (error) throw error;
        if (profile?.rol !== "admin") { router.replace("/dashboard"); return; }
        const { data, error: usersError } = await supabase.from("perfiles").select("user_id, email, display_name, rol, tipo_plan, suscripcion_activa").order("display_name").returns<Usuario[]>();
        if (usersError) throw usersError;
        if (!cancelled) { setUserName(profile.display_name ?? ""); setCurrentUserId(user.id); setUsuarios(data ?? []); }
      } catch { if (!cancelled) setNotice({ text: "No se pudo cargar la comunidad. Recarga la página para volver a intentarlo.", error: true }); }
      finally { if (!cancelled) setLoading(false); }
    }
    void load();
    return () => { cancelled = true; };
  }, [router]);

  async function toggleSubscription(user: Usuario) {
    if (pending.includes(user.user_id)) return;
    setPending(prev => [...prev, user.user_id]);
    setNotice(null);
    try {
      const { data, error } = await supabase.from("perfiles").update({ suscripcion_activa: !user.suscripcion_activa }).eq("user_id", user.user_id).select("user_id");
      if (error || !data?.length) throw error ?? new Error("Sin cambios");
      setUsuarios(prev => prev.map(item => item.user_id === user.user_id ? { ...item, suscripcion_activa: !user.suscripcion_activa } : item));
      setNotice({ text: `Suscripción de ${user.display_name || user.email || "la usuaria"} ${user.suscripcion_activa ? "desactivada" : "activada"}.` });
    } catch { setNotice({ text: "No se pudo actualizar la suscripción. Inténtalo de nuevo.", error: true }); }
    finally { setPending(prev => prev.filter(id => id !== user.user_id)); }
  }
  async function createUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (creating) return;
    setCreating(true);
    setNotice(null);
    try {
      const { user } = await adminUsersRequest("/api/admin/users", { method: "POST", body: JSON.stringify(form) });
      setUsuarios(prev => [...prev.filter(item => item.user_id !== user.user_id), user].sort((a, b) => (a.display_name ?? "").localeCompare(b.display_name ?? "", "es")));
      setForm(EMPTY_FORM);
      setFormOpen(false);
      setNotice({ text: `Cuenta de ${user.display_name || user.email} creada. Ya puede iniciar sesión con la contraseña que le has asignado.` });
    } catch (error) { setNotice({ text: error instanceof Error ? error.message : "No se pudo crear la cuenta.", error: true }); }
    finally { setCreating(false); }
  }
  async function deleteUser(user: Usuario) {
    if (pending.includes(user.user_id)) return;
    const name = user.display_name || user.email || "esta usuaria";
    setConfirmingId("");
    setPending(prev => [...prev, user.user_id]);
    setNotice(null);
    try {
      const { cleanupIncomplete } = await adminUsersRequest(`/api/admin/users?id=${encodeURIComponent(user.user_id)}`, { method: "DELETE" });
      setUsuarios(prev => prev.filter(item => item.user_id !== user.user_id));
      setNotice(cleanupIncomplete ? { text: `La cuenta de ${name} se eliminó, pero parte de sus datos de ciclo no se pudo borrar.`, error: true } : { text: `Cuenta de ${name} eliminada.` });
    } catch (error) { setNotice({ text: error instanceof Error ? error.message : "No se pudo eliminar la cuenta.", error: true }); }
    finally { setPending(prev => prev.filter(id => id !== user.user_id)); }
  }
  const normalized = query.trim().toLocaleLowerCase("es");
  const filtered = usuarios.filter(user => `${user.display_name ?? ""} ${user.email ?? ""}`.toLocaleLowerCase("es").includes(normalized) && (status === "all" || user.suscripcion_activa === (status === "active")));
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const active = usuarios.filter(user => user.suscripcion_activa).length;
  return <main className="admin-page">
    <header className="admin-heading"><div><p className="admin-eyebrow">La comunidad, en un vistazo</p><h1>Un espacio para acompañar.</h1><p className="admin-subtitle">Bienvenida{userName ? `, ${userName}` : ""}. Gestiona las usuarias y sus suscripciones.</p></div><button className="admin-button primary" aria-expanded={formOpen} aria-controls="new-user-form" onClick={() => setFormOpen(open => !open)}>{formOpen ? <X size={17} /> : <Plus size={17} />}{formOpen ? "Cerrar" : "Nueva usuaria"}</button></header>
    {notice && <div role={notice.error ? "alert" : "status"} className={`admin-notice ${notice.error ? "error" : ""}`}>{notice.text}</div>}
    {formOpen && <section className="admin-panel" id="new-user-form" aria-labelledby="new-user-title" style={{ marginBottom: 24 }}>
      <div className="admin-panel-heading"><div><h2 id="new-user-title">Nueva usuaria</h2><p className="admin-subtitle">La cuenta queda confirmada al instante: no se envía correo. Comparte tú la contraseña temporal.</p></div></div>
      <form onSubmit={createUser} style={{ padding: "0 24px 24px" }}>
        <div className="admin-fields">
          <label>Nombre<input required minLength={2} maxLength={80} autoComplete="off" value={form.display_name} onChange={e => setForm({ ...form, display_name: e.target.value })} /></label>
          <label>Correo<input required type="email" autoComplete="off" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></label>
          <label className="wide">Contraseña temporal<input required type="text" minLength={6} autoComplete="off" spellCheck={false} placeholder="Mínimo 6 caracteres" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></label>
        </div>
        <div className="admin-card-actions"><button type="submit" className="admin-button primary" disabled={creating}>{creating ? "Creando…" : "Crear cuenta"}</button><button type="button" className="admin-button" disabled={creating} onClick={() => { setForm(EMPTY_FORM); setFormOpen(false); }}>Cancelar</button></div>
      </form>
    </section>}
    <section className="admin-stats" aria-label="Resumen de la comunidad">{[
      ["Usuarias registradas", usuarios.length, "Personas que forman parte del espacio"],
      ["Suscripciones activas", active, "Con acceso habilitado"],
      ["Sin suscripción activa", usuarios.length - active, "Con acceso por activar"],
    ].map(([label, value, description]) => <div className="admin-stat" key={label}><span>{label}</span><strong>{loading ? "—" : value}</strong><small>{description}</small></div>)}</section>
    <section className="admin-panel" aria-labelledby="users-title" aria-busy={loading}>
      <div className="admin-panel-heading"><div><h2 id="users-title">Usuarias</h2><p className="admin-subtitle">Encuentra un perfil y gestiona su acceso.</p></div><span className="admin-badge">{loading ? "…" : filtered.length} perfiles</span></div>
      <div className="admin-toolbar"><label className="admin-search"><Search size={18} aria-hidden="true" /><input aria-label="Buscar por nombre o correo" placeholder="Buscar por nombre o correo…" value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} /></label><select aria-label="Filtrar suscripciones" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}><option value="all">Todas las suscripciones</option><option value="active">Activas</option><option value="inactive">Sin suscripción activa</option></select></div>
      {loading ? <div role="status" className="admin-empty">Cargando la comunidad…</div> : filtered.length === 0 ? <div className="admin-empty"><h3>{usuarios.length ? "No encontramos coincidencias" : "Todavía no hay usuarias"}</h3><p>{usuarios.length ? "Prueba con otro nombre o cambia el filtro." : "Los perfiles aparecerán aquí cuando estén disponibles."}</p>{usuarios.length > 0 && <button className="admin-button" onClick={() => { setQuery(""); setStatus("all"); setPage(1); }}>Limpiar filtros</button>}</div> : <>
        <div className="admin-table-scroll"><table className="admin-table"><thead><tr><th scope="col">Usuaria</th><th scope="col">Rol</th><th scope="col">Plan</th><th scope="col">Suscripción</th><th scope="col">Acciones</th></tr></thead><tbody>{visible.map(user => <tr key={user.user_id}><td><div className="admin-person"><span className="admin-avatar" aria-hidden="true">{(user.display_name || user.email || "U").slice(0, 1).toUpperCase()}</span><div><strong>{user.display_name || "Sin nombre"}</strong><small>{user.email || "Sin correo"}</small></div></div></td><td>{user.rol === "admin" ? "Administradora" : user.rol || "Usuaria"}</td><td>{user.tipo_plan || "Sin plan"}</td><td><span className={`admin-badge ${user.suscripcion_activa ? "active" : ""}`}>{user.suscripcion_activa ? "Activa" : "Inactiva"}</span></td><td>{confirmingId === user.user_id ? <div role="group" aria-label={`Confirmar eliminación de ${user.display_name || user.email}`} style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}><small style={{ flexBasis: "100%", color: "#9b3446" }}>Se borrarán su perfil, ciclos y registros. No se puede deshacer.</small><button className="admin-button danger" autoFocus onClick={() => deleteUser(user)}><Trash2 size={15} /> Sí, eliminar</button><button className="admin-button" onClick={() => setConfirmingId("")}>Cancelar</button></div> : <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><button className="admin-button" disabled={pending.includes(user.user_id)} aria-label={`${user.suscripcion_activa ? "Desactivar" : "Activar"} suscripción de ${user.display_name || user.email}`} onClick={() => toggleSubscription(user)}>{pending.includes(user.user_id) ? "Actualizando…" : user.suscripcion_activa ? "Desactivar" : "Activar"}</button>{user.user_id !== currentUserId && <button className="admin-button danger" disabled={pending.includes(user.user_id)} aria-label={`Eliminar la cuenta de ${user.display_name || user.email}`} onClick={() => setConfirmingId(user.user_id)}><Trash2 size={15} /> Eliminar</button>}</div>}</td></tr>)}</tbody></table></div>
        <footer className="admin-pagination"><span>{(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} de {filtered.length} usuarias</span><div><button className="admin-button" aria-label="Página anterior" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}><ChevronLeft size={16} /></button><span>{currentPage} / {pages}</span><button className="admin-button" aria-label="Página siguiente" disabled={currentPage === pages} onClick={() => setPage(currentPage + 1)}><ChevronRight size={16} /></button></div></footer>
      </>}
    </section>
  </main>;
}
