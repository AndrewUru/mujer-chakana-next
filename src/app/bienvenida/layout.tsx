import { privateMetadata } from "@/lib/seo";

export const metadata = { ...privateMetadata, title: "Bienvenida" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
