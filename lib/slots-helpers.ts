import {
  addMinutes,
  setHours,
  setMinutes,
  startOfDay,
  endOfDay,
  isWithinInterval,
} from "date-fns";
import { prisma } from "@/lib/prisma";

/**
 * Genera slots disponibles para un profesional de Prisma en una fecha.
 * Usado por /api/profesionales/[id]/slots y /api/professionals/[id]/slots.
 */
export async function getSlotsForPrismaProfessional(
  prismaProfessionalId: string,
  dateStr: string
): Promise<{ startTime: Date; endTime: Date; id?: string }[]> {
  const targetDate = new Date(dateStr + "T00:00:00");
  const dayStart = startOfDay(targetDate);
  const dayEnd = endOfDay(targetDate);

  const professional = await prisma.professional.findUnique({
    where: { id: prismaProfessionalId },
  });

  if (
    !professional ||
    !professional.slotDuration ||
    !professional.workDayStart ||
    !professional.workDayEnd
  ) {
    return [];
  }

  const dayOff = await prisma.professionalDayOff.findFirst({
    where: {
      professionalId: prismaProfessionalId,
      date: { gte: dayStart, lte: dayEnd },
    },
  });

  if (dayOff) return [];

  const timeOffs = await prisma.professionalTimeOff.findMany({
    where: {
      professionalId: prismaProfessionalId,
      // Cualquier bloqueo que se solape con el día, incluso si empieza antes y termina después.
      startTime: { lte: dayEnd },
      endTime: { gte: dayStart },
    },
  });

  const existingSlots = await prisma.slot.findMany({
    where: {
      professionalId: prismaProfessionalId,
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
      const isBlocked = timeOffs.some(
        (block) => current < block.endTime && endTime > block.startTime
      );
      if (!isBlocked) {
        data.push({
          professionalId: prismaProfessionalId,
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
      professionalId: prismaProfessionalId,
      startTime: { gte: dayStart, lte: dayEnd },
      isBooked: false,
    },
    orderBy: { startTime: "asc" },
  });

  const nowUtc = new Date();
  return slots
    .filter((s) => new Date(s.startTime) > nowUtc)
    .map((s) => ({
      startTime: s.startTime,
      endTime: s.endTime,
      id: s.id,
    }));
}

/**
 * Genera slots de demostración para una fecha (cuando no hay profesional en Prisma).
 * Horarios: 9:00, 10:00, 11:00, 12:00, 14:00, 16:00 en la fecha dada (hora local del servidor).
 */
export function getMockSlotsForDate(dateStr: string): { startTime: Date }[] {
  const now = new Date();
  const slots: { startTime: Date }[] = [];

  for (const hour of [9, 10, 11, 12, 14, 16]) {
    const start = new Date(dateStr + `T${String(hour).padStart(2, "0")}:00:00`);
    if (start > now) {
      slots.push({ startTime: start });
    }
  }

  return slots.slice(0, 6);
}
