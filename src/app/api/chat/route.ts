import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemPrompt =
  "Eres Samari Luz, guia ciclica de Mujer Chakana. Responde en espanol neutro, con tono amoroso y practico. Ofrece pasos concretos cuando sea util, invita a la respiracion consciente y cuida que las respuestas no superen tres parrafos cortos.";

export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Sin mensajes proporcionados." },
        { status: 400 }
      );
    }

    const sanitized = messages
      .filter(
        (message: { role: string; content: string }) =>
          message &&
          typeof message.content === "string" &&
          (message.role === "assistant" || message.role === "user")
      )
      .map((message: { role: string; content: string }) => ({
        role: message.role,
        content: message.content.slice(0, 1000),
      }));

    const contextNote =
      context && context.currentDay
        ? `La usuaria se encuentra en el dia ${context.currentDay} de su ciclo.`
        : "La usuaria no especifica dia del ciclo.";

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: `${systemPrompt} ${contextNote}` },
        ...sanitized,
      ],
      temperature: 0.7,
      max_tokens: 350,
    });

    const reply = completion.choices[0]?.message?.content?.trim();

    if (!reply) {
      throw new Error("Respuesta vacia desde OpenAI");
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "No se pudo generar la respuesta." },
      { status: 500 }
    );
  }
}
