"use client"

import { createClient } from "@/lib/supabase/client"

export type AnalyticsEvent = 
  | 'im_specialist_click'
  | 'onboarding_start'
  | 'onboarding_step_complete'
  | 'onboarding_finish'
  | 'appointment_success'
  | 'checkout_start'
  | 'professional_registration_success'
  | 'hard_gate_success'

export const trackEvent = async (
  eventName: AnalyticsEvent,
  properties: Record<string, any> = {}
) => {
  // Si Supabase no está configurado (por ejemplo en entornos locales de diseño),
  // no intentamos registrar nada para evitar errores de consola molestos.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    if (process.env.NODE_ENV === "development") {
      console.debug(
        `[Analytics] Skipping ${eventName} – Supabase env vars missing`,
        properties
      )
    }
    return
  }

  const supabase = createClient()

  // Log a consola en desarrollo
  if (process.env.NODE_ENV === "development") {
    console.log(`[Analytics] ${eventName}`, properties)
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { error } = await supabase.from("analytics_events").insert({
      event_name: eventName,
      user_id: user?.id || null,
      properties: {
        ...properties,
        userAgent:
          typeof window !== "undefined"
            ? window.navigator.userAgent
            : "unknown",
        screenResolution:
          typeof window !== "undefined"
            ? `${window.screen.width}x${window.screen.height}`
            : "unknown",
      },
      url: typeof window !== "undefined" ? window.location.href : null,
    })

    if (error) throw error
  } catch (error: unknown) {
    // En desarrollo solo mostramos un aviso silencioso para no ensuciar la consola.
    if (process.env.NODE_ENV === "development") {
      if (error instanceof Error) {
        console.warn(
          `[Analytics] Error tracking ${eventName}: ${error.message}`,
          error
        )
      } else {
        console.warn(
          `[Analytics] Error tracking ${eventName} (non-Error):`,
          error
        )
      }
    }
  }
}
