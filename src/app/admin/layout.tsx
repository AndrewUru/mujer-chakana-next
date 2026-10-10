import { privateMetadata } from "@/lib/seo";
import AdminShell from "./admin-shell";

export const metadata = { ...privateMetadata, title: "Administración" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
