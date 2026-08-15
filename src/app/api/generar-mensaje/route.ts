import { openai, type OpenAILanguageModelResponsesOptions } from "@ai-sdk/openai";
import { generateText } from "ai";
import {
  SAMARI_CORE_INSTRUCTIONS,
  SAMARI_REFLECTION_MODEL,
  sanitizePlainText,
  sanitizeScore,
} from "@/lib/ai/samari";
import { loadSamariContext, readBearerToken } from "@/lib/ai/samari-context";

export const maxDuration = 30;

export async function POST(request: Request) {
  const accessToken = readBearerToken(request);
  if (!accessToken) {
    return Response.json({ error: "Sesión requerida." }, { status: 401 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return Response.json(
      { error: "Samari no está configurada en este entorno." },
      { status: 503 },
    );
  }

  try {
    const [body, verifiedContext] = await Promise.all([
      request.json(),
      loadSamariContext(accessToken),
    ]);

    if (!verifiedContext) {
      return Response.json({ error: "Sesión no válida." }, { status: 401 });
    }

    const emociones = sanitizePlainText(body?.emociones, 500);
    if (!emociones) {
      return Response.json(
        { error: "Las emociones son necesarias para crear la reflexión." },
        { status: 400 },
      );
    }

    const nombre = verifiedContext.displayName || sanitizePlainText(body?.nombre, 80);
    const diaCiclo = verifiedContext.cycleDay ?? (Number(body?.dia_ciclo) || 1);
    const cicloActual =
      verifiedContext.cycleNumber ?? (Number(body?.ciclo_actual) || 1);
    const arquetipo =
      verifiedContext.archetype?.arquetipo || sanitizePlainText(body?.arquetipo, 100);

    const prompt = `
Crea una reflexión personal de dos o tres frases para el registro de hoy.

<registro_de_hoy>
Nombre: ${nombre || "sin nombre"}
Día del ciclo: ${diaCiclo}
Vuelta cíclica: ${cicloActual}
Arquetipo: ${arquetipo || "sin arquetipo"}
Emociones: ${emociones}
Energía: ${sanitizeScore(body?.energia) ?? "—"}/5
Creatividad: ${sanitizeScore(body?.creatividad) ?? "—"}/5
Espiritualidad: ${sanitizeScore(body?.espiritualidad) ?? "—"}/5
Notas: ${sanitizePlainText(body?.notas, 700) || "—"}
</registro_de_hoy>

Relaciona la reflexión con lo que realmente aparece en el registro. Si nombras el arquetipo,
hazlo con naturalidad. Termina con una invitación breve y concreta, no con una firma.
`.trim();

    const { text } = await generateText({
      model: openai.responses(SAMARI_REFLECTION_MODEL),
      instructions: SAMARI_CORE_INSTRUCTIONS,
      prompt,
      maxOutputTokens: 180,
      abortSignal: request.signal,
      providerOptions: {
        openai: {
          store: false,
          reasoningEffort: "low",
          reasoningSummary: null,
          safetyIdentifier: verifiedContext.safetyIdentifier,
          textVerbosity: "low",
        } satisfies OpenAILanguageModelResponsesOptions,
      },
    });

    const mensaje = text.trim();
    if (!mensaje) throw new Error("OpenAI devolvió una reflexión vacía.");

    return Response.json({ mensaje });
  } catch (error) {
    console.error("Samari reflection error:", error);
    return Response.json(
      { error: "No se pudo crear la reflexión en este momento." },
      { status: 500 },
    );
  }
}
