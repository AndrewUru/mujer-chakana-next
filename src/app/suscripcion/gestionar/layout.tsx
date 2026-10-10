import { privateMetadata } from "@/lib/seo";

export const metadata = { ...privateMetadata, title: "Gestionar suscripción" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
