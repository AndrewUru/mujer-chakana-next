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

const navItemBase =
  "group flex min-h-[58px] min-w-[58px] flex-col items-center justify-center gap-1 rounded-2xl px-2 py-1.5 text-xs font-semibold transition-all duration-300";

const navIconBase =
  "flex h-8 w-8 items-center justify-center rounded-2xl border transition-all duration-300";

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
      className="glass fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom))] left-3 right-3 z-50 rounded-[26px] border-rose-100/60 px-2 py-1.5 sm:bottom-[calc(1.25rem+env(safe-area-inset-bottom))] sm:left-1/2 sm:right-auto sm:w-[min(720px,calc(100%-40px))] sm:-translate-x-1/2"
    >
      <div className="mx-auto flex max-w-md items-center justify-around gap-1 text-pink-700 sm:max-w-none sm:gap-2">
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
              className={`${navItemBase} text-rose-600 hover:bg-white/40 hover:text-rose-900`}
              aria-label="Cerrar sesión"
            >
              {avatar ? (
                <Image
                  src={avatar}
                  alt="Tu perfil"
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full border-2 border-white/70 object-cover shadow-[0_8px_20px_rgba(143,21,85,0.16)] ring-1 ring-rose-200/60"
                />
              ) : (
                <span className={`${navIconBase} border-rose-100/70 bg-white/45`}>
                  <LogOut className="h-5 w-5" />
                </span>
              )}
              <span className="text-xs">Salir</span>
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
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      aria-label={label}
      className={`${navItemBase} ${
        active
          ? "bg-white/55 text-rose-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_10px_24px_rgba(143,21,85,0.12)]"
          : "text-rose-600 hover:bg-white/40 hover:text-rose-900"
      }`}
    >
      <div
        className={`${navIconBase} ${
          active
            ? "border-rose-200/80 bg-rose-100/60 text-rose-700"
            : "border-white/50 bg-white/30 text-rose-500 group-hover:border-rose-100/80 group-hover:bg-white/60"
        }`}
      >
        {icon}
      </div>
      <span className="text-xs">{label}</span>
    </Link>
  );
}
