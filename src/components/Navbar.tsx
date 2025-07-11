"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Home, Moon, Settings, LogIn, LogOut, BookOpen } from "lucide-react";
import Image from "next/image";

export default function Navbar() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
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

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Mostrar navbar cuando se hace scroll hacia arriba o está en la parte superior
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        setIsVisible(true);
      } else {
        // Ocultar navbar cuando se hace scroll hacia abajo
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 bg-amber-50/80 backdrop-blur-md border-pink-200 dark:border-pink-800 shadow-xl rounded-t-2xl transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="max-w-md md:max-w-2xl lg:max-w-3xl mx-auto flex justify-around items-center py-1 px-4 text-pink-700 text-sm">
        <NavItem
          href={loggedIn ? "/dashboard" : "/"}
          icon={<Home />}
          label="Inicio"
        />

        <NavItem href="/dashboard" icon={<Moon />} label="Ciclo" />
        <NavItem href="/registros" icon={<BookOpen />} label="Registros" />
        <NavItem href="/setup" icon={<Settings />} label="Configurar" />

        {loggedIn ? (
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-1"
          >
            {avatar ? (
              <Image
                src={avatar}
                alt="avatar"
                width={28}
                height={28}
                className="rounded-full border-2 border-pink-400 dark:border-pink-200 shadow"
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
      className="flex flex-col items-center gap-1 text-pink-700  hover:text-pink-900"
    >
      <div className="w-7 h-7 flex items-center justify-center">{icon}</div>
      <span className="text-xs">{label}</span>
    </Link>
  );
}
