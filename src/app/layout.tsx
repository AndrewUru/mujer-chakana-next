import "./globals.css";
import Navbar from "@/components/Navbar";
import CookieConsent from "@/components/CookieConsent";
import { Metadata } from "next";
import { Cormorant_Garamond, Nunito_Sans } from "next/font/google";
import AmbientSceneLazy from "@/components/AmbientSceneLazy";
import PageTransition from "@/components/PageTransition";

const bodyFont = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const displayFont = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["600", "700"],
});

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
  icons: {
    icon: "/logo_chakana.png",
    apple: "/logo_chakana.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${bodyFont.variable} ${displayFont.variable}`}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* PWA / App */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/logo_chakana.png" />
        <meta name="theme-color" content="#e91e63" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Ginergética" />

      </head>
      <body className="relative min-h-screen text-pink-900 antialiased">
        <a className="skip-link" href="#main-content">
          Saltar al contenido
        </a>
        {/* Capa de la imagen de fondo optimizada */}
        <div
          className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-[0.18] mix-blend-multiply blur-[0.2px] saturate-[0.72]"
          style={{
            backgroundImage: "url('/mujer-chakana.webp')",
            backgroundAttachment: "fixed",
          }}
          aria-hidden="true"
        />

        {/* Capa luminosa para suavizar la ilustraciÃ³n de fondo */}
        <div
          className="fixed inset-0 z-10 bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.86),transparent_34rem),radial-gradient(circle_at_88%_16%,rgba(255,249,237,0.88),transparent_32rem),linear-gradient(135deg,rgba(255,250,253,0.9),rgba(255,243,248,0.78)_48%,rgba(255,250,239,0.84))]"
          aria-hidden="true"
        />
        <AmbientSceneLazy />

        {/* Contenido principal */}
        <div className="relative z-20 flex flex-col min-h-screen">
          <div id="main-content" className="app-main flex-1" tabIndex={-1}>
            <PageTransition>{children}</PageTransition>
          </div>
          <Navbar />
        </div>

        {/* Componentes de terceros */}
        <CookieConsent />

      </body>
    </html>
  );
}
