import { privateMetadata } from "@/lib/seo";

export const metadata = { ...privateMetadata, title: "Mi perfil" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
