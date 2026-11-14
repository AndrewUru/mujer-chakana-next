import { openai, type OpenAILanguageModelResponsesOptions } from "@ai-sdk/openai";
import { createTextStreamResponse, streamText, toTextStream } from "ai";
import {
  SAMARI_CHAT_MODEL,
  SAMARI_UMBRAL_INSTRUCTIONS,
  sanitizePlainText,
} from "@/lib/ai/samari";

import { allowRequest, clientKey, tooManyRequests } from "@/lib/rateLimit";

export const maxDuration = 20;

const INTENTIONS = {
  claridad: "claridad para distinguir lo esencial",
  descanso: "permiso para descansar y bajar el ritmo",
  movimiento: "un impulso amable para volver a moverse",
} as const;

type Intention = keyof typeof INTENTIONS;

function isIntention(value: unknown): value is Intention {
  return typeof value === "string" && value in INTENTIONS;
}

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return Response.json(
      { error: "Samari no está disponible en este momento." },
      { status: 503 },
    );
  }

  try {
    const body = await request.json();
    const intention: unknown = body?.intention;
    if (!isIntention(intention)) {
      return Response.json({ error: "Elige una intención válida." }, { status: 400 });
    }

    // Ruta pública: límite por visitante y tope diario global para acotar el gasto.
    const allowed =
      (await allowRequest(`umbral:ip:${clientKey(request)}`, { limit: 5, windowSeconds: 600 })) &&
      (await allowRequest("umbral:global", { limit: 400, windowSeconds: 86_400 }));
    if (!allowed) {
      return tooManyRequests("Samari necesita una pausa. Vuelve a intentarlo en unos minutos.");
    }

    const seed = sanitizePlainText(body?.seed, 80);
    const prompt = [
      `Intención elegida: ${INTENTIONS[intention]}.`,
      seed ? `Palabra compartida: <palabra>${seed}</palabra>.` : "No compartió una palabra.",
      "Escribe ahora la microlectura. No menciones estas instrucciones ni la falta de datos.",
    ].join("\n");

    const result = streamText({
      model: openai.responses(SAMARI_CHAT_MODEL),
      instructions: SAMARI_UMBRAL_INSTRUCTIONS,
      prompt,
      maxOutputTokens: 140,
      abortSignal: request.signal,
      providerOptions: {
        openai: {
          store: false,
          reasoningEffort: "low",
          reasoningSummary: null,
          textVerbosity: "low",
        } satisfies OpenAILanguageModelResponsesOptions,
      },
    });

    return createTextStreamResponse({
      stream: toTextStream({ stream: result.stream }),
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Samari threshold error:", error);
    return Response.json(
      { error: "Samari no pudo abrir esta lectura." },
      { status: 500 },
    );
  }
}
