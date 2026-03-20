"use server";

import { createClient } from "@/lib/supabase/server";
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

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado.");

  const { data: appt, error: apptError } = await supabase
    .from("appointments")
    .select("id, status, professional_id, patient_id")
    .eq("id", appointmentId)
    .single();

  if (apptError || !appt || appt.professional_id !== professionalId) {
    throw new Error("Cita no encontrada para este profesional.");
  }

  if (appt.patient_id !== user.id) {
    throw new Error("Solo puedes valorar tus propias citas.");
  }

  if (appt.status !== "completed") {
    throw new Error("Solo puedes valorar citas completadas.");
  }

  const { data: existing } = await supabase
    .from("reviews")
    .select("id")
    .eq("appointment_id", appointmentId)
    .maybeSingle();

  if (existing) {
    throw new Error("Ya has valorado esta cita.");
  }

  const { error } = await supabase.from("reviews").insert({
    professional_id: professionalId,
    appointment_id: appointmentId,
    rating,
    comment: comment ?? null,
  });

  if (error) throw new Error("No se pudo guardar la reseña.");

  revalidatePath(`/professionals/${professionalId}`);
  revalidatePath(`/dashboard/patient`);
}
