/** Avatares de los cuatro elementos, para quien no sube una foto propia. */
export const ELEMENT_AVATARS = [
  { id: "agua", label: "Agua", src: "/avatares/agua.webp" },
  { id: "fuego", label: "Fuego", src: "/avatares/fuego.webp" },
  { id: "tierra", label: "Tierra", src: "/avatares/tierra.webp" },
  { id: "aire", label: "Aire", src: "/avatares/aire.webp" },
] as const;

/** Avatar por defecto estable: la misma persona ve siempre el mismo elemento. */
export function defaultAvatar(seed?: string | null): string {
  let hash = 0;
  for (const char of seed ?? "") hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return ELEMENT_AVATARS[hash % ELEMENT_AVATARS.length].src;
}
