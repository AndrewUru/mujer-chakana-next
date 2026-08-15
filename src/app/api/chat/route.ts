import { openai, type OpenAILanguageModelResponsesOptions } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
} from "ai";
import {
  SAMARI_CHAT_MODEL,
  SAMARI_CORE_INSTRUCTIONS,
  sanitizeChatMessages,
} from "@/lib/ai/samari";
import {
  formatSamariContext,
  loadSamariContext,
  readBearerToken,
} from "@/lib/ai/samari-context";

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

    const messages = sanitizeChatMessages(body?.messages);
    if (messages.length === 0 || messages.at(-1)?.role !== "user") {
      return Response.json(
        { error: "Escribe un mensaje para conversar con Samari." },
        { status: 400 },
      );
    }

    const result = streamText({
      model: openai.responses(SAMARI_CHAT_MODEL),
      instructions: `${SAMARI_CORE_INSTRUCTIONS}\n\n${formatSamariContext(
        verifiedContext,
      )}`,
      messages: await convertToModelMessages(messages),
      maxOutputTokens: 450,
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

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({
        stream: result.stream,
        originalMessages: messages,
        onError: () => "Samari no pudo completar esta respuesta. Inténtalo de nuevo.",
      }),
    });
  } catch (error) {
    console.error("Samari chat error:", error);
    return Response.json(
      { error: "No se pudo iniciar la conversación con Samari." },
      { status: 500 },
    );
  }
}
