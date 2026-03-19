'use client';

import { useEffect, useState, useTransition } from "react";
import { Calendar } from "@/components/ui/calendar";
import { bookAppointment } from "@/actions/appointments";
import { format } from "date-fns";

interface CalendarViewProps {
  professionalId: string;
}

interface Slot {
  id: string;
  startTime: string;
  endTime: string;
}

export default function CalendarView({ professionalId }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!selectedDate) {
      setSlots([]);
      setSelectedSlotId(null);
      return;
    }

    const fetchSlots = async () => {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      try {
        const res = await fetch(
          `/api/profesionales/${professionalId}/slots?date=${dateStr}`
        );

        if (!res.ok) {
          console.error("Error fetching slots", res.status);
          setSlots([]);
          setSelectedSlotId(null);
          return;
        }

        const text = await res.text();
        if (!text) {
          setSlots([]);
          setSelectedSlotId(null);
          return;
        }

        const data = JSON.parse(text);
        setSlots(data.slots ?? []);
        setSelectedSlotId(null);
      } catch (error) {
        console.error("Failed to load slots", error);
        setSlots([]);
        setSelectedSlotId(null);
      }
    };

    fetchSlots();
  }, [selectedDate, professionalId]);

  const handleBook = async (formData: FormData) => {
    if (!selectedSlotId) return;

    startTransition(async () => {
      await bookAppointment(formData, professionalId, selectedSlotId);
    });
  };

  return (
    <div>
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={setSelectedDate}
        className="rounded-md border"
      />

      {selectedDate && (
        <div className="mt-4">
          {slots.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay horarios disponibles para este día.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {slots.map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() =>
                    setSelectedSlotId(
                      slot.id === selectedSlotId ? null : slot.id
                    )
                  }
                  className={`rounded border px-3 py-2 text-sm ${
                    slot.id === selectedSlotId
                      ? "bg-blue-600 text-white"
                      : "hover:bg-muted"
                  }`}
                >
                  {format(new Date(slot.startTime), "HH:mm")}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedSlotId && (
        <form action={handleBook} className="mt-6 space-y-4">
          <input name="patientName" placeholder="Tu nombre" required />
          <input name="patientEmail" type="email" placeholder="Email" required />
          <input
            name="patientPhone"
            placeholder="Teléfono/WhatsApp"
            required
          />
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-lg bg-blue-600 p-3 text-white disabled:opacity-60"
          >
            {isPending ? "Agendando..." : "Agendar cita"}
          </button>
        </form>
      )}
    </div>
  );
}

