import { phase } from "lune";

const LUNAR_IMAGES = [
  { src: "/Luna-nueva.webp", name: "Luna nueva" },
  { src: "/Luna-creciente.webp", name: "Luna creciente" },
  { src: "/Luna-cuarto-creciente.webp", name: "Cuarto creciente" },
  { src: "/Luna-gibosa-creciente.webp", name: "Luna gibosa creciente" },
  { src: "/Luna-llena.webp", name: "Luna llena" },
  { src: "/Luna-gibosa-menguante.webp", name: "Luna gibosa menguante" },
  { src: "/Luna-cuarto-menguante.webp", name: "Cuarto menguante" },
  { src: "/Luna-menguante.webp", name: "Luna menguante" },
] as const;

export function getLunarImage(fraction: number) {
  const normalized = ((fraction % 1) + 1) % 1;
  return LUNAR_IMAGES[Math.round(normalized * 8) % 8];
}

export function getLunarImageForDate(date: Date) {
  return getLunarImage(phase(date).phase);
}

// The atlas is a symbolic 28-day cycle, independent of calendar dates.
export function getLunarImageForCycleDay(day: number) {
  return getLunarImage((day - 1) / 28);
}
