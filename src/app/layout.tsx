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
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="theme-color" content="#e91e63" />
      </head>
      <body
        className="h-screen bg-fixed bg-center bg-no-repeat bg-cover text-pink-900 font-sans pb-20"
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
