"use client";
import Link from "next/link";
import type { ReactNode } from "react";
import { preparePageTransition, usePageTransition } from "./PageTransition";
export default function JourneyLink({ href, label, className, children }: { href: string; label: string; className?: string; children: ReactNode }) {
  const navigate = usePageTransition();
  return <Link href={href} className={className} onPointerEnter={preparePageTransition} onFocus={preparePageTransition} onNavigate={event => { if (navigate?.(href, label)) event.preventDefault(); }}>{children}</Link>;
}
