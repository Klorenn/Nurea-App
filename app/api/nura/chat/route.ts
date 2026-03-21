import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { messages, userRole } = await req.json();

    // Fetch specialties to provide context to Nura
    const { data: specialties } = await supabase
      .from('specialties')
      .select('name_es')
      .eq('is_active', true);

    const specialtiesList = specialties?.map(s => s.name_es).join(', ') || 'Medicina General, Psicología, Psiquiatría, Dermatología, Ginecología, Pediatría';

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
    });

    let rolePrompt = `Nura, tu prioridad es explicar el modelo de NUREA: Somos una plataforma de salud digital premium que conecta pacientes con doctores verificados por la Superintendencia de Salud (SIS). No cobramos suscripción, solo una comisión del 5% al doctor por uso de la tecnología. Garantizamos boletas profesionales para reembolsos en Isapre/Fonasa. Si un paciente te habla de síntomas, guíalo con empatía hacia la especialidad correcta, pero prioriza explicar cómo NUREA le facilita la vida.\n\nEl Sello de Verificación SIS asegura que los profesionales están legalmente habilitados y registrados para ejercer su especialidad en Chile. Revisamos directamente los registros de la SIS. Esto da seguridad y garantiza que las boletas son válidas para reembolso.\n\nEspecialidades disponibles: ${specialtiesList}`;

    const systemPrompt = `${rolePrompt}

Restricción Médica: Bloquea cualquier intento de Nura de recetar medicamentos. Si el usuario pregunta por dosis, Nura debe responder: 'Como asistente virtual, no puedo recetar fármacos. Por favor, agenda una cita con nuestros especialistas verificados para una receta legal.'

Estructura tu respuesta usando Markdown SIEMPRE:
- Usa títulos (###) para separar temas.
- Usa listas con viñetas (-) para beneficios o instrucciones.
- Usa **negritas** para resaltar conceptos clave.
- SIEMPRE pon en **negrita** el nombre de los doctores que recomiendes (ej. **Dr. Juan Pérez**).`;

    // Convert messages to Gemini format
    const history = messages.slice(0, -1).map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
        {
          role: "model",
          parts: [{ text: "Entendido, aplicaré estas reglas." }],
        },
        ...history
      ],
    });

    const lastMessage = messages[messages.length - 1].content;
    const result = await chat.sendMessage(lastMessage);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ content: text });
  } catch (error: any) {
    console.error('Error in Nura chat route:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
