"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { parseCart, type CartEntry } from "@/lib/shop/cart";

const KEY = "ginergetica:cart:v1";
type CartContextValue = { items: CartEntry[]; ready: boolean; error: string; count: number; add: (variantId: string) => boolean; setQuantity: (variantId: string, quantity: number) => void; remove: (variantId: string) => void };
const CartContext = createContext<CartContextValue | null>(null);
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartEntry[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    function load() {
      try { setItems(parseCart(JSON.parse(localStorage.getItem(KEY) ?? "[]"))); setError(""); }
      catch { setItems([]); setError("No pudimos recuperar el carrito guardado en este navegador."); }
      setReady(true);
    }
    load();
    const sync = (event: StorageEvent) => { if (event.key === KEY || event.key === null) load(); };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  function change(transform: (current: CartEntry[]) => CartEntry[]): boolean {
    if (!ready) return false;
    try {
      const current = parseCart(JSON.parse(localStorage.getItem(KEY) ?? "[]"));
      const next = parseCart(transform(current));
      localStorage.setItem(KEY, JSON.stringify(next)); setItems(next); setError(""); return true;
    } catch { setError("No pudimos guardar el carrito. Comprueba que el navegador permita el almacenamiento local."); return false; }
  }
  function add(variantId: string) {
    const existing = items.find(item => item.variantId === variantId);
    if ((existing?.quantity ?? 0) >= 20 || (!existing && items.length >= 50)) { setError("El carrito admite hasta 20 unidades por tamaño y 50 tamaños distintos."); return false; }
    return change(current => current.some(item => item.variantId === variantId) ? current.map(item => item.variantId === variantId ? { ...item, quantity: Math.min(20, item.quantity + 1) } : item) : [...current, { variantId, quantity: 1 }]);
  }
  return <CartContext.Provider value={{ items, ready, error, add, count: items.reduce((total, item) => total + item.quantity, 0), setQuantity: (id, quantity) => { change(current => current.map(item => item.variantId === id ? { ...item, quantity } : item)); }, remove: id => { change(current => current.filter(item => item.variantId !== id)); } }}>{children}</CartContext.Provider>;
}
export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("CartProvider is required");
  return value;
}
