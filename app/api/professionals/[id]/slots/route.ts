import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSlotsForPrismaProfessional, getMockSlotsForDate } from "@/lib/slots-helpers";

/**
 * GET /api/professionals/[id]/slots?date=YYYY-MM-DD
 * [id] = Supabase professional UUID (profiles.id o professionals.id).
 * Resuelve a Prisma professional por supabaseUserId; si no existe, devuelve slots de demo.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: supabaseId } = await context.params;
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");

    if (!dateParam) {
      return NextResponse.json({ error: "Missing date" }, { status: 400 });
    }

    const professional = await prisma.professional.findFirst({
      where: { supabaseUserId: supabaseId },
    });

    if (professional) {
      const slots = await getSlotsForPrismaProfessional(professional.id, dateParam);
      return NextResponse.json({
        slots: slots.map((s) => ({
          id: s.id,
          startTime: s.startTime,
          endTime: s.endTime,
        })),
      });
    }

    // Sin profesional en Prisma: devolver slots de demostración para que el calendario no quede vacío
    const mockSlots = getMockSlotsForDate(dateParam);
    return NextResponse.json({
      slots: mockSlots.map((s) => ({ startTime: s.startTime })),
      _demo: true,
    });
  } catch (error) {
    console.error("Error in GET /api/professionals/[id]/slots", error);
    return NextResponse.json(
      { slots: [], error: "Internal server error" },
      { status: 500 }
    );
  }
}
