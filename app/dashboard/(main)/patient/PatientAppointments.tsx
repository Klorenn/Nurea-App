"use client";

import { useState, useTransition } from "react";
import type { Appointment, Slot, Professional, Review } from "@prisma/client";
import { cancelAppointment, rescheduleAppointment } from "@/actions/appointments";
import { createReview } from "@/actions/reviews";
import { format } from "date-fns";

type AppointmentWithRelations = Appointment & {
  slot: Slot;
  professional: Professional;
  review: Review | null;
};

interface Props {
  appointments: AppointmentWithRelations[];
}

interface SlotOption {
  id: string;
  startTime: string;
  endTime: string;
}

export default function PatientAppointments({ appointments }: Props) {
  const [isPending, startTransition] = useTransition();
  const [rescheduleFor, setRescheduleFor] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [slots, setSlots] = useState<SlotOption[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const handleCancel = (apptId: string, professionalId: string) => {
    startTransition(async () => {
      try {
        await cancelAppointment(apptId, professionalId);
      } catch (e) {
        console.error(e);
        alert(e instanceof Error ? e.message : "Error al cancelar");
      }
    });
  };

  const openReschedule = (apptId: string) => {
    setRescheduleFor(apptId);
    setRescheduleDate("");
    setSlots([]);
  };

  const fetchSlots = async (professionalId: string, dateStr: string) => {
    if (!dateStr) return;
    setLoadingSlots(true);
    try {
      const res = await fetch(
        `/api/profesionales/${professionalId}/slots?date=${dateStr}`,
      );
      const data = await res.json();
      setSlots(data.slots ?? []);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleReschedule = (
    appointmentId: string,
    professionalId: string,
    newSlotId: string,
  ) => {
    startTransition(async () => {
      try {
        await rescheduleAppointment(appointmentId, professionalId, newSlotId);
        setRescheduleFor(null);
      } catch (e) {
        console.error(e);
        alert(e instanceof Error ? e.message : "Error al reprogramar");
      }
    });
  };

  const handleReviewSubmit = (formData: FormData) => {
    setReviewError(null);
    startTransition(async () => {
      try {
        await createReview(formData);
      } catch (e) {
        setReviewError(e instanceof Error ? e.message : "Error al enviar reseña");
      }
    });
  };

  if (!appointments.length) {
    return (
      <p className="text-sm text-muted-foreground">No tienes citas aún.</p>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((appt) => (
        <div
          key={appt.id}
          className="flex flex-col gap-2 rounded-lg border bg-card p-4 text-sm"
        >
          <div className="flex justify-between">
            <div>
              <p className="font-semibold">{appt.professional.name}</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(appt.slot.startTime), "dd/MM/yyyy HH:mm")}
              </p>
            </div>
            <span className="text-xs uppercase text-muted-foreground">
              {appt.status}
            </span>
          </div>

          {appt.status === "confirmed" && (
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                onClick={() => handleCancel(appt.id, appt.professionalId)}
                disabled={isPending}
                className="rounded border border-red-200 px-3 py-1 text-xs text-red-700 hover:bg-red-50 disabled:opacity-60 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950"
              >
                Cancelar
              </button>
              <button
                onClick={() => openReschedule(appt.id)}
                disabled={isPending}
                className="rounded border px-3 py-1 text-xs hover:bg-muted disabled:opacity-60"
              >
                Reprogramar
              </button>

              {rescheduleFor === appt.id && (
                <div className="mt-3 w-full rounded border bg-muted/30 p-3">
                  <label className="mb-2 block text-xs font-medium">
                    Elige nuevo día
                  </label>
                  <input
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => {
                      const v = e.target.value;
                      setRescheduleDate(v);
                      fetchSlots(appt.professionalId, v);
                    }}
                    min={format(new Date(), "yyyy-MM-dd")}
                    className="mb-2 rounded border px-2 py-1 text-xs"
                  />
                  {loadingSlots && (
                    <p className="text-xs text-muted-foreground">
                      Cargando horarios...
                    </p>
                  )}
                  {!loadingSlots && slots.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {slots.map((slot) => (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() =>
                            handleReschedule(
                              appt.id,
                              appt.professionalId,
                              slot.id,
                            )
                          }
                          disabled={isPending}
                          className="rounded border bg-background px-3 py-1 text-xs hover:bg-primary hover:text-primary-foreground disabled:opacity-60"
                        >
                          {format(new Date(slot.startTime), "HH:mm")}
                        </button>
                      ))}
                    </div>
                  )}
                  {!loadingSlots && rescheduleDate && slots.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      No hay horarios libres ese día.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {appt.status === "completed" && (
            <div className="mt-2 border-t pt-2">
              {appt.review ? (
                <p className="text-xs text-muted-foreground">
                  ★ Ya valoraste esta cita ({appt.review.rating}/5)
                </p>
              ) : (
                <form
                  action={handleReviewSubmit}
                  className="flex flex-col gap-2 text-xs"
                >
                  <input
                    type="hidden"
                    name="professionalId"
                    value={appt.professionalId}
                  />
                  <input
                    type="hidden"
                    name="appointmentId"
                    value={appt.id}
                  />
                  <label className="flex items-center gap-2">
                    <span>Valoración:</span>
                    <select
                      name="rating"
                      className="rounded border px-2 py-1"
                      defaultValue="5"
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                    </select>
                  </label>
                  <textarea
                    name="comment"
                    placeholder="Comentario (opcional)"
                    className="min-h-[60px] rounded border px-2 py-1"
                    rows={2}
                  />
                  {reviewError && (
                    <p className="text-red-600 dark:text-red-400">
                      {reviewError}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-fit rounded bg-primary px-3 py-1 text-primary-foreground disabled:opacity-60"
                  >
                    Enviar reseña
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
