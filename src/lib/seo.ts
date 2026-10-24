import type { Metadata } from "next";

export const SITE_URL = "https://www.ginergetica.com";
export const SITE_NAME = "Ginergética";
export const SITE_DESCRIPTION = "Registra tu ciclo y tus emociones, explora tu calendario lunar y descubre audios, rituales y guías de autoconocimiento femenino con Ginergética.";
const socialImage = { url: `${SITE_URL}/mujer-elementos.webp`, alt: "Ginergética: ciclo lunar y autoconocimiento femenino" };

export function publicMetadata(title: string, description: string, path: string): Metadata {
  const url = new URL(path, SITE_URL).href;
  const fullTitle = `${title} | ${SITE_NAME}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", locale: "es_ES", siteName: SITE_NAME, url, title: fullTitle, description, images: [socialImage] },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [socialImage] },
    robots: { index: true, follow: true },
  };
}

export const privateMetadata: Metadata = {
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  alternates: { canonical: null },
};

export const publicPages = ["/", "/manual", "/recursos", "/suscripcion"] as const;
