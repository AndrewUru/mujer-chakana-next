"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import SetupPerfil from "@/components/SetupPerfil";
import Link from "next/link";
import Image from "next/image";

import {
  ArrowRightIcon,
  SparklesIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";

export default function SetupPage() {
  const router = useRouter();

  const [perfil, setPerfil] = useState<{
    tipo_plan: string | null;
    suscripcion_activa: boolean | null;
    fecha_expiracion?: string | null;
    display_name: string;
    avatar_url: string | null;
    email: string;
    fecha_inicio: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserAndPerfil() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/");
        return;
      }

      const { data, error } = await supabase
        .from("perfiles")
        .select(
          "tipo_plan, suscripcion_activa, fecha_expiracion, display_name, avatar_url, email, fecha_inicio"
        )
        .eq("user_id", user.id)
        .single();

      if (!error && data) {
        setPerfil(data);
      } else {
        console.warn("No se encontró perfil o hubo un error", error);
        setPerfil(null);
      }

      setLoading(false);
    }

    fetchUserAndPerfil();
  }, [router]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-pink-50 flex flex-col items-center justify-start pb-20 px-4 py-10 backdrop-blur-sm">
      <div className="max-w-6xl w-full space-y-12">
        {/* Header Section */}
        <header className="text-center">
          <div className="mb-12 mx-auto bg-white/95 border border-pink-100 p-8 rounded-3xl shadow-lg max-w-2xl text-center backdrop-blur-md">
            <div className="mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4 tracking-wide">
                🌸 Bienvenida a tu Santuario Lunar
              </h1>

              <p className="text-base text-gray-600 leading-relaxed max-w-2xl mx-auto px-4">
                Tu espacio sagrado para reconectar con tu esencia. Gestiona tu
                perfil, sigue tu ciclo y descubre contenido exclusivo
                sincronizado con las fases lunares. Todo diseñado para nutrir tu
                feminidad.
              </p>
            </div>

            {loading ? (
              <div className="animate-pulse space-y-6">
                <div className="h-24 bg-pink-100 rounded-2xl"></div>
              </div>
            ) : (
              perfil && (
                <div className="grid gap-6">
                  {/* Profile Card */}
                  <div className="bg-white/80 border border-pink-100 p-6 rounded-2xl shadow-sm">
                    <div className="flex flex-col items-center space-y-4">
                      {perfil.avatar_url && (
                        <Image
                          src={perfil.avatar_url}
                          alt="avatar"
                          width={96}
                          height={96}
                          className="rounded-full border-4 border-pink-200 shadow-lg"
                        />
                      )}
                      <div>
                        <h2 className="text-xl font-semibold text-gray-800 bg-gradient-to-r from-pink-700 to-purple-700 bg-clip-text text-transparent">
                          {perfil.display_name}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                          {perfil.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Cycle Status */}
                  <div className="backdrop-blur-lg bg-white/50 border border-pink-100 p-5 rounded-2xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-pink-100 p-2 rounded-lg">
                          <span className="text-pink-600 text-xl">🌱</span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">
                            Inicio de ciclo
                          </p>
                          <p className="font-medium text-gray-700">
                            {perfil.fecha_inicio
                              ? new Date(
                                  perfil.fecha_inicio
                                ).toLocaleDateString("es-ES")
                              : "No registrado"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Subscription Card */}
                  <div className="bg-gradient-to-br from-pink-50 to-white border border-pink-100 p-6 rounded-2xl shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                      <span className="bg-pink-600 text-white p-2 rounded-lg">
                        💎
                      </span>
                      <span>Estado de Suscripción</span>
                    </h3>

                    {perfil.suscripcion_activa ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-gray-500">Plan actual</p>
                            <p className="font-medium text-gray-800 uppercase">
                              {perfil.tipo_plan}
                            </p>
                          </div>
                          <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                            Activa
                          </span>
                        </div>
                        <Link
                          href="/suscripcion"
                          className="w-full inline-flex justify-center items-center space-x-2 bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-xl transition-all shadow-sm hover:shadow-md"
                        >
                          <span>Gestionar Plan</span>
                          <ArrowRightIcon className="w-4 h-4" />
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="text-center py-4">
                          <p className="text-gray-500 text-sm mb-2">
                            No tienes suscripción activa
                          </p>
                          <Link
                            href="/suscripcion"
                            className="inline-flex items-center space-x-2 bg-white border border-pink-200 hover:border-pink-300 text-pink-600 px-6 py-3 rounded-xl transition-all shadow-sm hover:shadow-md"
                          >
                            <SparklesIcon className="w-5 h-5" />
                            <span>Ver Planes</span>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        </header>

        {/* Profile Settings */}
        <section className="max-w-4xl mx-auto">
          <div className="backdrop-blur-lg bg-white/80 border border-pink-100 rounded-2xl shadow-sm">
            <SetupPerfil />
          </div>
        </section>

        {/* Documentation Link */}
        <div className="text-center">
          <Link
            href="/manual"
            className="inline-flex items-center space-x-2 text-pink-600 hover:text-pink-800 bg-pink-50 hover:bg-pink-100 px-6 py-3 rounded-full transition-all"
          >
            <BookOpenIcon className="w-5 h-5" />
            <span className="font-medium">Guía de Usuario</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
