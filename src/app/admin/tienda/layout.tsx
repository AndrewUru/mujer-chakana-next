"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { requireShopAdmin, shopError } from "@/lib/shop/admin";
import "./shop-admin.css";

export default function ShopAdminLayout({ children }: { children: React.ReactNode }) {
  const [access, setAccess] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    async function check() {
      try { await requireShopAdmin(); if (active) { setAccess(true); setError(""); } }
      catch (failure) { if (active) { setAccess(false); setError(shopError(failure)); } }
    }
    void check();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => { setAccess(false); setTimeout(() => { if (active) void check(); }, 0); });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);
  if (error) return <main className="admin-page"><h1>Administración de la tienda</h1><p role="alert" className="admin-notice error">{error}</p><Link className="admin-button" href="/auth/login">Ir a iniciar sesión</Link></main>;
  if (!access) return <div className="admin-empty" role="status">Comprobando tus permisos…</div>;
  return children;
}
