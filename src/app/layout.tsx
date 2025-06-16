import "./globals.css";
import Navbar from "@/components/Navbar";
import Script from "next/script";
import CookieConsent from "@/components/CookieConsent";
import { Metadata } from "next";

// Metadatos optimizados usando la nueva API de Next.js 13+
export const metadata: Metadata = {
  title: {
    default: "Ginergética | Ciclo Lunar y Autoexploración",
    template: "%s | Ginergética",
  },
  description:
    "Mujer Chakana: Registra tu ciclo, conecta con las fases lunares y descubre tu Ginergía. Una herramienta espiritual y práctica para mujeres cíclicas.",
  keywords: [
    "Mujer Chakana",
    "ciclo menstrual",
    "fases lunares",
    "ginergía",
    "autoconocimiento femenino",
    "moonboard",
    "ciclo lunar",
    "autoexploración",
    "espiritualidad femenina",
  ],
  authors: [{ name: "Ginergía | Mujer Chakana" }],
  creator: "Ginergía | Mujer Chakana",
  publisher: "Ginergía | Mujer Chakana",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://ginergetica.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://ginergetica.com",
    title: "Mujer Chakana",
    description:
      "Registra tu ciclo y sincronízate con la luna. Autoexploración espiritual y práctica.",
    siteName: "Ginergética",
    images: [
      {
        url: "https://elsaltoweb.es/wp-content/uploads/2025/04/mujer-chakana.png",
        width: 1200,
        height: 630,
        alt: "Mujer Chakana - Ciclo Lunar y Autoexploración",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ginergética",
    description: "Autoexploración femenina con sincronía lunar y ginergía.",
    images: [
      "https://elsaltoweb.es/wp-content/uploads/2025/04/mujer-chakana.png",
    ],
    creator: "@ginergetica",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "tu-google-verification-code",
  },
  category: "health",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* PWA / App */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="theme-color" content="#e91e63" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Ginergética" />

        {/* Favicon */}
        <link rel="icon" href="/icon-192x192.png" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/icon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/icon-16x16.png"
        />

        {/* Preconnect para optimización de rendimiento */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://www.paypal.com" />

        {/* DNS Prefetch para recursos externos */}
        <link rel="dns-prefetch" href="//elsaltoweb.es" />
      </head>
      <body className="min-h-screen bg-pink-50/25 font-sans text-pink-900 relative antialiased">
        {/* Capa de la imagen de fondo optimizada */}
        <div
          className="fixed inset-0 bg-center bg-no-repeat bg-cover z-0"
          style={{
            backgroundImage:
              "url('https://elsaltoweb.es/wp-content/uploads/2025/04/mujer-chakana.png')",
            backgroundAttachment: "fixed",
          }}
          aria-hidden="true"
        />

        {/* Capa rosa con opacidad */}
        <div className="fixed inset-0 bg-pink-50/25 z-10" aria-hidden="true" />

        {/* Contenido principal */}
        <div className="relative z-20 flex flex-col min-h-screen">
          <main className="flex-1">{children}</main>
          <Navbar />
        </div>

        {/* Componentes de terceros */}
        <CookieConsent />

        {/* Scripts optimizados */}
        <Script
          src="https://www.paypal.com/sdk/js?client-id=TU_CLIENT_ID&currency=EUR"
          strategy="afterInteractive"
        />

        {/* Analytics o scripts adicionales pueden ir aquí */}
      </body>
    </html>
  );
}
