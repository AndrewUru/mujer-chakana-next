"use client";

import { useState, useEffect } from "react";
import { getCookie, setCookie } from "cookies-next";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = getCookie("cookie_consent");
    if (!consent) {
      setShowBanner(true);
      // Add a small delay for smooth entrance animation
      setTimeout(() => setIsVisible(true), 100);
    }
  }, []);

  const handleAccept = () => {
    setCookie("cookie_consent", "accepted", { maxAge: 60 * 60 * 24 * 365 });
    setIsVisible(false);
    setTimeout(() => setShowBanner(false), 300);
  };

  const handleReject = () => {
    setCookie("cookie_consent", "rejected", { maxAge: 60 * 60 * 24 * 365 });
    setIsVisible(false);
    setTimeout(() => setShowBanner(false), 300);
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => setShowBanner(false), 300);
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Backdrop for better focus */}
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Main banner */}
      <div
        className={`fixed bottom-5 left-4 right-4 md:left-8 md:right-8 lg:left-20 lg:right-20 z-50 transition-all duration-500 ease-out ${
          isVisible
            ? "translate-y-0 opacity-100 scale-100"
            : "translate-y-full opacity-0 scale-95"
        }`}
        role="alert"
        aria-labelledby="cookie-title"
        aria-describedby="cookie-description"
      >
        <div className="bg-white/95 backdrop-blur-md border border-rose-200/50 rounded-3xl shadow-2xl p-6 max-w-4xl mx-auto">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
            aria-label="Cerrar banner de cookies"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0 lg:space-x-6">
            {/* Content */}
            <div className="flex items-start space-x-4 flex-1">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-rose-100 to-rose-200 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🍪</span>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h3
                  id="cookie-title"
                  className="text-lg font-semibold text-gray-900 mb-2"
                >
                  Tu privacidad es importante
                </h3>
                <p
                  id="cookie-description"
                  className="text-gray-600 text-sm leading-relaxed mb-3"
                >
                  Utilizamos cookies para mejorar tu experiencia, analizar el
                  tráfico y personalizar contenido. Puedes gestionar tus
                  preferencias en cualquier momento.
                </p>
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Info className="w-4 h-4" />
                  <span>Consulta nuestra</span>
                  <a
                    href="/politica-cookies"
                    className="text-rose-600 hover:text-rose-700 underline font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-1 rounded"
                  >
                    política de cookies
                  </a>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full lg:w-auto">
              <button
                onClick={handleAccept}
                className="flex items-center justify-center space-x-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 font-medium"
                aria-label="Aceptar todas las cookies"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Aceptar todas</span>
              </button>

              <button
                onClick={handleReject}
                className="flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-medium"
                aria-label="Rechazar cookies no esenciales"
              >
                <XCircle className="w-5 h-5" />
                <span>Solo esenciales</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
