"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createReview(formData: FormData) {
  const professionalId = formData.get("professionalId") as string | null;
  const appointmentId = formData.get("appointmentId") as string | null;
  const ratingStr = formData.get("rating") as string | null;
  const comment = (formData.get("comment") as string | null)?.trim() || null;

  if (!professionalId || !appointmentId || !ratingStr) {
    throw new Error("Faltan datos para enviar la reseña.");
  }

  const rating = Number(ratingStr);
  if (rating < 1 || rating > 5 || Number.isNaN(rating)) {
    throw new Error("La valoración debe ser entre 1 y 5.");
  }

  const appt = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!appt || appt.professionalId !== professionalId) {
    throw new Error("Cita no encontrada para este profesional.");
  }

  if (appt.status !== "completed") {
    throw new Error("Solo puedes valorar citas completadas.");
  }

  const existing = await prisma.review.findFirst({
    where: { appointmentId },
  });

  if (existing) {
    throw new Error("Ya has valorado esta cita.");
  }

  await prisma.review.create({
    data: {
      professionalId,
      appointmentId,
      rating,
      comment: comment ?? undefined,
    },
  });

  revalidatePath(`/profesionales/${professionalId}`);
  revalidatePath(`/dashboard/patient`);
}
