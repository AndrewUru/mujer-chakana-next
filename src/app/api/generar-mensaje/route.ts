import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const { emociones, energia, creatividad, espiritualidad, notas } =
    await req.json();

  const prompt = `
  Eres una guía espiritual del proyecto Mujer Chakana. Basándote en estos datos:
  - Emociones: ${emociones}
  - Energía: ${energia} de 5
  - Creatividad: ${creatividad} de 5
  - Espiritualidad: ${espiritualidad} de 5
  - Notas personales: ${notas}

  Genera una reflexión de 2 a 3 frases que inspire y reconecte a la usuaria con su ciclo y arquetipo diario.
  `;

  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "gpt-4o", // Puedes usar gpt-4o o gpt-3.5-turbo según tu plan
  });

  const mensaje = completion.choices[0].message.content;
  return NextResponse.json({ mensaje });
}
