import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

const DEFAULT_MESSAGE =
  "Hola, gracias por agendar conmigo. El pago de la consulta se coordina directamente por este chat (transferencia, bono u otro medio que acordemos).";

/**
 * GET: devuelve el mensaje automático del profesional (Prisma, por supabaseUserId).
 * PATCH: actualiza bookingAutoMessage.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const professional = await prisma.professional.findFirst({
      where: { supabaseUserId: user.id },
      select: { id: true, bookingAutoMessage: true },
    });

    if (!professional) {
      return NextResponse.json(
        { error: "Professional calendar not linked", bookingAutoMessage: null },
        { status: 404 }
      );
    }

    return NextResponse.json({
      bookingAutoMessage:
        professional.bookingAutoMessage?.trim() || DEFAULT_MESSAGE,
    });
  } catch (e) {
    console.error("Booking settings GET error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { bookingAutoMessage } = body as { bookingAutoMessage: string | null };

    const professional = await prisma.professional.findFirst({
      where: { supabaseUserId: user.id },
    });

    if (!professional) {
      return NextResponse.json(
        { error: "Professional calendar not linked" },
        { status: 404 }
      );
    }

    await prisma.professional.update({
      where: { id: professional.id },
      data: {
        bookingAutoMessage:
          typeof bookingAutoMessage === "string"
            ? bookingAutoMessage.trim() || null
            : null,
      },
    });

    return NextResponse.json({
      success: true,
      bookingAutoMessage:
        typeof bookingAutoMessage === "string"
          ? bookingAutoMessage.trim() || DEFAULT_MESSAGE
          : DEFAULT_MESSAGE,
    });
  } catch (e) {
    console.error("Booking settings PATCH error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
