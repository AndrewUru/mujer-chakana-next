"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Search, ChevronLeft, ChevronRight, Users } from "lucide-react";

interface Usuario {
  user_id: string;
  display_name: string;
  email: string;
  rol: string;
  suscripcion_activa: boolean;
  tipo_plan?: string;
}
const PAGE_SIZE = 10;

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
        if (!cancelled) { setUserName(profile.display_name ?? ""); setUsuarios(data ?? []); }
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
  const normalized = query.trim().toLocaleLowerCase("es");
  const filtered = usuarios.filter(user => `${user.display_name ?? ""} ${user.email ?? ""}`.toLocaleLowerCase("es").includes(normalized) && (status === "all" || user.suscripcion_activa === (status === "active")));
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const active = usuarios.filter(user => user.suscripcion_activa).length;
  return <main className="admin-page">
    <header className="admin-heading"><div><p className="admin-eyebrow">La comunidad, en un vistazo</p><h1>Un espacio para acompañar.</h1><p className="admin-subtitle">Bienvenida{userName ? `, ${userName}` : ""}. Gestiona las usuarias y sus suscripciones.</p></div><span className="admin-badge"><Users size={14} /> Comunidad</span></header>
    {notice && <div role={notice.error ? "alert" : "status"} className={`admin-notice ${notice.error ? "error" : ""}`}>{notice.text}</div>}
    <section className="admin-stats" aria-label="Resumen de la comunidad">{[
      ["Usuarias registradas", usuarios.length, "Personas que forman parte del espacio"],
      ["Suscripciones activas", active, "Con acceso habilitado"],
      ["Sin suscripción activa", usuarios.length - active, "Con acceso por activar"],
    ].map(([label, value, description]) => <div className="admin-stat" key={label}><span>{label}</span><strong>{loading ? "—" : value}</strong><small>{description}</small></div>)}</section>
    <section className="admin-panel" aria-labelledby="users-title" aria-busy={loading}>
      <div className="admin-panel-heading"><div><h2 id="users-title">Usuarias</h2><p className="admin-subtitle">Encuentra un perfil y gestiona su acceso.</p></div><span className="admin-badge">{loading ? "…" : filtered.length} perfiles</span></div>
      <div className="admin-toolbar"><label className="admin-search"><Search size={18} aria-hidden="true" /><input aria-label="Buscar por nombre o correo" placeholder="Buscar por nombre o correo…" value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} /></label><select aria-label="Filtrar suscripciones" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}><option value="all">Todas las suscripciones</option><option value="active">Activas</option><option value="inactive">Sin suscripción activa</option></select></div>
      {loading ? <div role="status" className="admin-empty">Cargando la comunidad…</div> : filtered.length === 0 ? <div className="admin-empty"><h3>{usuarios.length ? "No encontramos coincidencias" : "Todavía no hay usuarias"}</h3><p>{usuarios.length ? "Prueba con otro nombre o cambia el filtro." : "Los perfiles aparecerán aquí cuando estén disponibles."}</p>{usuarios.length > 0 && <button className="admin-button" onClick={() => { setQuery(""); setStatus("all"); setPage(1); }}>Limpiar filtros</button>}</div> : <>
        <div className="admin-table-scroll"><table className="admin-table"><thead><tr><th scope="col">Usuaria</th><th scope="col">Rol</th><th scope="col">Plan</th><th scope="col">Suscripción</th><th scope="col">Acción</th></tr></thead><tbody>{visible.map(user => <tr key={user.user_id}><td><div className="admin-person"><span className="admin-avatar" aria-hidden="true">{(user.display_name || user.email || "U").slice(0, 1).toUpperCase()}</span><div><strong>{user.display_name || "Sin nombre"}</strong><small>{user.email || "Sin correo"}</small></div></div></td><td>{user.rol === "admin" ? "Administradora" : user.rol || "Usuaria"}</td><td>{user.tipo_plan || "Sin plan"}</td><td><span className={`admin-badge ${user.suscripcion_activa ? "active" : ""}`}>{user.suscripcion_activa ? "Activa" : "Inactiva"}</span></td><td><button className="admin-button" disabled={pending.includes(user.user_id)} aria-label={`${user.suscripcion_activa ? "Desactivar" : "Activar"} suscripción de ${user.display_name || user.email}`} onClick={() => toggleSubscription(user)}>{pending.includes(user.user_id) ? "Actualizando…" : user.suscripcion_activa ? "Desactivar" : "Activar"}</button></td></tr>)}</tbody></table></div>
        <footer className="admin-pagination"><span>{(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} de {filtered.length} usuarias</span><div><button className="admin-button" aria-label="Página anterior" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}><ChevronLeft size={16} /></button><span>{currentPage} / {pages}</span><button className="admin-button" aria-label="Página siguiente" disabled={currentPage === pages} onClick={() => setPage(currentPage + 1)}><ChevronRight size={16} /></button></div></footer>
      </>}
    </section>
  </main>;
}
