"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, CalendarDays, CheckCircle2, Clock, Loader2, MessageCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { trackBookingEvent } from "@/lib/analytics";

interface Slot {
  id: string;
  startTime: string;
  endTime: string;
}

interface ProfessionalInfo {
  prismaId: string;
  supabaseUserId: string;
  name: string;
  specialty?: string;
}

export function BookingCalendarClient() {
  const searchParams = useSearchParams();
  const professionalId = searchParams.get("professionalId");
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [info, setInfo] = useState<ProfessionalInfo | null>(null);
  const [loadingProfessional, setLoadingProfessional] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [bookingSuccess, setBookingSuccess] = useState<{ chatRedirect: string | null; appointmentId: string } | null>(null);

  useEffect(() => {
    if (!professionalId) {
      setLoadingProfessional(false);
      return;
    }
    fetch(`/api/calendar/professional?professionalId=${encodeURIComponent(professionalId)}`)
      .then((res) => {
        if (res.status === 404) {
          setInfo(null);
          return;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.prismaId) {
          setInfo(data);
          trackBookingEvent("calendar_opened", { professionalId: professionalId! });
        } else setInfo(null);
      })
      .catch(() => setInfo(null))
      .finally(() => setLoadingProfessional(false));
  }, [professionalId]);

  useEffect(() => {
    if (authLoading) return;
    if (!professionalId) {
      router.replace("/explore");
      return;
    }
    if (!user) {
      const callbackUrl = encodeURIComponent(`/dashboard/calendar?professionalId=${professionalId}`);
      router.replace(`/login?callbackUrl=${callbackUrl}`);
    }
  }, [user, authLoading, professionalId, router]);

  useEffect(() => {
    if (!selectedDate || !info?.prismaId) {
      setSlots([]);
      setSelectedSlotId(null);
      return;
    }
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    fetch(`/api/profesionales/${info.prismaId}/slots?date=${dateStr}`)
      .then((res) => (res.ok ? res.json() : { slots: [] }))
      .then((data) => {
        setSlots(data.slots ?? []);
        setSelectedSlotId(null);
      })
      .catch(() => setSlots([]));
  }, [selectedDate, info?.prismaId]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedSlotId || !info) return;
    const form = e.currentTarget;
    const patientName = (form.elements.namedItem("patientName") as HTMLInputElement)?.value;
    const patientEmail = (form.elements.namedItem("patientEmail") as HTMLInputElement)?.value;
    const patientPhone = (form.elements.namedItem("patientPhone") as HTMLInputElement)?.value;
    if (!patientName?.trim() || !patientEmail?.trim() || !patientPhone?.trim()) {
      toast.error("Completa nombre, email y teléfono");
      return;
    }
    startTransition(async () => {
      try {
        const res = await fetch("/api/calendar/book", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prismaProfessionalId: info.prismaId,
            slotId: selectedSlotId,
            patientId: user?.id ?? null,
            patientName: patientName.trim(),
            patientEmail: patientEmail.trim(),
            patientPhone: patientPhone.trim(),
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error || "Error al reservar");
          return;
        }
        trackBookingEvent("appointment_created", {
          appointmentId: data.appointmentId,
          professionalId: info.supabaseUserId ?? info.prismaId,
        });
        setBookingSuccess({
          chatRedirect: data.chatRedirect ?? null,
          appointmentId: data.appointmentId,
        });
      } catch {
        toast.error("Error al confirmar la reserva");
      }
    });
  };

  if (authLoading || loadingProfessional) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!professionalId) {
    router.replace("/explore");
    return null;
  }

  // Pantalla de confirmación post-reserva (cierre emocional del flujo)
  if (bookingSuccess) {
    return (
      <div className="mx-auto max-w-md px-4 py-12">
        <Card className="border-primary/20">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Cita solicitada</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Chat abierto con el especialista. Puedes coordinar horario y pago por mensaje.
            </p>
            <div className="mt-8 flex flex-col gap-3">
              {bookingSuccess.chatRedirect ? (
                <Button
                  size="lg"
                  className="w-full"
                  asChild
                  onClick={() =>
                    trackBookingEvent("chat_opened_after_booking", {
                      professionalId: info?.supabaseUserId ?? professionalId ?? "",
                    })
                  }
                >
                  <Link href={bookingSuccess.chatRedirect}>Ir al chat</Link>
                </Button>
              ) : null}
              <Button variant="outline" size="lg" className="w-full" asChild>
                <Link href="/dashboard">Volver al inicio</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!info) {
    return (
      <div className="mx-auto max-w-md px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle>Calendario no disponible</CardTitle>
            <CardDescription>
              Este profesional aún no tiene horarios configurados en la plataforma. Puedes contactarlo directamente por chat para coordinar la cita.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href={`/dashboard/chat?with=${professionalId}`}>
                <MessageCircle className="mr-2 h-4 w-4" />
                Abrir chat con el especialista
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/explore">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Agendar cita</h1>
          <p className="text-sm text-muted-foreground">
            {info.name}
            {info.specialty ? ` · ${info.specialty}` : ""}
          </p>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CalendarDays className="h-5 w-5 text-primary" />
            Elige fecha y hora
          </CardTitle>
          <CardDescription>
            El pago de la consulta se coordina directamente con el especialista por chat después de reservar.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            locale={es}
            className="rounded-md border-0"
            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
          />

          {selectedDate && (
            <div className="mt-6">
              <p className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Clock className="h-4 w-4" />
                Horarios disponibles · {format(selectedDate, "EEEE d MMMM", { locale: es })}
              </p>
              {slots.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No hay horarios disponibles este día. Elige otra fecha.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {slots.map((slot) => (
                    <Button
                      key={slot.id}
                      type="button"
                      variant={selectedSlotId === slot.id ? "default" : "outline"}
                      size="sm"
                      className="h-9"
                      onClick={() => {
                        setSelectedSlotId(slot.id === selectedSlotId ? null : slot.id);
                        if (slot.id !== selectedSlotId) {
                          trackBookingEvent("slot_selected", {
                            professionalId: info.prismaId,
                            slotId: slot.id,
                            date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : "",
                          });
                        }
                      }}
                    >
                      {format(new Date(slot.startTime), "HH:mm")}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedSlotId && (
            <form onSubmit={handleSubmit} className="mt-8 space-y-4 border-t pt-6">
              <p className="text-sm font-medium">Datos de contacto</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="patientName">Nombre completo</Label>
                  <Input
                    id="patientName"
                    name="patientName"
                    defaultValue={user.user_metadata?.first_name && user.user_metadata?.last_name
                      ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`.trim()
                      : ""}
                    placeholder="Tu nombre"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patientEmail">Email</Label>
                  <Input
                    id="patientEmail"
                    name="patientEmail"
                    type="email"
                    defaultValue={user.email ?? ""}
                    placeholder="tu@email.com"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="patientPhone">Teléfono o WhatsApp</Label>
                <Input
                  id="patientPhone"
                  name="patientPhone"
                  type="tel"
                  placeholder="+56 9 1234 5678"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Confirmando...
                  </>
                ) : (
                  "Confirmar reserva"
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
