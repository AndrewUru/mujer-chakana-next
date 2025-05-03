"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function SplashScreen() {
  const [oculto, setOculto] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setOculto(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (oculto) return null;

  return (
    <div className="fixed inset-0 bg-pink-50 flex flex-col items-center justify-center z-[9999] animate-fade-out">
      <Image
        src="/logo_chakana.png"
        alt="Mujer Chakana Logo"
        width={180}
        height={180}
        className="animate-scale-in animate-pulse-ruby"
      />
      <p className="mt-4 text-pink-700 text-lg font-semibold tracking-widest animate-fade-in-up">
        Mujer Chakana
      </p>
    </div>
  );
}
