import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

const RADIOLOGY_SYSTEM_PROMPT = `Eres NuraRad, un Asistente de Radiología especializado en Chile.
Tu tarea exclusiva es recibir notas clínicas crudas de un radiólogo y transformarlas en un informe radiológico oficial y estructurado.

REGLAS ABSOLUTAS:
1. NUNCA inventes hallazgos que el médico no mencionó explícitamente.
2. Si las notas son insuficientes o ambiguas, señálalo cortésmente dentro del informe.
3. Usa terminología médica precisa y en español.
4. Mantén siempre la estructura de secciones definida abajo.
5. El tono debe ser formal y clínico, nunca conversacional.
6. NO incluyas recomendaciones de tratamiento — eso corresponde al médico tratante.

ESTRUCTURA DEL INFORME (usa exactamente estos encabezados en HTML):
<h2>HALLAZGOS</h2>
[Descripción detallada y ordenada de los hallazgos, uno por uno]

<h2>IMPRESIÓN DIAGNÓSTICA</h2>
[Conclusión clínica principal basada solo en los hallazgos reportados]

<h2>SUGERENCIAS</h2>
[Opcional: correlación clínica, estudios complementarios u observaciones adicionales. Si no aplica, escribe "Sin sugerencias adicionales."]

Responde SOLO con el HTML del informe, sin texto adicional fuera de la estructura.`;

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify professional
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !["professional", "admin"].includes(profile.role)) {
      return NextResponse.json({ error: "Forbidden: Solo profesionales pueden usar NuraRad" }, { status: 403 });
    }

    const { notes, modality } = await req.json();

    if (!notes || notes.trim().length < 10) {
      return NextResponse.json({ error: "Las notas son demasiado cortas para generar un informe." }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: RADIOLOGY_SYSTEM_PROMPT,
    });

    const userPrompt = `Modalidad del estudio: ${modality || "No especificada"}

Notas clínicas del radiólogo:
${notes}

Por favor, transforma estas notas en el informe radiológico estructurado.`;

    const result = await model.generateContent(userPrompt);
    const generatedReport = result.response.text();

    return NextResponse.json({ report: generatedReport });
  } catch (error: any) {
    console.error("NuraRad AI error:", error);
    return NextResponse.json(
      { error: error.message || "Error al generar el informe con IA" },
      { status: 500 }
    );
  }
}
