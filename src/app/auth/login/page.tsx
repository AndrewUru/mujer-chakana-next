"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import LoginForm from "@/components/LoginForm";

const highlights = [
  "Accede a tus registros y rituales en segundos.",
  "Mantente al dia con los recursos que liberamos cada luna.",
  "Sincroniza tu energia con una guia hecha para ti.",
];

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[url('/bg-chakana.png')] bg-cover bg-center text-rose-900">
      <div className="absolute inset-0 bg-gradient-to-br from-white/85 via-white/75 to-rose-100/60 backdrop-blur-3xl" />
      <motion.div
        initial={{ opacity: 0.25, scale: 0.9 }}
        animate={{ opacity: 0.45, scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-rose-200/40 blur-3xl"
      />
      <motion.div
        initial={{ opacity: 0.25, scale: 0.9 }}
        animate={{ opacity: 0.4, scale: 1 }}
        transition={{ duration: 2.2, ease: "easeOut" }}
        className="pointer-events-none absolute -bottom-40 left-0 h-[420px] w-[420px] rounded-full bg-rose-100/50 blur-3xl"
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 py-12 sm:px-6 lg:flex-row lg:items-center lg:gap-16 lg:px-10">
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-xl space-y-6 text-center lg:text-left"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-100/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-rose-600">
            Regresa a tu altar digital
          </span>
          <h1 className="text-4xl font-extrabold leading-tight text-rose-950 sm:text-5xl">
            Inicia sesion y vuelve a tu ciclo consciente
          </h1>
          <p className="text-base text-rose-700 sm:text-lg">
            Desbloquea tu moonboard, continua los rituales que guardaste y recibe
            la orientacion amorosa que tejimos para esta vuelta lunar.
          </p>
          <ul className="space-y-2 text-sm text-rose-700 sm:text-base">
            {highlights.map((item) => (
              <li
                key={item}
                className="flex items-start justify-center gap-2 lg:justify-start"
              >
                <span className="mt-1 h-2 w-2 rounded-full bg-rose-500" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-center gap-3 pt-2 text-sm text-rose-600 lg:justify-start">
            <span>¿Necesitas una cuenta?</span>
            <Link
              href="/auth/register"
              className="font-semibold text-rose-700 underline-offset-2 hover:underline"
            >
              Registrate gratis
            </Link>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
          className="mt-10 w-full max-w-md rounded-[32px] border border-rose-100/80 bg-white/85 p-8 text-center shadow-2xl backdrop-blur-xl lg:mt-0"
        >
          <div className="mb-6 flex flex-col items-center gap-4">
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-full border border-rose-100 bg-white shadow-inner">
              <Image
                src="/logo_chakana.png"
                alt="Logo Mujer Chakana"
                width={64}
                height={64}
                className="h-14 w-14 object-contain"
                priority
              />
            </span>
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold text-rose-900 sm:text-3xl">
                Bienvenida de vuelta
              </h2>
              <p className="text-sm text-rose-600">
                Ingresa tus datos para continuar tu recorrido.
              </p>
            </div>
          </div>

          <LoginForm />

          <div className="mt-8 text-xs text-rose-500">
            <span className="font-semibold">Consejo:</span> si es tu primera vez
            aqui, recuerda revisar tu bandeja de correo para activar tu acceso.
          </div>
        </motion.section>
      </div>
    </main>
  );
}
