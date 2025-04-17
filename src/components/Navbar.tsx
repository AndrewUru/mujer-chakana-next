"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Home, Moon, Settings, LogIn, LogOut } from "lucide-react";

export default function Navbar() {
  const [loggedIn, setLoggedIn] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setLoggedIn(!!session?.user);
    });
  }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-pink-200 shadow-lg">
      <div className="max-w-md mx-auto flex justify-around items-center py-3 px-4 text-pink-700 text-sm">
        <Link
          href="/"
          className="flex flex-col items-center hover:text-pink-900 transition"
        >
          <Home className="w-5 h-5 mb-1" />
          Inicio
        </Link>

        <Link
          href="/dashboard"
          className="flex flex-col items-center hover:text-pink-900 transition"
        >
          <Moon className="w-5 h-5 mb-1" />
          Ciclo
        </Link>

        <Link
          href="/setup"
          className="flex flex-col items-center hover:text-pink-900 transition"
        >
          <Settings className="w-5 h-5 mb-1" />
          Configurar
        </Link>

        {loggedIn ? (
          <button
            onClick={handleLogout}
            className="flex flex-col items-center hover:text-pink-900 transition"
          >
            <LogOut className="w-5 h-5 mb-1" />
            Salir
          </button>
        ) : (
          <Link
            href="/login"
            className="flex flex-col items-center hover:text-pink-900 transition"
          >
            <LogIn className="w-5 h-5 mb-1" />
            Iniciar
          </Link>
        )}
      </div>
    </nav>
  );
}
