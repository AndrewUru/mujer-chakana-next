"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, BookOpen, Flower2, Moon, Users } from "lucide-react";
import "./admin.css";

const sections = [
  { href: "/admin", label: "Comunidad", icon: Users },
  { href: "/admin/mujer-chakana", label: "Mujer Chakana", icon: Flower2 },
  { href: "/admin/recursos", label: "Recursos", icon: BookOpen },
  { href: "/admin/moonboard", label: "Moonboard", icon: Moon },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="admin-workspace">
      <aside className="admin-sidebar">
        <Link href="/admin" className="admin-brand"><Flower2 size={30} strokeWidth={1.3} /><span>Ginergética<small>ESPACIO DE ADMINISTRACIÓN</small></span></Link>
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
