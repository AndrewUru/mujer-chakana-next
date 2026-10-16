import "./globals.css";
import { CartProvider } from "@/components/shop/CartProvider";
import Navbar from "@/components/Navbar";
import CookieConsent from "@/components/CookieConsent";
import type { Metadata, Viewport } from "next";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";
import { Cormorant_Garamond, Nunito_Sans } from "next/font/google";
import PageTransition from "@/components/PageTransition";

const bodyFont = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

// Los estilos usan 400–700 y cursiva; sin cargarlos el navegador los sintetiza.
const displayFont = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: "%s | Ginergética" },
  description: SITE_DESCRIPTION,
  formatDetection: { email: false, address: false, telephone: false },
  robots: { index: true, follow: true },
  ...(process.env.GOOGLE_SITE_VERIFICATION ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } } : {}),
  icons: {
    icon: { url: "/favicon.svg", type: "image/svg+xml", sizes: "any" },
    apple: "/logo_chakana.png",
  },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#e91e63" };

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

        {/* PWA / App */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/logo_chakana.png" />
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

        {/* Contenido principal */}
        <CartProvider><PageTransition>
          <div className="relative z-20 flex flex-col min-h-screen">
            <div id="main-content" className="app-main flex-1" tabIndex={-1}>
              {children}
            </div>
            <Navbar />
          </div>
        </PageTransition></CartProvider>

        {/* Componentes de terceros */}
        <CookieConsent />

      </body>
    </html>
  );
}
