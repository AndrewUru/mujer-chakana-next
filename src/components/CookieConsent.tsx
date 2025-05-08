"use client";

import { useState, useEffect } from "react";
import { getCookie, setCookie } from "cookies-next";
import { CheckCircle, XCircle } from "lucide-react";

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = getCookie("cookie_consent");
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    setCookie("cookie_consent", "accepted", { maxAge: 60 * 60 * 24 * 365 });
    setShowBanner(false);
  };

  const handleReject = () => {
    setCookie("cookie_consent", "rejected", { maxAge: 60 * 60 * 24 * 365 });
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-5 left-4 right-4 md:left-20 md:right-20 z-50 bg-rose-100 text-gray-800 border border-rose-300 rounded-2xl shadow-lg p-5 flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 transition-all duration-500">
      <div className="flex items-center space-x-3">
        <span className="text-2xl">🍪</span>
        <p className="text-sm md:text-base">
          Utilizamos cookies para mejorar tu experiencia. Puedes aceptar o
          rechazar su uso.{" "}
          <a href="/politica-cookies" className="underline text-rose-700 ml-1">
            Leer política
          </a>
        </p>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={handleAccept}
          className="flex items-center space-x-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 rounded-full shadow transition"
        >
          <CheckCircle className="w-5 h-5" />
          <span>Aceptar</span>
        </button>
        <button
          onClick={handleReject}
          className="flex items-center space-x-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2 rounded-full shadow transition"
        >
          <XCircle className="w-5 h-5" />
          <span>Rechazar</span>
        </button>
      </div>
    </div>
  );
}
