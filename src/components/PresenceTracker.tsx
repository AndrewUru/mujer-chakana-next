"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { startPresence, stopPresence } from "@/lib/presence";

/** Mantiene a la usuaria con sesión marcada como conectada mientras tenga la app abierta. */
export default function PresenceTracker() {
  useEffect(() => {
    const apply = (userId?: string) => { void (userId ? startPresence(userId) : stopPresence()).catch(() => {}); };
    void supabase.auth.getSession().then(({ data: { session } }) => apply(session?.user.id));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // Fuera del callback: llamar a supabase.auth desde dentro lo bloquea.
      setTimeout(() => apply(session?.user.id), 0);
    });
    return () => { subscription.unsubscribe(); void stopPresence(); };
  }, []);
  return null;
}
