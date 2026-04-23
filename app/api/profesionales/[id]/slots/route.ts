import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  addMinutes,
  setHours,
  setMinutes,
  startOfDay,
  endOfDay,
  isWithinInterval,
} from "date-fns";

export const dynamic = "force-dynamic";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: Params) {
  try {
    const url = new URL(req.url);
    const dateParam = url.searchParams.get("date");
    const { id: professionalId } = await params;

    if (!dateParam) {
      return NextResponse.json({ error: "Missing date" }, { status: 400 });
    }

    const targetDate = new Date(dateParam + "T00:00:00");
    const dayStart = startOfDay(targetDate);
    const dayEnd = endOfDay(targetDate);

    const professional = await prisma.professional.findUnique({
      where: { id: professionalId },
    });

    if (
      !professional ||
      !professional.slotDuration ||
      !professional.workDayStart ||
      !professional.workDayEnd
    ) {
      return NextResponse.json({ slots: [] });
    }

    // Día bloqueado completo (festivo, vacaciones)
    const dayOff = await prisma.professionalDayOff.findFirst({
      where: {
        professionalId,
        date: { gte: dayStart, lte: dayEnd },
      },
    });

    if (dayOff) {
      return NextResponse.json({ slots: [] });
    }

    // Bloqueos parciales (rangos de horas)
    const timeOffs = await prisma.professionalTimeOff.findMany({
      where: {
        professionalId,
        OR: [
          { startTime: { gte: dayStart, lte: dayEnd } },
          { endTime: { gte: dayStart, lte: dayEnd } },
        ],
      },
    });

    const existingSlots = await prisma.slot.findMany({
      where: {
        professionalId,
        startTime: { gte: dayStart, lte: dayEnd },
      },
      orderBy: { startTime: "asc" },
    });

    if (existingSlots.length === 0) {
      const [startH, startM] = professional.workDayStart.split(":").map(Number);
      const [endH, endM] = professional.workDayEnd.split(":").map(Number);

      let current = setMinutes(setHours(targetDate, startH), startM);
      const end = setMinutes(setHours(targetDate, endH), endM);

      const data: {
        professionalId: string;
        startTime: Date;
        endTime: Date;
        durationMin: number;
        isOnline: boolean;
        isBooked: boolean;
      }[] = [];

      while (current < end) {
        const endTime = addMinutes(current, professional.slotDuration);

        const isBlocked = timeOffs.some((block) =>
          isWithinInterval(current, {
            start: block.startTime,
            end: block.endTime,
          }),
        );

        if (!isBlocked) {
          data.push({
            professionalId,
            startTime: current,
            endTime,
            durationMin: professional.slotDuration,
            isOnline: false,
            isBooked: false,
          });
        }

        current = endTime;
      }

      if (data.length > 0) {
        await prisma.slot.createMany({ data, skipDuplicates: true });
      }
    }

    const slots = await prisma.slot.findMany({
      where: {
        professionalId,
        startTime: { gte: dayStart, lte: dayEnd },
        isBooked: false,
      },
      orderBy: { startTime: "asc" },
    });

    // No permitir reservas en el pasado: solo slots con startTime > now (UTC)
    const nowUtc = new Date();
    const availableSlots = slots.filter((s) => new Date(s.startTime) > nowUtc);

    return NextResponse.json({ slots: availableSlots });
  } catch (error) {
    console.error("Error in GET /api/profesionales/[id]/slots", error);
    return NextResponse.json({ slots: [], error: "Internal server error" });
  }
}
