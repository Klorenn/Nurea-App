import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Resuelve professionalId (Supabase profile id) a profesional en Prisma.
 * GET /api/calendar/professional?professionalId=uuid
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const professionalId = searchParams.get("professionalId");
    if (!professionalId) {
      return NextResponse.json(
        { error: "professionalId required" },
        { status: 400 }
      );
    }

    const professional = await prisma.professional.findFirst({
      where: { supabaseUserId: professionalId },
      select: {
        id: true,
        supabaseUserId: true,
        name: true,
        specialty: true,
        bookingAutoMessage: true,
      },
    });

    if (!professional) {
      return NextResponse.json(
        { error: "Professional not found or calendar not configured" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      prismaId: professional.id,
      supabaseUserId: professional.supabaseUserId,
      name: professional.name,
      specialty: professional.specialty,
      bookingAutoMessage: professional.bookingAutoMessage ?? undefined,
    });
  } catch (e) {
    console.error("Calendar professional lookup error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
