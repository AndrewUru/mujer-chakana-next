import { privateMetadata } from "@/lib/seo";

export const metadata = { ...privateMetadata, title: "Política de cookies" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
