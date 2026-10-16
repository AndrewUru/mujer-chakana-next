"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCookie, setCookie } from "cookies-next";
import styles from "./CookieConsent.module.css";

const CONSENT_COOKIE = "cookie_consent";
const REOPEN_EVENT = "cookie-consent:open";
// Deja que el hero se presente antes de pedir nada.
const ENTRANCE_DELAY = 1200;

/** Vuelve a mostrar el aviso para que la persona cambie su elección. */
export function reopenCookieConsent() {
  window.dispatchEvent(new Event(REOPEN_EVENT));
}

export default function CookieConsent() {
  const [state, setState] = useState<"hidden" | "shown" | "leaving">("hidden");

  useEffect(() => {
    const open = () => setState("shown");
    window.addEventListener(REOPEN_EVENT, open);
    const timer = getCookie(CONSENT_COOKIE)
      ? undefined
      : window.setTimeout(open, ENTRANCE_DELAY);
    return () => {
      window.removeEventListener(REOPEN_EVENT, open);
      window.clearTimeout(timer);
    };
  }, []);

  const choose = (value: "accepted" | "rejected") => {
    setCookie(CONSENT_COOKIE, value, { maxAge: 60 * 60 * 24 * 365 });
    setState("leaving");
  };

  if (state === "hidden") return null;

  return (
    <section
      className={styles.banner}
      data-state={state}
      aria-labelledby="cookie-title"
      onAnimationEnd={() => {
        if (state === "leaving") setState("hidden");
      }}
    >
      <p className={styles.text}>
        <strong id="cookie-title">Tu privacidad, a tu ritmo.</strong>{" "}
        Usamos cookies opcionales para mejorar la experiencia.{" "}
        <Link href="/politica-cookies">Política de cookies</Link>
      </p>
      <div className={styles.actions}>
        <button type="button" className={styles.secondary} onClick={() => choose("rejected")}>
          Solo esenciales
        </button>
        <button type="button" className={styles.primary} onClick={() => choose("accepted")}>
          Aceptar
        </button>
      </div>
    </section>
  );
}
