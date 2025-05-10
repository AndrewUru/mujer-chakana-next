"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import PayPalSubscriptionButton from "@/components/PayPalSubscriptionButton";
import { PAYPAL_PLANS } from "@/lib/paypalPlans";

export default function SuscripcionPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sdkReady, setSdkReady] = useState(false);

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

      const { data: perfil } = await supabase
        .from("perfiles")
        .select("tipo_plan, suscripcion_activa")
        .eq("user_id", user.id)
        .single();

      if (perfil?.suscripcion_activa) {
        alert(`Ya tienes una suscripción ${perfil.tipo_plan}.`);
        router.push("/dashboard");
        return;
      }

      setLoading(false);
    };

    fetchUser();
  }, [router]);

  useEffect(() => {
    const loadPayPalScript = () => {
      return new Promise((resolve) => {
        if (document.getElementById("paypal-sdk")) {
          resolve(true);
          return;
        }

        const script = document.createElement("script");
        script.src =
          "https://www.paypal.com/sdk/js?client-id=ASQix2Qu6atiH43_jrk18jeSMDjB_YdTjbfI8jrTJ7x5uagNzUhuNMXacO49ZxJWr_EMpBhrpVPbOvR_&vault=true&intent=subscription";
        script.id = "paypal-sdk";
        script.onload = () => resolve(true);
        document.body.appendChild(script);
      });
    };

    loadPayPalScript().then(() => setSdkReady(true));
  }, []);

  if (loading) {
    return <p className="text-center py-10">Cargando...</p>;
  }

  return (
    <main className="flex items-center justify-center mb-20">
      <div className="bg-white/80 p-8 rounded-3xl shadow-2xl max-w-md text-center border border-rose-200 space-y-4">
        <h1 className="text-xl font-extrabold text-pink-700 mb-2">
          🌟 Suscripción Premium
        </h1>
        <p className="text-pink-600 mb-4 text-lg">
          Accede a contenido exclusivo por solo{" "}
          <span className="font-bold text-pink-800">2,99 € / mes</span> o{" "}
          <span className="font-bold text-pink-800">29,99€ / año</span>.
        </p>

        <ul className="text-left text-sm mb-6 text-gray-800 space-y-2">
          <li>✅ Acceso a rituales PDF</li>
          <li>✅ Audios diarios exclusivos</li>
          <li>✅ Recursos sagrados desbloqueados</li>
        </ul>

        {sdkReady && (
          <>
            <div className="space-y-2 border-t border-rose-100 pt-4">
              <h2 className="font-semibold text-lg text-rose-700">
                Suscripción mensual
              </h2>
              <PayPalSubscriptionButton
                planId={PAYPAL_PLANS.mensual.id}
                userId={userId}
              />
            </div>

            <div className="space-y-2 border-t border-rose-100 pt-4">
              <h2 className="font-semibold text-lg text-rose-700">
                Suscripción anual
              </h2>
              <PayPalSubscriptionButton
                planId={PAYPAL_PLANS.anual.id}
                userId={userId}
              />
            </div>
          </>
        )}

        {!sdkReady && (
          <p className="text-sm text-gray-500 italic">Cargando PayPal...</p>
        )}

        <p className="text-xs text-gray-500 pt-2">
          Cancelas cuando quieras. Procesado con PayPal.
        </p>
      </div>
    </main>
  );
}
