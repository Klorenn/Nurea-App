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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, CalendarDays, CheckCircle2, Clock, Loader2, MessageCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { trackBookingEvent } from "@/lib/analytics";
import { loadingBelowHeaderClassName } from "@/lib/loading-layout";

interface Slot {
  id: string;
  time: string; // HH:mm
  durationMinutes: number;
  startTime: string;
  endTime: string;
}

interface ProfessionalInfo {
  supabaseUserId: string;
  name: string;
  specialty?: string;
  consultationType?: "online" | "in-person" | "both";
  avatarUrl?: string | null;
  bio?: string;
}

const sanitizeBioPreview = (bio: string) => {
  // El bio puede venir con HTML persistido (ej. <p>...</p> y &nbsp;).
  const withoutTags = bio
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")

  return withoutTags.replace(/\s+/g, " ").trim()
}

export function BookingCalendarClient() {
  const searchParams = useSearchParams();
  const professionalId = searchParams.get("professionalId");
  const typeParam = searchParams.get("type") as "online" | "in-person" | null;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [info, setInfo] = useState<ProfessionalInfo | null>(null);
  const [loadingProfessional, setLoadingProfessional] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [bookingSuccess, setBookingSuccess] = useState<{ chatRedirect: string | null; appointmentId: string } | null>(null);

  const [bookingType, setBookingType] = useState<"online" | "in-person">(
    typeParam === "in-person" ? "in-person" : "online"
  );

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
        if (data?.supabaseUserId) {
          setInfo(data);
          trackBookingEvent("calendar_opened", { professionalId: professionalId! });
        } else setInfo(null);
      })
      .catch(() => setInfo(null))
      .finally(() => setLoadingProfessional(false));
  }, [professionalId]);

  useEffect(() => {
    if (!info?.consultationType) return;
    if (info.consultationType === "online") setBookingType("online");
    else if (info.consultationType === "in-person") setBookingType("in-person");
    // When "both", keep the type from URL params if valid, otherwise default to "online"
    else if (typeParam === "in-person" || typeParam === "online") setBookingType(typeParam);
    else setBookingType("online");
  }, [info?.consultationType]); // eslint-disable-line @typescript-eslint/no-explicit-any

  useEffect(() => {
    // Avoid keeping a slot chosen for another modality.
    setSelectedSlotId(null);
  }, [bookingType]);

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
    if (!selectedDate || !info?.supabaseUserId) {
      setSlots([]);
      setSelectedSlotId(null);
      return;
    }
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    fetch(`/api/professionals/${info.supabaseUserId}/slots?date=${dateStr}&type=${encodeURIComponent(bookingType)}`)
      .then((res) => (res.ok ? res.json() : { slots: [] }))
      .then((data) => {
        setSlots(data.slots ?? []);
        setSelectedSlotId(null);
      })
      .catch(() => setSlots([]));
  }, [selectedDate, info?.supabaseUserId, bookingType]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedSlotId || !info) return;
    const form = e.currentTarget;
    const patientName = (form.elements.namedItem("patientName") as HTMLInputElement)?.value;
    const patientEmail = (form.elements.namedItem("patientEmail") as HTMLInputElement)?.value;
    const patientPhone = (form.elements.namedItem("patientPhone") as HTMLInputElement)?.value;
    const consultationReason = (form.elements.namedItem("consultationReason") as HTMLTextAreaElement)?.value;
    const firstVisitEl = form.elements.namedItem("isFirstVisit") as HTMLInputElement | null;
    const isFirstVisit = firstVisitEl?.checked ?? true;
    if (!patientName?.trim() || !patientEmail?.trim() || !patientPhone?.trim() || !consultationReason?.trim()) {
      toast.error("Completa nombre, email, teléfono y motivo de consulta");
      return;
    }
    const selected = slots.find((s) => s.id === selectedSlotId);
    if (!selected) return;

    startTransition(async () => {
      try {
        const dateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";
        const res = await fetch("/api/appointments/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            professionalId: info.supabaseUserId,
            appointmentDate: dateStr,
            appointmentTime: selected.time,
            type: bookingType,
            duration: selected.durationMinutes ?? 60,
            consultationReason: consultationReason.trim(),
            isFirstVisit,
            // Campos extra para mantener el formulario actual sin romper validaciones
            patientName: patientName.trim(),
            patientEmail: patientEmail.trim(),
            patientPhone: patientPhone.trim(),
            patientId: user?.id ?? null,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          const missing = Array.isArray(data?.missingFields) && data.missingFields.length > 0
            ? ` (${data.missingFields.join(", ")})`
            : "";
          toast.error(data.message || data.error || `Error al reservar${missing}`);
          return;
        }

        trackBookingEvent("appointment_created", {
          appointmentId: data?.appointment?.id ?? "",
          professionalId: info.supabaseUserId,
        });

        setBookingSuccess({
          chatRedirect: `/dashboard/chat?with=${info.supabaseUserId}`,
          appointmentId: data?.appointment?.id ?? "",
        });
      } catch {
        toast.error("Error al confirmar la reserva");
      }
    });
  };

  if (authLoading || loadingProfessional) {
    return (
      <div className={loadingBelowHeaderClassName()}>
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
    <div className="mx-auto max-w-5xl px-4 py-4">
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px] lg:gap-6">
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
          <CardContent className="p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={es}
              className="rounded-md border-0"
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
            />

            {selectedDate && (
            <div className="mt-4">
                <p className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <Clock className="h-4 w-4" />
                  Horarios disponibles · {format(selectedDate, "EEEE d MMMM", { locale: es })}
                </p>

                {info.consultationType === "both" && (
                  <div className="mb-4 flex flex-col sm:flex-row gap-2">
                    <Button
                      type="button"
                      variant={bookingType === "online" ? "default" : "outline"}
                      className="rounded-xl"
                      onClick={() => setBookingType("online")}
                    >
                      Online
                    </Button>
                    <Button
                      type="button"
                      variant={bookingType === "in-person" ? "default" : "outline"}
                      className="rounded-xl"
                      onClick={() => setBookingType("in-person")}
                    >
                      Presencial
                    </Button>
                  </div>
                )}

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
                              professionalId: info.supabaseUserId,
                              slotId: slot.id,
                              date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : "",
                            });
                          }
                        }}
                      >
                        {slot.time}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {selectedSlotId && (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4 border-t pt-6">
                <p className="text-sm font-medium">Datos de contacto</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="patientName">Nombre completo</Label>
                    <Input
                      id="patientName"
                      name="patientName"
                      defaultValue={
                        user.user_metadata?.first_name && user.user_metadata?.last_name
                          ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`.trim()
                          : ""
                      }
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
                <div className="space-y-2 pt-2">
                  <Label htmlFor="consultationReason">Motivo de consulta</Label>
                  <Textarea
                    id="consultationReason"
                    name="consultationReason"
                    placeholder="Ej: Dolor de espalda, control de rutina, ansiedad, etc."
                    required
                    className="min-h-[96px]"
                  />
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      id="isFirstVisit"
                      name="isFirstVisit"
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4"
                    />
                    <Label htmlFor="isFirstVisit" className="text-sm text-muted-foreground">
                      Es primera vez que me atiendo con este especialista
                    </Label>
                  </div>
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

        {/* Panel derecho tipo perfil del especialista */}
        <div className="lg:sticky lg:top-4">
          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="text-base">Especialista</CardTitle>
              <CardDescription>Tu cita con {info.name}</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Avatar className="size-14">
                  {info.avatarUrl ? (
                    <AvatarImage src={info.avatarUrl} alt={info.name} />
                  ) : (
                    <AvatarFallback>{info.name?.charAt(0) ?? "D"}</AvatarFallback>
                  )}
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground truncate">{info.name}</p>
                  {info.specialty ? (
                    <p className="text-sm text-muted-foreground mt-0.5">{info.specialty}</p>
                  ) : null}
                  {info.bio ? (
                    <p className="text-sm text-muted-foreground mt-3 line-clamp-3">
                      {sanitizeBioPreview(info.bio)}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-3">Sin descripción.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
