"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { PAYPAL_SDK_URL } from "@/lib/paypalPlans";

declare global {
  interface Window {
    paypal: {
      Buttons: (...args: unknown[]) => unknown;
    };
  }
}

type SubscriptionActions = {
  subscription: {
    create: (params: { plan_id: string; custom_id: string }) => Promise<string>;
  };
};

export default function PayPalSubscriptionButton({
  planId,
  userId,
}: {
  planId: string;
  userId: string | null;
}) {
  const router = useRouter();
  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null);

  useEffect(() => {
    if (!userId) return;

    const renderPayPalButton = () => {
      const container = document.getElementById(
        `paypal-button-container-${planId}`
      );
      if (container) {
        container.innerHTML = ""; // Elimina botones antiguos
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
              // custom_id liga la suscripción a esta cuenta: el servidor y el
              // webhook lo comprueban antes de activar nada.
              return actions.subscription.create({
                plan_id: planId,
                custom_id: userId,
              });
            },
            async onApprove(data: { subscriptionID: string }) {
              setNotice({ text: "Pago recibido. Activando tu suscripción…" });
              try {
                const { data: { session } } = await supabase.auth.getSession();
                const response = await fetch("/api/suscripcion/activar", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session?.access_token ?? ""}`,
                  },
                  body: JSON.stringify({ subscriptionID: data.subscriptionID }),
                });
                if (!response.ok) {
                  const body = await response.json().catch(() => null);
                  throw new Error(body?.error || "No se pudo activar la suscripción.");
                }
                setNotice({ text: "Tu suscripción está activa. Entrando en tu espacio…" });
                router.push("/dashboard");
              } catch (error) {
                setNotice({
                  error: true,
                  text: `${error instanceof Error ? error.message : "No se pudo activar la suscripción."} Tu pago quedó registrado en PayPal (referencia ${data.subscriptionID}); si el acceso no se activa en unos minutos, escríbenos con esa referencia.`,
                });
              }
            },
            onError() {
              setNotice({ error: true, text: "PayPal no pudo completar el pago. No se ha realizado ningún cobro." });
            },
          })
          .render(`#paypal-button-container-${planId}`);
      }
    };

    const loadPayPalScript = () => {
      const existingScript = document.getElementById(
        "paypal-sdk"
      ) as HTMLScriptElement;

      if (!existingScript) {
        const script = document.createElement("script");
        script.src = PAYPAL_SDK_URL;
        script.id = "paypal-sdk";

        script.onload = () => {
          // Esperar un breve momento para asegurar que PayPal esté listo
          setTimeout(() => renderPayPalButton(), 100);
        };

        document.body.appendChild(script);
      } else {
        // Forzar render incluso si el script ya estaba cargado
        setTimeout(() => renderPayPalButton(), 100);
      }
    };

    loadPayPalScript();
  }, [planId, userId, router]);

  return (
    <div className="my-4">
      <div id={`paypal-button-container-${planId}`} />
      {notice && (
        <p role={notice.error ? "alert" : "status"} style={{ marginTop: 12, fontSize: 14, lineHeight: 1.5 }}>
          {notice.text}
        </p>
      )}
    </div>
  );
}
