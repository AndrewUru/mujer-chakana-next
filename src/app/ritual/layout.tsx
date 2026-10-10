import { privateMetadata } from "@/lib/seo";

export const metadata = { ...privateMetadata, title: "Mi ritual" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
