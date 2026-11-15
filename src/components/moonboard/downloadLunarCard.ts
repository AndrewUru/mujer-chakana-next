import { phase } from "lune";
import { getLunarImageForDate } from "@/lib/lunarImages";

const W = 1080;
const H = 1350;
const MOON = { x: W / 2, y: 650, size: 480 };

// Una línea y un acento por fase, en el mismo orden que LUNAR_IMAGES.
const PHASES: Record<string, { line: string; accent: string; index: number }> = {
  "Luna nueva": { index: 0, accent: "#c6c2e8", line: "Todo empieza en lo que aún no se ve." },
  "Luna creciente": { index: 1, accent: "#c7dacb", line: "Lo que nace solo pide atención." },
  "Cuarto creciente": { index: 2, accent: "#c7dacb", line: "Un paso firme también es calma." },
  "Luna gibosa creciente": { index: 3, accent: "#c7dacb", line: "Confía en lo que ya has sembrado." },
  "Luna llena": { index: 4, accent: "#e6cda3", line: "Deja que se vea todo lo que eres." },
  "Luna gibosa menguante": { index: 5, accent: "#dfb9ca", line: "Agradece lo vivido y compártelo." },
  "Cuarto menguante": { index: 6, accent: "#dfb9ca", line: "Soltar también es elegir." },
  "Luna menguante": { index: 7, accent: "#dfb9ca", line: "Descansa. El silencio prepara el regreso." },
};

// Generador determinista: la misma fecha dibuja siempre el mismo cielo.
function seeded(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function spaced(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, spacing: number) {
  // letterSpacing no existe en navegadores antiguos: ahí el texto sale sin espaciar.
  const supported = "letterSpacing" in ctx;
  if (supported) ctx.letterSpacing = `${spacing}px`;
  ctx.fillText(text, x + (supported ? spacing / 2 : 0), y);
  if (supported) ctx.letterSpacing = "0px";
}

/** Dibuja el símbolo de una de las ocho fases (0 = nueva, 4 = llena). */
function glyph(ctx: CanvasRenderingContext2D, index: number, x: number, y: number, r: number, color: string, active: boolean) {
  ctx.save();
  ctx.translate(x, y);
  if (index > 4) ctx.scale(-1, 1); // las menguantes son el espejo de las crecientes
  const step = index > 4 ? 8 - index : index;
  ctx.globalAlpha = active ? 1 : 0.42;
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  if (step === 4) {
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  } else if (step > 0) {
    const bulge = Math.cos((step / 8) * Math.PI * 2);
    ctx.beginPath();
    ctx.arc(0, 0, r, -Math.PI / 2, Math.PI / 2);
    ctx.ellipse(0, 0, Math.abs(bulge) * r, r, 0, Math.PI / 2, -Math.PI / 2, bulge > 0);
    ctx.fill();
  }
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
  if (active) {
    ctx.globalAlpha = 0.5;
    ctx.beginPath(); ctx.arc(0, 0, r + 9, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
}

// A voluntary, local export. Never include profile, cycle day or diary data.
export async function downloadLunarCard(date: Date) {
  const moon = getLunarImageForDate(date);
  const info = PHASES[moon.name] ?? PHASES["Luna nueva"];
  const illuminated = Math.round(phase(date).illuminated * 100);
  const root = getComputedStyle(document.documentElement);
  const display = root.getPropertyValue("--font-display").trim() || "Georgia";
  const body = root.getPropertyValue("--font-body").trim() || "sans-serif";

  const texture = new window.Image();
  texture.src = moon.src;
  // El lienzo solo usa las fuentes que ya estén cargadas: se piden antes de dibujar.
  await Promise.all([
    texture.decode(),
    ...[`600 80px ${display}`, `italic 500 80px ${display}`, `700 16px ${body}`, `400 16px ${body}`].map(font => document.fonts.load(font).catch(() => [])),
  ]);

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No pudimos preparar la postal.");

  // Cielo: degradado nocturno y un resplandor del color de la fase tras la luna.
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "#0b0a16");
  sky.addColorStop(0.55, "#16101f");
  sky.addColorStop(1, "#22131f");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(MOON.x, MOON.y, MOON.size * 0.3, MOON.x, MOON.y, 620);
  glow.addColorStop(0, `${info.accent}3d`);
  glow.addColorStop(0.45, `${info.accent}14`);
  glow.addColorStop(1, `${info.accent}00`);
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Estrellas, fuera del disco lunar.
  const random = seeded(date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate());
  for (let i = 0; i < 260; i++) {
    const x = random() * W;
    const y = random() * H;
    const size = 0.5 + random() * random() * 2.2;
    const alpha = 0.18 + random() * 0.7;
    if (Math.hypot(x - MOON.x, y - MOON.y) < MOON.size / 2 + 14) continue;
    ctx.save();
    ctx.fillStyle = `rgba(232, 226, 246, ${alpha})`;
    if (size > 1.7) { ctx.shadowColor = "rgba(232, 226, 246, .9)"; ctx.shadowBlur = 8; }
    ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // Marco fino.
  ctx.strokeStyle = `${info.accent}33`;
  ctx.lineWidth = 1;
  ctx.strokeRect(36.5, 36.5, W - 73, H - 73);

  ctx.textAlign = "center";
  ctx.fillStyle = info.accent;
  ctx.font = `700 15px ${body}`;
  spaced(ctx, "GINERGÉTICA  ·  MI CIELO LUNAR", W / 2, 112, 5);

  ctx.fillStyle = "#f7eee4";
  ctx.font = `600 78px ${display}`;
  ctx.fillText("Una pausa bajo", W / 2, 212);
  ctx.font = `italic 500 78px ${display}`;
  ctx.fillText("la misma luna.", W / 2, 294);

  // Órbitas y luna. «screen» funde el fondo negro de la fotografía con el cielo.
  ctx.strokeStyle = `${info.accent}2e`;
  for (const radius of [278, 312, 346]) { ctx.beginPath(); ctx.arc(MOON.x, MOON.y, radius, 0, Math.PI * 2); ctx.stroke(); }
  // Un disco oscuro bajo la luna conserva el contraste de su cara en sombra y
  // deja un halo del color de la fase alrededor.
  ctx.save();
  ctx.shadowColor = `${info.accent}73`;
  ctx.shadowBlur = 70;
  ctx.fillStyle = "#07060d";
  ctx.beginPath(); ctx.arc(MOON.x, MOON.y, MOON.size * 0.452, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.drawImage(texture, MOON.x - MOON.size / 2, MOON.y - MOON.size / 2, MOON.size, MOON.size);
  ctx.restore();

  ctx.fillStyle = "#f7eee4";
  ctx.font = `600 66px ${display}`;
  ctx.fillText(moon.name, W / 2, 1082);
  ctx.fillStyle = info.accent;
  ctx.font = `italic 500 32px ${display}`;
  ctx.fillText(info.line, W / 2, 1132);
  ctx.fillStyle = "#b7acc9";
  ctx.font = `700 14px ${body}`;
  const day = date.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }).toUpperCase();
  spaced(ctx, `${day}  ·  ILUMINACIÓN ${illuminated} %`, W / 2, 1180, 3.5);

  // Las ocho fases, con la de hoy resaltada.
  for (let i = 0; i < 8; i++) glyph(ctx, i, W / 2 + (i - 3.5) * 66, 1236, 14, i === info.index ? info.accent : "#b7acc9", i === info.index);

  ctx.fillStyle = "#8f86a3";
  ctx.font = `400 14px ${body}`;
  spaced(ctx, "GINERGETICA.COM", W / 2, 1296, 4);

  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error("No pudimos crear la imagen.")), "image/png"));
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "mi-luna-ginergetica.png";
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
