import { publicMetadata } from "@/lib/seo";

export const metadata = publicMetadata("Audios, rituales y guías de autoconocimiento", "Explora la biblioteca de Ginergética: audios, vídeos y guías en PDF para acompañar tu ciclo y tu práctica de autoconocimiento.", "/recursos");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
