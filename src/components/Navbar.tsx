"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  BookOpen,
  Home,
  Library,
  LogIn,
  Moon,
  Store,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import type { Session } from "@supabase/supabase-js";
import { usePageTransition } from "./PageTransition";

import { useCart } from "./shop/CartProvider";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const [authStatus, setAuthStatus] = useState<
    "loading" | "authenticated" | "anonymous"
  >("loading");
  const [avatar, setAvatar] = useState<string | null>(null);
  const pathname = usePathname();
  const cart = useCart();

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

  const hideNavigation =
    pathname === "/" ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/bienvenida") ||
    pathname.startsWith("/politica-cookies");

  if (hideNavigation || authStatus === "loading") return null;

  const loggedIn = authStatus === "authenticated";
  const onShop = pathname.startsWith("/tienda") || pathname === "/carrito";

  return (
    <nav
      aria-label="Navegación principal"
      className={`${styles.dock} ${onShop ? styles.gardenDock : ""}`}
      data-tone={onShop ? "paper" : "night"}
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
          </>
        )}
        <NavItem
          href="/tienda"
          icon={<Store />}
          label="Tienda"
          badge={cart.count}
          active={onShop}
        />
        {loggedIn ? (
          <NavItem
            href="/setup"
            icon={
              avatar ? (
                <Image src={avatar} alt="" width={32} height={32} className={styles.avatar} />
              ) : (
                <UserRound />
              )
            }
            label="Perfil"
            active={pathname.startsWith("/setup")}
          />
        ) : (
          <NavItem href="/auth/login" icon={<LogIn />} label="Entrar" />
        )}
      </div>
    </nav>
  );
}

function NavItem({
  href,
  icon,
  label,
  badge = 0,
  active = false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
  active?: boolean;
}) {
  const navigate = usePageTransition();

  return (
    <Link
      href={href}
      onNavigate={(event) => {
        if (navigate?.(href, label)) event.preventDefault();
      }}
      aria-current={active ? "page" : undefined}
      aria-label={badge ? `${label}, ${badge} en el carrito` : undefined}
      className={`${styles.item} ${active ? styles.active : ""}`}
    >
      <span className={styles.icon} aria-hidden="true">
        {icon}
        {badge > 0 && <span className={styles.badge}>{badge > 9 ? "9+" : badge}</span>}
      </span>
      <span className={styles.label}>{label}</span>
    </Link>
  );
}
