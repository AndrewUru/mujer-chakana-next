"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const prefix = "chakana:resource-favorites:v1:";
function read(key: string): string[] {
  const parsed: unknown = JSON.parse(localStorage.getItem(key) ?? "[]");
  if (!Array.isArray(parsed) || !parsed.every(value => typeof value === "string")) throw new Error("Invalid favorites");
  return [...new Set(parsed)];
}

export function useResourceFavorites() {
  const [userId, setUserId] = useState<string | null>(null);
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    let revision = 0;
    let currentUserId: string | null = null;
    function apply(id: string | null) {
      if (!active) return;
      currentUserId = id;
      setUserId(id); setIds([]); setError("");
      try { if (id) setIds(read(prefix + id)); }
      catch { setError("No pudimos leer tus favoritos en este navegador."); }
      setReady(true);
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { revision++; apply(session?.user.id ?? null); });
    const initialRevision = revision;
    void supabase.auth.getUser().then(({ data }) => { if (revision === initialRevision) apply(data.user?.id ?? null); }).catch(() => { if (active) { setError("No pudimos comprobar tu sesión."); setReady(true); } });
    function sync(event: StorageEvent) { if (event.key === null || event.key === prefix + currentUserId) apply(currentUserId); }
    function syncLocal() { apply(currentUserId); }
    window.addEventListener("storage", sync);
    window.addEventListener("chakana-favorites-changed", syncLocal);
    return () => { active = false; subscription.unsubscribe(); window.removeEventListener("storage", sync); window.removeEventListener("chakana-favorites-changed", syncLocal); };
  }, []);
  function toggle(id: string) {
    if (!userId) return;
    try {
      const current = read(prefix + userId);
      const next = current.includes(id) ? current.filter(value => value !== id) : [...current, id];
      localStorage.setItem(prefix + userId, JSON.stringify(next));
      setIds(next); setError("");
      window.dispatchEvent(new Event("chakana-favorites-changed"));
    } catch { setError("No pudimos guardar el cambio. Comprueba que el navegador permita el almacenamiento local."); }
  }
  return { ids, ready, userId, error, toggle };
}
