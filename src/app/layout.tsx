import "./globals.css";
import Navbar from "@/components/Navbar";
import SplashScreen from "@/components/SplashScreen"; // Ajusta la ruta si es necesario

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
        <SplashScreen />
        {children}
        <Navbar />
      </body>
    </html>
  );
}
