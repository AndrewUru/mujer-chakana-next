import { getLunarImageForDate } from "@/lib/lunarImages";

// A voluntary, local export. Never include profile, cycle day or diary data.
export async function downloadLunarCard(date: Date) {
  const moon = getLunarImageForDate(date);
  await document.fonts.ready;
  const texture = new window.Image(); texture.src = moon.src; await texture.decode();
  const canvas = document.createElement("canvas"); canvas.width = 1080; canvas.height = 1350;
  const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("No pudimos preparar la postal.");
  const font = getComputedStyle(document.documentElement).getPropertyValue("--font-display").trim() || "Georgia";
  ctx.fillStyle = "#100f1b"; ctx.fillRect(0, 0, 1080, 1350);
  for (let i = 0; i < 100; i++) {
    ctx.fillStyle = `rgba(210,205,234,${.1 + (i % 4) * .08})`;
    ctx.beginPath(); ctx.arc(50 + ((i * 137) % 980), 100 + ((i * 211) % 1050), i % 3 === 0 ? 1.5 : .8, 0, Math.PI * 2); ctx.fill();
  }
  ctx.textAlign = "center"; ctx.fillStyle = "#c6c2e8"; ctx.font = "16px sans-serif";
  ctx.fillText("GINERGÉTICA / MI CIELO LUNAR", 540, 100);
  ctx.fillStyle = "#f7eee4"; ctx.font = `600 88px ${font}`;
  ctx.fillText("Una pausa bajo", 540, 235); ctx.fillText("la misma luna.", 540, 330);
  ctx.strokeStyle = "#c6c2e830"; ctx.lineWidth = 1;
  for (const radius of [250, 290, 325]) { ctx.beginPath(); ctx.arc(540, 705, radius, 0, Math.PI * 2); ctx.stroke(); }
  ctx.drawImage(texture, 330, 495, 420, 420);
  ctx.fillStyle = "#f7eee4"; ctx.font = `600 62px ${font}`; ctx.fillText(moon.name, 540, 1115);
  ctx.font = "20px sans-serif"; ctx.fillStyle = "#b7acc9";
  ctx.fillText(date.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }), 540, 1165);
  ctx.font = "17px sans-serif"; ctx.fillText("Descubre tu luna en ginergetica.com", 540, 1270);
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error("No pudimos crear la imagen.")), "image/png"));
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a"); anchor.href = url; anchor.download = "mi-luna-ginergetica.png"; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
