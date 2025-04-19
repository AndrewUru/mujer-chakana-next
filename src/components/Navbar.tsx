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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-pink-200 shadow-lg">
      <div className="max-w-md mx-auto flex justify-around items-center py-3 px-4 text-pink-700 text-sm">
        <NavItem href="/" icon={<Home className="w-5 h-5" />} label="Inicio" />
        <NavItem
          href="/dashboard"
          icon={<Moon className="w-5 h-5" />}
          label="Ciclo"
        />
        <NavItem
          href="/setup"
          icon={<Settings className="w-5 h-5" />}
          label="Configurar"
        />

        {loggedIn ? (
          <button
            onClick={handleLogout}
            className="flex flex-col items-center text-pink-700 hover:text-pink-900 transition"
          >
            {avatar ? (
              <Image
                src={avatar}
                alt="avatar"
                width={24}
                height={24}
                className="rounded-full border border-pink-300"
              />
            ) : (
              <LogOut className="w-5 h-5 mb-1" />
            )}
            <span className="text-xs">{avatar ? "Salir" : "Cerrar"}</span>
          </button>
        ) : (
          <NavItem
            href="/auth/login"
            icon={<LogIn className="w-5 h-5" />}
            label="Iniciar"
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
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center text-pink-700 hover:text-pink-900 transition"
    >
      {icon}
      <span className="text-xs">{label}</span>
    </Link>
  );
}
