import { privateMetadata } from "@/lib/seo";

export const metadata = { ...privateMetadata, title: "Acceso a tu cuenta" };

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
