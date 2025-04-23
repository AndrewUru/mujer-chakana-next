"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Home, Moon, Settings, LogIn, LogOut } from "lucide-react";
import Image from "next/image";

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
    <nav className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-md bg-white/80 dark:bg-pink-950/90 border-t border-pink-200 dark:border-pink-800 shadow-xl rounded-t-2xl">
      <div className="max-w-md mx-auto flex justify-around items-center py-3 px-4 text-pink-700 dark:text-pink-200 text-sm">
        <NavItem href="/" icon={<Home />} label="Inicio" />
        <NavItem href="/dashboard" icon={<Moon />} label="Ciclo" />
        <NavItem href="/setup" icon={<Settings />} label="Configurar" />

        {loggedIn ? (
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 text-pink-700 dark:text-pink-200 hover:text-pink-900 dark:hover:text-white transition animate-pulse"
          >
            {avatar ? (
              <Image
                src={avatar}
                alt="avatar"
                width={28}
                height={28}
                className="rounded-full border-2 border-pink-400 shadow"
              />
            ) : (
              <LogOut className="w-5 h-5" />
            )}
            <span className="text-xs">Salir</span>
          </button>
        ) : (
          <NavItem href="/auth/login" icon={<LogIn />} label="Iniciar" />
        )}
      </div>
    </nav>
  );
}

function NavItem({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-1 text-pink-700 dark:text-pink-200 hover:text-pink-900 dark:hover:text-white transition hover:animate-pulse"
    >
      <div className="w-7 h-7 flex items-center justify-center">{icon}</div>
      <span className="text-xs">{label}</span>
    </Link>
  );
}
