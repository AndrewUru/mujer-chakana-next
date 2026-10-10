import { publicMetadata } from "@/lib/seo";

export const metadata = publicMetadata("Cómo usar tu calendario lunar y tus recursos", "Aprende a configurar tu ciclo, usar el Moonboard, registrar tus emociones y explorar los audios, rituales y guías de Ginergética.", "/manual");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
