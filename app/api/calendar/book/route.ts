import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase credentials not configured");
  return createSupabaseAdmin(url, key);
}

const DEFAULT_AUTO_MESSAGE =
  "Hola, gracias por agendar conmigo. El pago de la consulta se coordina directamente por este chat (transferencia, bono u otro medio que acordemos).";

/**
 * Crea la cita en Prisma (transacción con verificación anti-doble reserva),
 * envía el mensaje automático UNA sola vez y devuelve chatRedirect.
 * Permisos: solo usuario autenticado como paciente (patientId debe ser el suyo).
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const {
      prismaProfessionalId,
      slotId,
      patientId,
      patientName,
      patientEmail,
      patientPhone,
    } = body as {
      prismaProfessionalId: string;
      slotId: string;
      patientId: string | null;
      patientName: string;
      patientEmail: string;
      patientPhone: string;
    };

    if (!prismaProfessionalId || !slotId || !patientName || !patientEmail || !patientPhone) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Permisos: paciente solo puede crear cita para sí mismo
    const effectivePatientId = patientId?.trim() || user.id;
    if (effectivePatientId !== user.id) {
      return NextResponse.json(
        { error: "Solo puedes reservar para tu propia cuenta" },
        { status: 403 }
      );
    }

    const professional = await prisma.professional.findUnique({
      where: { id: prismaProfessionalId },
      select: { supabaseUserId: true, bookingAutoMessage: true },
    });

    if (!professional) {
      return NextResponse.json(
        { error: "Profesional no encontrado" },
        { status: 404 }
      );
    }

    // Transacción: evita doble reserva (bloqueo del slot + creación atómica)
    const appointment = await prisma.$transaction(async (tx) => {
      const slot = await tx.slot.findFirst({
        where: {
          id: slotId,
          professionalId: prismaProfessionalId,
          isBooked: false,
        },
      });
      if (!slot) {
        throw new Error("UNAVAILABLE");
      }
      await tx.slot.update({
        where: { id: slotId },
        data: { isBooked: true },
      });
      const appt = await tx.appointment.create({
        data: {
          slotId,
          professionalId: prismaProfessionalId,
          patientId: effectivePatientId,
          patientName: patientName.trim(),
          patientEmail: patientEmail.trim(),
          patientPhone: patientPhone.trim(),
          status: "confirmed",
        },
      });
      return appt;
    });

    const supabaseUserId = professional.supabaseUserId;
    const messageContent =
      professional.bookingAutoMessage?.trim() || DEFAULT_AUTO_MESSAGE;

    // Mensaje automático: SOLO una vez, solo si la cita se creó y hay chat (paciente + profesional con supabase)
    if (effectivePatientId && supabaseUserId) {
      const admin = getSupabaseAdmin();
      await admin.from("messages").insert({
        sender_id: supabaseUserId,
        receiver_id: effectivePatientId,
        content: messageContent,
        read: false,
      });
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: { autoMessageSentAt: new Date() },
      });
    }

    return NextResponse.json({
      success: true,
      appointmentId: appointment.id,
      chatRedirect: supabaseUserId
        ? `/dashboard/chat?with=${supabaseUserId}`
        : null,
    });
  } catch (e: unknown) {
    if (e instanceof Error && e.message === "UNAVAILABLE") {
      return NextResponse.json(
        { error: "El horario ya no está disponible" },
        { status: 409 }
      );
    }
    console.error("Calendar book error:", e);
    return NextResponse.json(
      { error: "Error al confirmar la reserva" },
      { status: 500 }
    );
  }
}
