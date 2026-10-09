"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  BookOpen,
  Home,
  Library,
  LogIn,
  LogOut,
  Moon,
  Settings,
} from "lucide-react";
import Image from "next/image";
import type { Session } from "@supabase/supabase-js";
import { preparePageTransition, usePageTransition } from "./PageTransition";

import styles from "./Navbar.module.css";

export default function Navbar() {
  const [authStatus, setAuthStatus] = useState<
    "loading" | "authenticated" | "anonymous"
  >("loading");
  const [avatar, setAvatar] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const applySession = async (session: Session | null) => {
      if (!mounted) return;
      const user = session?.user;
      setAuthStatus(user ? "authenticated" : "anonymous");

      if (!user) {
        setAvatar(null);
        return;
      }

      const { data } = await supabase
        .from("perfiles")
        .select("avatar_url")
        .eq("user_id", user.id)
        .maybeSingle();

      if (mounted) setAvatar(data?.avatar_url ?? null);
    };

    void supabase.auth.getSession().then(({ data: { session } }) =>
      applySession(session)
    );
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void applySession(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/auth/login");
  };

  const hideNavigation =
    pathname === "/" ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/bienvenida") ||
    pathname.startsWith("/politica-cookies");

  if (hideNavigation || authStatus === "loading") return null;

  const loggedIn = authStatus === "authenticated";

  return (
    <nav
      aria-label="Navegación principal"
      className={styles.dock}
    >
      <div className={styles.items}>
        {loggedIn ? (
          <>
            <NavItem
              href="/dashboard"
              icon={<Home />}
              label="Hoy"
              active={pathname === "/dashboard"}
            />
            <NavItem
              href="/ciclo"
              icon={<Moon />}
              label="Ciclo"
              active={pathname === "/ciclo"}
            />
            <NavItem
              href="/registros"
              icon={<BookOpen />}
              label="Registros"
              active={pathname.startsWith("/registros")}
            />
            <NavItem
              href="/setup"
              icon={<Settings />}
              label="Perfil"
              active={pathname.startsWith("/setup")}
            />
            <button
              type="button"
              onClick={handleLogout}
              className={`${styles.item} ${styles.logout}`}
              aria-label="Cerrar sesión"
            >
              {avatar ? (
                <Image
                  src={avatar}
                  alt=""
                  width={32}
                  height={32}
                  className={styles.avatar}
                />
              ) : (
                <span className={styles.icon}>
                  <LogOut className="h-5 w-5" />
                </span>
              )}
              <span className={styles.label}>Salir</span>
            </button>
          </>
        ) : (
          <>
            <NavItem href="/" icon={<Home />} label="Inicio" />
            <NavItem
              href="/recursos"
              icon={<Library />}
              label="Recursos"
              active={pathname.startsWith("/recursos")}
            />
            <NavItem
              href="/manual"
              icon={<BookOpen />}
              label="Guía"
              active={pathname.startsWith("/manual")}
            />
            <NavItem href="/auth/login" icon={<LogIn />} label="Entrar" />
          </>
        )}
      </div>
    </nav>
  );
}

function NavItem({
  href,
  icon,
  label,
  active = false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  const navigate = usePageTransition();

  return (
    <Link
      href={href}
      onPointerEnter={preparePageTransition}
      onFocus={preparePageTransition}
      onNavigate={(event) => {
        if (navigate?.(href, label)) event.preventDefault();
      }}
      aria-current={active ? "page" : undefined}
      aria-label={label}
      className={`${styles.item} ${active ? styles.active : ""}`}
    >
      <span className={styles.icon} aria-hidden="true">{icon}</span>
      <span className={styles.label}>{label}</span>
    </Link>
  );
}
