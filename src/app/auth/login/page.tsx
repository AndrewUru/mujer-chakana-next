"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-100 via-pink-200 to-rose-300 relative overflow-hidden pb-20">
      {/* Fondo blur decorativo */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-rose-300 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-10 right-20 w-96 h-96 bg-rose-500 rounded-full blur-2xl opacity-10" />
      </div>

      {/* Contenedor login */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl px-8 py-10 flex flex-col items-center"
      >
        {/* Logo */}
        <Image
          src="/logo_chakana.png"
          alt="Logo Mujer Chakana"
          width={76}
          height={76}
          className="rounded-full shadow-lg mb-5"
          priority
        />

        {/* Título */}
        <h1 className="text-2xl sm:text-3xl font-bold text-center bg-gradient-to-r from-rose-700 to-rose-900 bg-clip-text text-transparent mb-3 drop-shadow">
          Inicia sesión en <p className="font-extrabold">Mujer Chakana</p>
        </h1>

        {/* Frase bienvenida */}
        <p className="text-rose-900/90 text-center mb-7">
          Bienvenida de nuevo. <br />
          Conecta con tu ciclo y tu sabiduría interior.
        </p>

        {/* Aquí va tu formulario */}
        <div className="w-full">
          <LoginForm />
        </div>
      </motion.div>
    </main>
  );
}
