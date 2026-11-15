// Presencia en tiempo real sobre un único canal privado de Supabase Realtime.
// Toda usuaria con sesión anuncia que está conectada; quién puede leer la lista
// lo decide la base de datos (solo administradoras, ver la migración
// 202611150001_presence.sql), no este archivo.
import { useSyncExternalStore } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

const TOPIC = "presencia:app";

export type PresenceSnapshot = {
  /** user_id de las usuarias conectadas ahora. Vacío para quien no es admin. */
  online: ReadonlySet<string>;
  /** "live": conectado al canal. "off": sin sesión o canal no disponible. */
  status: "off" | "connecting" | "live";
};

const OFF: PresenceSnapshot = { online: new Set(), status: "off" };
let snapshot = OFF;
let channel: RealtimeChannel | null = null;
let trackedUser = "";
const listeners = new Set<() => void>();

function publish(next: PresenceSnapshot) {
  snapshot = next;
  for (const listener of listeners) listener();
}

/** Anuncia a la usuaria como conectada. Llamarlo otra vez con la misma usuaria no hace nada. */
export async function startPresence(userId: string) {
  if (trackedUser === userId && channel) return;
  await stopPresence();
  trackedUser = userId;
  publish({ online: new Set(), status: "connecting" });

  // Los canales privados validan el token de la sesión al unirse.
  await supabase.realtime.setAuth();
  if (trackedUser !== userId) return; // se cerró la sesión mientras tanto

  const current = supabase.channel(TOPIC, { config: { private: true, presence: { key: userId } } });
  channel = current;
  current
    .on("presence", { event: "sync" }, () => {
      if (channel === current) publish({ online: new Set(Object.keys(current.presenceState())), status: "live" });
    })
    .subscribe(status => {
      if (channel !== current) return;
      if (status === "SUBSCRIBED") {
        publish({ online: snapshot.online, status: "live" });
        void current.track({ online_at: new Date().toISOString() });
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
        // Realtime reintenta solo; mientras tanto no afirmamos que nadie esté conectada.
        publish({ online: new Set(), status: "off" });
      }
    });
}

export async function stopPresence() {
  const current = channel;
  channel = null;
  trackedUser = "";
  if (current) await supabase.removeChannel(current);
  if (snapshot !== OFF) publish(OFF);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

/** Usuarias conectadas ahora. Solo devuelve datos a las administradoras. */
export function usePresence(): PresenceSnapshot {
  return useSyncExternalStore(subscribe, () => snapshot, () => OFF);
}
