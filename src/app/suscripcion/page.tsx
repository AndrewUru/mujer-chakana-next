// src/app/suscripcion/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function SuscripcionPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      setUserId(user.id);
      setLoading(false);
    };

    fetchUser();
  }, [router]);

  const activarSuscripcion = async () => {
    if (!userId) return;

    const { error } = await supabase
      .from("perfiles")
      .update({ suscripcion_activa: true })
      .eq("user_id", userId);

    if (error) {
      setMensaje("❌ Error al activar la suscripción.");
    } else {
      setMensaje("✅ ¡Gracias por suscribirte!");
    }
  };

  if (loading) {
    return <p className="text-center py-10">Cargando...</p>;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-pink-100 flex items-center justify-center px-4">
      <div className="bg-white/80 p-8 rounded-2xl shadow-xl max-w-md text-center border border-pink-200">
        <h1 className="text-3xl font-extrabold text-pink-700 mb-2">
          ✨ Suscripción Premium
        </h1>
        <p className="text-pink-600 mb-4">
          Accede a contenido exclusivo por solo <strong>2,99 € al mes</strong>.
        </p>

        <ul className="text-left text-sm mb-6 text-gray-700">
          <li>✅ Acceso a rituales PDF</li>
          <li>✅ Audios diarios exclusivos</li>
          <li>✅ Recursos sagrados desbloqueados</li>
        </ul>

        <button
          onClick={activarSuscripcion}
          className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-6 rounded-full transition"
        >
          Activar por 2,99 €/mes
        </button>

        {mensaje && <p className="mt-4 text-pink-700 font-medium">{mensaje}</p>}
      </div>
    </main>
  );
}
