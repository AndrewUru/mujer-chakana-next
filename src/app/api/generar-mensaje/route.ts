import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const {
    nombre,
    emociones,
    energia,
    creatividad,
    espiritualidad,
    notas,
    dia_ciclo,
    ciclo_actual,
    arquetipo,
  } = await req.json();

  const prompt = `
Eres una guía espiritual del proyecto Mujer Chakana. Personaliza una reflexión breve (2 frases) para la usuaria utilizando estos datos:

- Nombre de la usuaria: ${nombre}
- Día actual del ciclo: Día ${dia_ciclo}
- Número de ciclo lunar completado: ${ciclo_actual}
- Arquetipo del día: ${arquetipo}
- Emociones actuales: ${emociones}
- Energía: ${energia} de 5
- Creatividad: ${creatividad} de 5
- Espiritualidad: ${espiritualidad} de 5
- Notas personales: ${notas}

Usa un tono amoroso y sabio, menciona el nombre "${nombre}" al inicio o dentro del mensaje. Relaciona la reflexión con el arquetipo y su etapa cíclica actual (Día ${dia_ciclo}, ciclo ${ciclo_actual}). Termina con saludo amoroso de Samari Luz.

Ejemplo:
"Hoy como Guardiana del ciclo 5, tu creatividad fluye con poder renovado. Sigue navegando hacia tu sabiduría interior."

Escribe ahora la reflexión personalizada:
`;

  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "gpt-4o",
  });

  const mensaje = completion.choices[0].message.content;
  return NextResponse.json({ mensaje });
}
