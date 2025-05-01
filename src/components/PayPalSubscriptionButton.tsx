"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    paypal: {
      Buttons: (...args: unknown[]) => unknown;
    };
  }
}

type SubscriptionActions = {
  subscription: {
    create: (params: { plan_id: string }) => Promise<string>;
  };
};

export default function PayPalSubscriptionButton({
  planId,
  userId,
}: {
  planId: string;
  userId: string | null;
}) {
  const router = useRouter(); // 👈 Aquí arriba

  useEffect(() => {
    if (!userId) return;

    const renderPayPalButton = () => {
      const container = document.getElementById(
        `paypal-button-container-${planId}`
      );
      if (container) {
        container.innerHTML = ""; // Elimina duplicados
      }

      const paypal = window.paypal as unknown as {
        Buttons: (options: Record<string, unknown>) => {
          render: (selector: string) => void;
        };
      };

      if (paypal && typeof paypal.Buttons === "function") {
        paypal
          .Buttons({
            style: {
              shape: "rect",
              color: "gold",
              layout: "vertical",
              label: "subscribe",
            },
            createSubscription(
              data: Record<string, unknown>,
              actions: SubscriptionActions
            ) {
              return actions.subscription.create({
                plan_id: planId,
              });
            },

            async onApprove(data: { subscriptionID: string }) {
              alert("¡Suscripción completada! ID: " + data.subscriptionID);

              const { error } = await supabase
                .from("perfiles")
                .update({ suscripcion_activa: true })
                .eq("user_id", userId);

              if (error) {
                alert("❌ No se pudo actualizar tu perfil. Contacta soporte.");
              } else {
                alert("✅ Tu suscripción ha sido activada correctamente.");
                router.push("/dashboard"); // 👈 Redirige al dashboard
              }
            },
          })
          .render(`#paypal-button-container-${planId}`);
      }
    };

    const loadPayPalScript = () => {
      if (!document.getElementById("paypal-sdk")) {
        const script = document.createElement("script");
        script.src =
          "https://www.paypal.com/sdk/js?client-id=ASQix2Qu6atiH43_jrk18jeSMDjB_YdTjbfI8jrTJ7x5uagNzUhuNMXacO49ZxJWr_EMpBhrpVPbOvR_&vault=true&intent=subscription";
        script.id = "paypal-sdk";
        script.onload = renderPayPalButton;
        document.body.appendChild(script);
      } else {
        renderPayPalButton();
      }
    };

    loadPayPalScript();
  }, [planId, userId, router]); // 👈 Añadido userId y router

  return (
    <div className="my-4">
      <div id={`paypal-button-container-${planId}`} />
    </div>
  );
}
