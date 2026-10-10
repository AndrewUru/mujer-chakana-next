import { publicMetadata } from "@/lib/seo";

export const metadata = publicMetadata("Suscripción: audios, rituales y recursos premium", "Descubre los planes mensual y anual de Ginergética y accede a audios, rituales y recursos exclusivos para acompañar tu ciclo.", "/suscripcion");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
