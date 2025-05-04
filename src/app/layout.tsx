import "./globals.css";
import Navbar from "@/components/Navbar";
import Script from "next/script";

<Script
  src={`https://www.paypal.com/sdk/js?client-id=TU_CLIENT_ID&currency=EUR`}
  strategy="afterInteractive"
/>;

export const metadata = {
  title: "Mujer Chakana",
  description: "Ciclos femeninos guiados por la Chakana",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <head>
        <title>Mujer Chakana | Ciclo Lunar y Autoexploración</title>
        <meta
          name="description"
          content="Mujer Chakana: Registra tu ciclo, conecta con las fases lunares y descubre tu Ginergía. Una herramienta espiritual y práctica para mujeres cíclicas."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* PWA / App */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="theme-color" content="#e91e63" />

        {/* SEO Básico */}
        <meta
          name="keywords"
          content="Mujer Chakana, ciclo menstrual, fases lunares, ginergía, autoconocimiento femenino, moonboard"
        />
        <meta name="author" content="Ginergía | Mujer Chakana" />

        {/* Open Graph (para compartir en Facebook y otros) */}
        <meta property="og:title" content="Mujer Chakana" />
        <meta
          property="og:description"
          content="Registra tu ciclo y sincronízate con la luna. Autoexploración espiritual y práctica."
        />
        <meta
          property="og:image"
          content="https://elsaltoweb.es/wp-content/uploads/2025/04/mujer-chakana.png"
        />
        <meta property="og:url" content="https://tudominio.com" />
        <meta property="og:type" content="website" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Mujer Chakana" />
        <meta
          name="twitter:description"
          content="Autoexploración femenina con sincronía lunar y ginergía."
        />
        <meta
          name="twitter:image"
          content="https://elsaltoweb.es/wp-content/uploads/2025/04/mujer-chakana.png"
        />

        {/* Favicon */}
        <link rel="icon" href="/icon-192x192.png" />
      </head>
      <body
        className="h-screen bg-fixed bg-center bg-no-repeat bg-pink-50/25 bg-cover text-pink-900 font-sans pb-20"
        style={{
          backgroundImage:
            "url('https://elsaltoweb.es/wp-content/uploads/2025/04/mujer-chakana.png')",
        }}
      >
        {children}
        <Navbar />
      </body>
    </html>
  );
}
