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
    handleReject();
  };

  if (!showBanner) return null;

  return (
      <div
        className={`fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom))] left-3 right-3 z-[60] transition-all duration-500 ease-out sm:bottom-5 ${
          isVisible
            ? "translate-y-0 opacity-100 scale-100"
            : "translate-y-full opacity-0 scale-95"
        }`}
        role="dialog"
        aria-modal="false"
        aria-labelledby="cookie-title"
        aria-describedby="cookie-description"
      >
        <div className="mx-auto max-w-3xl rounded-[24px] border border-rose-200/60 bg-white/95 p-4 shadow-[0_24px_70px_rgba(76,5,25,0.22)] backdrop-blur-xl sm:p-5">
          {/* Close button */}
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-full text-slate-500 transition-colors duration-200 hover:bg-rose-50 hover:text-rose-700 sm:right-3 sm:top-3"
            aria-label="Cerrar y usar solo cookies esenciales"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          <div className="flex flex-col gap-4 pr-7 md:flex-row md:items-center md:justify-between md:gap-6">
            {/* Content */}
            <div className="flex flex-1 items-start gap-3 sm:gap-4">
              <div className="flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-rose-100 to-rose-200 sm:h-11 sm:w-11">
                  <span className="text-xl">🍪</span>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h3
                  id="cookie-title"
                  className="mb-1 text-lg font-semibold text-slate-900"
                >
                  Tu privacidad es importante
                </h3>
                <p
                  id="cookie-description"
                  className="mb-2 text-sm leading-relaxed text-slate-600"
                >
                  Usamos cookies opcionales para analizar y mejorar la
                  experiencia. Puedes continuar únicamente con las esenciales.
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
            <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
              <button
                type="button"
                onClick={handleAccept}
                className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 px-5 py-2.5 font-semibold text-white shadow-lg transition hover:from-rose-700 hover:to-rose-800 hover:shadow-xl"
                aria-label="Aceptar todas las cookies"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Aceptar todas</span>
              </button>

              <button
                type="button"
                onClick={handleReject}
                className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-100 px-5 py-2.5 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-200"
                aria-label="Rechazar cookies no esenciales"
              >
                <XCircle className="w-5 h-5" />
                <span>Solo esenciales</span>
              </button>
            </div>
          </div>
        </div>
      </div>
  );
}
