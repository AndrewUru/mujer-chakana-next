import { privateMetadata } from "@/lib/seo";

export const metadata = { ...privateMetadata, title: "Mi audio" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
