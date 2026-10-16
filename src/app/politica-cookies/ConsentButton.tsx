"use client";

import { reopenCookieConsent } from "@/components/CookieConsent";

export default function ConsentButton({ className }: { className?: string }) {
  return (
    <button type="button" className={className} onClick={reopenCookieConsent}>
      Revisar mi elección
    </button>
  );
}
