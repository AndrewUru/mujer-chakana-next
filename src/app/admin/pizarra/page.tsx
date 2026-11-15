"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { Circle, Minus, Plus, Square, StickyNote, Trash2, Type } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import "./pizarra.css";

type Kind = "note" | "text" | "rect" | "ellipse";
type Item = { id: string; kind: Kind; x: number; y: number; w: number; h: number; content: string; color: string; z: number };
type View = { x: number; y: number; scale: number };
type Peer = { id: string; name: string };
type Drag =
  | { mode: "pan"; startX: number; startY: number; view: View }
  | { mode: "move" | "resize"; id: string; startX: number; startY: number; origin: Item };

const TOPIC = "pizarra:admin";
const TABLE = "admin_board_items";
const COLUMNS = "id, kind, x, y, w, h, content, color, z";
const COLORS: Record<string, string> = { yellow: "#f6e3a1", rose: "#f1c6d3", green: "#cfe3d0", blue: "#cbdcee", purple: "#dccbe6", white: "#fffdfa" };
const CURSOR_COLORS = ["#783c59", "#34674b", "#3b5f8a", "#a3622a", "#6b4a9b"];
const TOOLS: { kind: Kind; label: string; icon: typeof StickyNote; w: number; h: number; color: string }[] = [
  { kind: "note", label: "Nota", icon: StickyNote, w: 200, h: 160, color: "yellow" },
  { kind: "text", label: "Texto", icon: Type, w: 260, h: 64, color: "white" },
  { kind: "rect", label: "Rectángulo", icon: Square, w: 220, h: 140, color: "blue" },
  { kind: "ellipse", label: "Círculo", icon: Circle, w: 170, h: 170, color: "rose" },
];
const MIN_SCALE = 0.25;
const MAX_SCALE = 2.5;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const cursorColor = (id: string) => CURSOR_COLORS[[...id].reduce((sum, char) => sum + char.charCodeAt(0), 0) % CURSOR_COLORS.length];

export default function PizarraPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "missing" | "error">("loading");
  const [live, setLive] = useState(false);
  const [notice, setNotice] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [editingId, setEditingId] = useState("");
  const [view, setView] = useState<View>({ x: 0, y: 0, scale: 1 });
  const [peers, setPeers] = useState<Peer[]>([]);
  const [cursors, setCursors] = useState<Record<string, { x: number; y: number }>>({});
  const [me, setMe] = useState<Peer | null>(null);
  const [panning, setPanning] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const itemsRef = useRef<Item[]>([]);
  const viewRef = useRef(view);
  const dragRef = useRef<Drag | null>(null);
  const lastSent = useRef<Record<string, number>>({});
  const lastDown = useRef({ id: "", time: 0 });
  itemsRef.current = items;
  viewRef.current = view;

  // Envía por el canal como mucho una vez cada `wait` ms por clave.
  const send = useCallback((event: string, payload: Record<string, unknown>, key = "", wait = 0) => {
    const now = Date.now();
    if (wait && now - (lastSent.current[key] ?? 0) < wait) return;
    lastSent.current[key] = now;
    void channelRef.current?.send({ type: "broadcast", event, payload });
  }, []);

  const persist = useCallback(async (item: Item) => {
    const { error } = await supabase.from(TABLE).upsert({ ...item, updated_at: new Date().toISOString() });
    if (error) setNotice("No se pudo guardar el último cambio. Revisa tu conexión.");
  }, []);

  const apply = useCallback((item: Item) => {
    setItems(prev => (prev.some(value => value.id === item.id) ? prev.map(value => (value.id === item.id ? item : value)) : [...prev, item]));
  }, []);

  // Carga inicial y canal en vivo.
  useEffect(() => {
    let cancelled = false;
    let channel: RealtimeChannel | null = null;
    async function start() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || cancelled) return;
      const [{ data, error }, { data: profile }] = await Promise.all([
        supabase.from(TABLE).select(COLUMNS).order("z").returns<Item[]>(),
        supabase.from("perfiles").select("display_name").eq("user_id", session.user.id).maybeSingle(),
      ]);
      if (cancelled) return;
      if (error) { setStatus(error.code === "42P01" || error.code === "PGRST205" ? "missing" : "error"); return; }
      const self = { id: session.user.id, name: profile?.display_name || "Admin" };
      setMe(self);
      setItems(data ?? []);
      setStatus("ready");

      await supabase.realtime.setAuth();
      if (cancelled) return;
      const current = supabase.channel(TOPIC, { config: { private: true, broadcast: { self: false }, presence: { key: self.id } } });
      channel = current;
      channelRef.current = current;
      current
        .on("broadcast", { event: "item" }, ({ payload }) => {
          const item = payload.item as Item;
          const drag = dragRef.current;
          // Lo que estoy arrastrando yo manda hasta que lo suelte.
          if (drag && drag.mode !== "pan" && drag.id === item.id) return;
          apply(item);
        })
        .on("broadcast", { event: "remove" }, ({ payload }) => setItems(prev => prev.filter(item => item.id !== payload.id)))
        .on("broadcast", { event: "cursor" }, ({ payload }) => setCursors(prev => ({ ...prev, [payload.id as string]: { x: payload.x as number, y: payload.y as number } })))
        .on("presence", { event: "sync" }, () => {
          const state = current.presenceState<{ name: string }>();
          const present = Object.entries(state).map(([id, metas]) => ({ id, name: metas[0]?.name ?? "Admin" }));
          setPeers(present.filter(peer => peer.id !== self.id));
          setCursors(prev => Object.fromEntries(Object.entries(prev).filter(([id]) => id in state)));
        })
        .subscribe(state => {
          if (cancelled) return;
          setLive(state === "SUBSCRIBED");
          if (state === "SUBSCRIBED") void current.track({ name: self.name });
        });
    }
    void start().catch(() => { if (!cancelled) setStatus("error"); });
    return () => {
      cancelled = true;
      channelRef.current = null;
      if (channel) void supabase.removeChannel(channel);
    };
  }, [apply]);

  const toWorld = useCallback((clientX: number, clientY: number) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const { x, y, scale } = viewRef.current;
    return { x: (clientX - rect.left - x) / scale, y: (clientY - rect.top - y) / scale };
  }, []);

  const addItem = useCallback((kind: Kind, at?: { x: number; y: number }) => {
    const tool = TOOLS.find(value => value.kind === kind)!;
    const rect = canvasRef.current!.getBoundingClientRect();
    const center = at ?? toWorld(rect.left + rect.width / 2, rect.top + rect.height / 2);
    const item: Item = { id: crypto.randomUUID(), kind, x: Math.round(center.x - tool.w / 2), y: Math.round(center.y - tool.h / 2), w: tool.w, h: tool.h, content: "", color: tool.color, z: Date.now() };
    apply(item);
    setSelectedId(item.id);
    if (kind === "note" || kind === "text") setEditingId(item.id);
    send("item", { item });
    void persist(item);
  }, [apply, persist, send, toWorld]);

  const update = useCallback((id: string, changes: Partial<Item>, save: boolean) => {
    const current = itemsRef.current.find(item => item.id === id);
    if (!current) return;
    const next = { ...current, ...changes };
    apply(next);
    send("item", { item: next }, save ? "" : `item:${id}`, save ? 0 : 50);
    if (save) void persist(next);
  }, [apply, persist, send]);

  const remove = useCallback(async (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    setSelectedId("");
    setEditingId("");
    send("remove", { id });
    const { error } = await supabase.from(TABLE).delete().eq("id", id);
    if (error) setNotice("No se pudo eliminar el elemento. Recarga para ver el estado real.");
  }, [send]);

  // Zoom con la rueda, centrado en el cursor. Listener nativo: React los registra pasivos.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || status !== "ready") return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const { x, y, scale } = viewRef.current;
      const next = clamp(scale * Math.exp(-event.deltaY * 0.0015), MIN_SCALE, MAX_SCALE);
      const px = event.clientX - rect.left;
      const py = event.clientY - rect.top;
      setView({ scale: next, x: px - ((px - x) / scale) * next, y: py - ((py - y) / scale) * next });
    };
    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", onWheel);
  }, [status]);

  // Suprimir con el teclado el elemento seleccionado.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (editingId || !selectedId) return;
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (event.key === "Delete" || event.key === "Backspace") { event.preventDefault(); void remove(selectedId); }
      if (event.key === "Escape") setSelectedId("");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editingId, remove, selectedId]);

  function zoomBy(factor: number) {
    const rect = canvasRef.current!.getBoundingClientRect();
    const { x, y, scale } = viewRef.current;
    const next = clamp(scale * factor, MIN_SCALE, MAX_SCALE);
    const px = rect.width / 2;
    const py = rect.height / 2;
    setView({ scale: next, x: px - ((px - x) / scale) * next, y: py - ((py - y) / scale) * next });
  }

  function onCanvasDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    setSelectedId("");
    setEditingId("");
    dragRef.current = { mode: "pan", startX: event.clientX, startY: event.clientY, view: viewRef.current };
    setPanning(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onItemDown(event: React.PointerEvent, item: Item, mode: "move" | "resize") {
    if (event.button !== 0 || editingId === item.id) return;
    event.stopPropagation();
    const now = Date.now();
    const again = lastDown.current.id === item.id && now - lastDown.current.time < 350;
    lastDown.current = { id: item.id, time: now };
    setSelectedId(item.id);
    // Doble clic: editar el texto (la captura del puntero impide usar onDoubleClick).
    if (again && mode === "move") { setEditingId(item.id); return; }
    setEditingId("");
    const raised = { ...item, z: Date.now() };
    apply(raised);
    dragRef.current = { mode, id: item.id, startX: event.clientX, startY: event.clientY, origin: raised };
    canvasRef.current!.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (me) { const point = toWorld(event.clientX, event.clientY); send("cursor", { id: me.id, x: point.x, y: point.y }, "cursor", 60); }
    const drag = dragRef.current;
    if (!drag) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (drag.mode === "pan") { setView({ ...drag.view, x: drag.view.x + dx, y: drag.view.y + dy }); return; }
    const scale = viewRef.current.scale;
    const { origin } = drag;
    update(drag.id, drag.mode === "move"
      ? { x: origin.x + dx / scale, y: origin.y + dy / scale, z: origin.z }
      : { w: clamp(origin.w + dx / scale, 60, 4000), h: clamp(origin.h + dy / scale, 40, 4000), z: origin.z }, false);
  }

  function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    dragRef.current = null;
    setPanning(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (!drag || drag.mode === "pan") return;
    const item = itemsRef.current.find(value => value.id === drag.id);
    if (item) update(item.id, { x: Math.round(item.x), y: Math.round(item.y), w: Math.round(item.w), h: Math.round(item.h) }, true);
  }

  function onDrop(event: React.DragEvent<HTMLDivElement>) {
    const kind = event.dataTransfer.getData("application/x-pizarra") as Kind;
    if (!TOOLS.some(tool => tool.kind === kind)) return;
    event.preventDefault();
    addItem(kind, toWorld(event.clientX, event.clientY));
  }

  const selected = items.find(item => item.id === selectedId);

  if (status !== "ready") return (
    <main className="admin-page">
      <header className="admin-heading"><div><p className="admin-eyebrow">Pensar juntas</p><h1>Pizarra.</h1></div></header>
      {status === "loading" && <div className="admin-empty" role="status">Abriendo la pizarra…</div>}
      {status === "missing" && <p className="admin-notice error" role="alert">La pizarra todavía no está instalada en la base de datos. Aplica la migración <code>202611150002_admin_board.sql</code> en Supabase y recarga la página.</p>}
      {status === "error" && <p className="admin-notice error" role="alert">No se pudo abrir la pizarra. Recarga la página para volver a intentarlo.</p>}
    </main>
  );

  return (
    <main className="admin-page board-page">
      <header className="board-header">
        <div><p className="admin-eyebrow">Pensar juntas</p><h1>Pizarra.</h1></div>
        <div className="board-people" aria-label="Administradoras en la pizarra">
          <span className={`board-live ${live ? "is-live" : ""}`} role="status">{live ? "En vivo" : "Sin conexión en vivo"}</span>
          {me && <span className="board-person" style={{ background: cursorColor(me.id) }} title={`${me.name} (tú)`}>{me.name.slice(0, 1).toUpperCase()}</span>}
          {peers.map(peer => <span key={peer.id} className="board-person" style={{ background: cursorColor(peer.id) }} title={peer.name}>{peer.name.slice(0, 1).toUpperCase()}</span>)}
        </div>
      </header>
      {notice && <div role="alert" className="admin-notice error">{notice} <button className="admin-button" onClick={() => setNotice("")}>Entendido</button></div>}
      {!live && <p className="admin-subtitle" style={{ marginBottom: 12 }}>Tus cambios se guardan igualmente, pero no verás los de otras administradoras hasta que vuelva la conexión.</p>}

      <div className="board-toolbar" role="toolbar" aria-label="Herramientas de la pizarra">
        <div className="board-tools">
          {TOOLS.map(({ kind, label, icon: Icon }) => (
            <button key={kind} type="button" className="admin-button" draggable title={`${label}: pulsa para añadir o arrástrala a la pizarra`}
              onDragStart={event => { event.dataTransfer.setData("application/x-pizarra", kind); event.dataTransfer.effectAllowed = "copy"; }}
              onClick={() => addItem(kind)}>
              <Icon size={16} aria-hidden="true" /> {label}
            </button>
          ))}
        </div>
        {selected && (
          <div className="board-tools" aria-label="Elemento seleccionado">
            {Object.entries(COLORS).map(([name, value]) => (
              <button key={name} type="button" className={`board-swatch ${selected.color === name ? "is-current" : ""}`} style={{ background: value }} aria-label={`Color ${name}`} aria-pressed={selected.color === name} onClick={() => update(selected.id, { color: name }, true)} />
            ))}
            <button type="button" className="admin-button danger" onClick={() => void remove(selected.id)}><Trash2 size={15} aria-hidden="true" /> Eliminar</button>
          </div>
        )}
        <div className="board-tools board-zoom">
          <button type="button" className="admin-button" aria-label="Alejar" onClick={() => zoomBy(1 / 1.2)}><Minus size={15} /></button>
          <button type="button" className="admin-button" title="Volver al 100 %" onClick={() => setView({ x: 0, y: 0, scale: 1 })}>{Math.round(view.scale * 100)} %</button>
          <button type="button" className="admin-button" aria-label="Acercar" onClick={() => zoomBy(1.2)}><Plus size={15} /></button>
        </div>
      </div>

      <div ref={canvasRef} className="board-canvas" data-panning={panning}
        style={{ backgroundPosition: `${view.x}px ${view.y}px`, backgroundSize: `${24 * view.scale}px ${24 * view.scale}px` }}
        onPointerDown={onCanvasDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
        onDragOver={event => { if (event.dataTransfer.types.includes("application/x-pizarra")) { event.preventDefault(); event.dataTransfer.dropEffect = "copy"; } }}
        onDrop={onDrop}>
        <div className="board-layer" style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` }}>
          {[...items].sort((a, b) => a.z - b.z).map(item => (
            <div key={item.id} className={`board-item is-${item.kind} ${item.id === selectedId ? "is-selected" : ""}`}
              style={{ left: item.x, top: item.y, width: item.w, height: item.h, background: item.kind === "text" ? "transparent" : COLORS[item.color] ?? COLORS.yellow }}
              onPointerDown={event => onItemDown(event, item, "move")}>
              {editingId === item.id
                ? <textarea autoFocus aria-label="Texto del elemento" defaultValue={item.content} maxLength={4000}
                    onPointerDown={event => event.stopPropagation()}
                    onChange={event => update(item.id, { content: event.target.value }, false)}
                    onBlur={event => { update(item.id, { content: event.target.value }, true); setEditingId(""); }}
                    onKeyDown={event => { if (event.key === "Escape") event.currentTarget.blur(); }} />
                : <p>{item.content || (item.kind === "note" || item.kind === "text" ? <span className="board-placeholder">Doble clic para escribir</span> : null)}</p>}
              {item.id === selectedId && editingId !== item.id && <span className="board-resize" aria-hidden="true" onPointerDown={event => onItemDown(event, item, "resize")} />}
            </div>
          ))}
          {peers.map(peer => cursors[peer.id] && (
            <div key={peer.id} className="board-cursor" style={{ left: cursors[peer.id].x, top: cursors[peer.id].y, color: cursorColor(peer.id), transform: `scale(${1 / view.scale})` }} aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 16 16"><path d="M1 1l5.5 13 1.8-5.2L13.5 7z" fill="currentColor" stroke="#fff" strokeWidth="1" /></svg>
              <span style={{ background: cursorColor(peer.id) }}>{peer.name}</span>
            </div>
          ))}
        </div>
        {!items.length && <p className="board-empty">Arrastra una herramienta aquí o púlsala para empezar.</p>}
      </div>
      <p className="admin-subtitle board-help">Arrastra el fondo para moverte y usa la rueda para acercar. Doble clic en un elemento para escribir; Supr para eliminarlo.</p>
    </main>
  );
}
