"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const MIN_HOURS_BEFORE_CANCEL = 24;

export async function bookAppointment(
  formData: FormData,
  professionalId: string,
  slotId: string,
) {
  // This action is called from the legacy booking-modal (app/booking/[id]/).
  // The new booking flow uses /api/appointments/create directly.
  // Redirect users to the new flow via the professionals page.
  throw new Error("Usa el flujo de reserva actualizado en /professionals/" + professionalId);
}

export async function cancelAppointment(
  appointmentId: string,
  professionalId: string,
) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado.");

  const { data: appt, error: fetchError } = await supabase
    .from("appointments")
    .select("id, status, appointment_date, appointment_time, patient_id")
    .eq("id", appointmentId)
    .single();

  if (fetchError || !appt) throw new Error("Cita no encontrada.");
  if (appt.patient_id !== user.id) throw new Error("No tienes permiso para cancelar esta cita.");
  if (appt.status === "cancelled") return;

  const apptDateTime = new Date(`${appt.appointment_date}T${appt.appointment_time}`);
  const diffHours = (apptDateTime.getTime() - Date.now()) / (1000 * 60 * 60);

  if (diffHours < MIN_HOURS_BEFORE_CANCEL) {
    throw new Error("La cita no se puede cancelar con menos de 24 horas de antelación.");
  }

  const { error } = await supabase
    .from("appointments")
    .update({ status: "cancelled" })
    .eq("id", appointmentId);

  if (error) throw new Error("No se pudo cancelar la cita.");

  revalidatePath(`/professionals/${professionalId}`);
  revalidatePath(`/dashboard/patient`);
}

export async function rescheduleAppointment(
  appointmentId: string,
  professionalId: string,
  newDate: string,
  newTime: string,
) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado.");

  const { data: appt, error: fetchError } = await supabase
    .from("appointments")
    .select("id, status, patient_id")
    .eq("id", appointmentId)
    .single();

  if (fetchError || !appt) throw new Error("Cita no encontrada.");
  if (appt.patient_id !== user.id) throw new Error("No tienes permiso para reprogramar esta cita.");
  if (appt.status === "cancelled") throw new Error("No se puede reprogramar una cita cancelada.");

  const newDateTime = new Date(`${newDate}T${newTime}`);
  if (newDateTime <= new Date()) throw new Error("No se puede reprogramar a una hora pasada.");

  const { error } = await supabase
    .from("appointments")
    .update({
      appointment_date: newDate,
      appointment_time: newTime,
      status: "confirmed",
    })
    .eq("id", appointmentId);

  if (error) throw new Error("No se pudo reprogramar la cita.");

  revalidatePath(`/professionals/${professionalId}`);
  revalidatePath(`/dashboard/patient`);
}
