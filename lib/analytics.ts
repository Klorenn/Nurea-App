/**
 * Telemetría mínima del flujo de agendamiento.
 * Permite saber dónde abandonan los usuarios.
 * En producción conectar a tu proveedor (PostHog, Mixpanel, GA4, etc.).
 */

export type BookingEvent =
  | "click_agendar"
  | "calendar_opened"
  | "slot_selected"
  | "appointment_created"
  | "chat_opened_after_booking";

export type BookingEventPayload = {
  click_agendar?: { professionalId: string; source?: string };
  calendar_opened?: { professionalId: string };
  slot_selected?: { professionalId: string; slotId: string; date: string };
  appointment_created?: { appointmentId: string; professionalId: string };
  chat_opened_after_booking?: { professionalId: string };
};

export function trackBookingEvent(
  event: BookingEvent,
  payload: BookingEventPayload[BookingEvent] extends infer P ? (P extends undefined ? Record<string, unknown> : P) : never
): void {
  if (typeof window === "undefined") return;
  const payload_ = payload as Record<string, unknown>;
  try {
    // En desarrollo: consola. En producción: enviar a tu backend o analytics.
    if (process.env.NODE_ENV === "development") {
      console.debug("[NUREA Analytics]", event, payload_);
    }
    // Ejemplo para producción (descomentar y configurar):
    // fetch("/api/analytics/track", { method: "POST", body: JSON.stringify({ event, ...payload_ }) });
  } catch {
    // noop
  }
}
