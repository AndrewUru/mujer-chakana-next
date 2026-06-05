"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Home, Moon, Settings, LogIn, LogOut, BookOpen } from "lucide-react";
import Image from "next/image";

const navItemBase =
  "group flex min-w-[58px] flex-col items-center gap-1 rounded-2xl px-2 py-1.5 text-xs font-semibold transition-all duration-300";

const navIconBase =
  "flex h-8 w-8 items-center justify-center rounded-2xl border transition-all duration-300";

export default function Navbar() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user;
      setLoggedIn(!!user);

      if (user) {
        const { data } = await supabase
          .from("perfiles")
          .select("avatar_url")
          .eq("user_id", user.id)
          .single();
        setAvatar(data?.avatar_url ?? null);
      }
    });
  }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <nav className="glass fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom))] left-3 right-3 z-50 rounded-[26px] border-rose-100/60 px-2 py-1.5 sm:bottom-[calc(1.25rem+env(safe-area-inset-bottom))] sm:left-1/2 sm:right-auto sm:w-[min(720px,calc(100%-40px))] sm:-translate-x-1/2">
      <div className="mx-auto flex max-w-md items-center justify-around gap-1 text-pink-700 sm:max-w-none sm:gap-2">
        <NavItem
          href={loggedIn ? "/dashboard" : "/"}
          icon={<Home />}
          label="Inicio"
          active={pathname === "/" || pathname.startsWith("/bienvenida")}
        />

        <NavItem
          href="/dashboard"
          icon={<Moon />}
          label="Ciclo"
          active={pathname === "/dashboard" || pathname === "/ciclo"}
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
          label="Configurar"
          active={pathname.startsWith("/setup")}
        />

        {loggedIn ? (
          <button
            onClick={handleLogout}
            className={`${navItemBase} text-rose-600 hover:bg-white/40 hover:text-rose-900`}
          >
            {avatar ? (
              <Image
                src={avatar}
                alt="avatar"
                width={28}
                height={28}
                className="rounded-full border-2 border-white/70 shadow-[0_8px_20px_rgba(143,21,85,0.16)] ring-1 ring-rose-200/60"
              />
            ) : (
              <span className={`${navIconBase} border-rose-100/70 bg-white/45`}>
                <LogOut className="h-5 w-5" />
              </span>
            )}
            <span className="text-xs">Salir</span>
          </button>
        ) : (
          <NavItem
            href="/auth/login"
            icon={<LogIn />}
            label="Iniciar"
            active={pathname.startsWith("/auth/login")}
          />
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
