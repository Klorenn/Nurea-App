"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const MIN_HOURS_BEFORE_CANCEL = 24;

export async function bookAppointment(
  formData: FormData,
  professionalId: string,
  slotId: string,
  patientId?: string | null,
) {
  const patientName = formData.get("patientName") as string | null;
  const patientEmail = formData.get("patientEmail") as string | null;
  const patientPhone = formData.get("patientPhone") as string | null;

  if (!patientName || !patientEmail || !patientPhone) {
    throw new Error("Missing patient data");
  }

  await prisma.$transaction(async (tx) => {
    const updated = await tx.slot.updateMany({
      where: {
        id: slotId,
        professionalId,
        isBooked: false,
      },
      data: { isBooked: true },
    });

    if (updated.count !== 1) {
      throw new Error("El horario ya no está disponible.");
    }

    await tx.appointment.create({
      data: {
        patientId: patientId || undefined,
        patientName,
        patientEmail,
        patientPhone,
        professionalId,
        slotId,
        status: "confirmed",
      },
    });
  });

  revalidatePath(`/profesionales/${professionalId}`);
}

export async function cancelAppointment(
  appointmentId: string,
  professionalId: string,
) {
  await prisma.$transaction(async (tx) => {
    const appt = await tx.appointment.findUnique({
      where: { id: appointmentId },
      include: { slot: true },
    });

    if (!appt) throw new Error("Appointment not found");

    if (appt.status === "cancelled") return;

    const now = new Date();
    const diffMs = appt.slot.startTime.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < MIN_HOURS_BEFORE_CANCEL) {
      throw new Error(
        "La cita no se puede cancelar con menos de 24 horas de antelación.",
      );
    }

    await tx.slot.update({
      where: { id: appt.slotId },
      data: { isBooked: false },
    });

    await tx.appointment.update({
      where: { id: appointmentId },
      data: { status: "cancelled" },
    });
  });

  revalidatePath(`/profesionales/${professionalId}`);
  revalidatePath(`/dashboard/patient`);
}

export async function rescheduleAppointment(
  appointmentId: string,
  professionalId: string,
  newSlotId: string,
) {
  await prisma.$transaction(async (tx) => {
    const appt = await tx.appointment.findUnique({
      where: { id: appointmentId },
      include: { slot: true },
    });

    if (!appt) throw new Error("Appointment not found");

    if (appt.status === "cancelled") {
      throw new Error("No se puede reprogramar una cita cancelada.");
    }

    const newSlot = await tx.slot.findUnique({
      where: { id: newSlotId },
    });

    if (!newSlot) throw new Error("Nuevo horario no encontrado.");
    if (newSlot.isBooked) throw new Error("Ese horario ya no está disponible.");
    if (newSlot.professionalId !== professionalId) {
      throw new Error("El horario pertenece a otro profesional.");
    }

    const now = new Date();
    if (newSlot.startTime <= now) {
      throw new Error("No se puede reprogramar a una hora pasada.");
    }

    await tx.slot.update({
      where: { id: appt.slotId },
      data: { isBooked: false },
    });

    await tx.slot.update({
      where: { id: newSlotId },
      data: { isBooked: true },
    });

    await tx.appointment.update({
      where: { id: appointmentId },
      data: {
        slotId: newSlotId,
        status: "confirmed",
      },
    });
  });

  revalidatePath(`/profesionales/${professionalId}`);
  revalidatePath(`/dashboard/patient`);
}
