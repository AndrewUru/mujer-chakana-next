"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowUpRight, BookOpen, Flower2, Moon, StickyNote, Users, Store } from "lucide-react";
import BrandLogo from "@/components/ui/BrandLogo";
import { supabase } from "@/lib/supabaseClient";
import "./admin.css";

const sections = [
  { href: "/admin", label: "Comunidad", icon: Users },
  { href: "/admin/arquetipos", label: "Arquetipos", icon: Flower2 },
  { href: "/admin/recursos", label: "Recursos", icon: BookOpen },
  { href: "/admin/moonboard", label: "Moonboard", icon: Moon },
  { href: "/admin/pizarra", label: "Pizarra", icon: StickyNote },
  { href: "/admin/tienda", label: "Tienda", icon: Store },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  // Todas las secciones exigen rol admin antes de mostrar nada: las páginas
  // hijas no tienen que repetir la comprobación.
  const [access, setAccess] = useState<"checking" | "granted" | "error">("checking");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { router.replace("/auth/login"); return; }
        const { data: profile, error } = await supabase.from("perfiles").select("rol").eq("user_id", session.user.id).maybeSingle();
        if (error) throw error;
        if (profile?.rol !== "admin") { router.replace("/dashboard"); return; }
        if (!cancelled) setAccess("granted");
      } catch { if (!cancelled) setAccess("error"); }
    }
    void check();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(event => {
      if (event === "SIGNED_OUT") router.replace("/auth/login");
    });
    return () => { cancelled = true; subscription.unsubscribe(); };
  }, [router, attempt]);

  if (access !== "granted") return (
    <div className="admin-workspace">
      <div className="admin-content">
        {access === "checking"
          ? <div className="admin-empty" role="status">Comprobando tus permisos…</div>
          : <main className="admin-page"><p role="alert" className="admin-notice error">No pudimos comprobar tus permisos. Revisa tu conexión y vuelve a intentarlo.</p><button className="admin-button" onClick={() => { setAccess("checking"); setAttempt(value => value + 1); }}>Reintentar</button></main>}
      </div>
    </div>
  );

  return (
    <div className="admin-workspace">
      <aside className="admin-sidebar">
        <div className="admin-brand"><BrandLogo href="/admin" /><small>ESPACIO DE ADMINISTRACIÓN</small></div>
        <p className="admin-eyebrow sidebar-label">Tu espacio de gestión</p>
        <nav aria-label="Administración">
          {sections.map(({ href, label, icon: Icon }) => {
            const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
            return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`admin-nav-item ${active ? "is-active" : ""}`}><Icon size={19} strokeWidth={1.6} />{label}</Link>;
          })}
        </nav>
        <div className="admin-sidebar-footer"><p>Cuidar el espacio.<br />Acompañar la comunidad.</p><Link href="/dashboard">Volver a la aplicación <ArrowUpRight size={16} /></Link></div>
      </aside>
      <div className="admin-content"><div className="admin-topbar"><span>Ginergética / Administración</span><Link href="/dashboard">Ver aplicación <ArrowUpRight size={14} /></Link></div>{children}</div>
    </div>
  );
}
