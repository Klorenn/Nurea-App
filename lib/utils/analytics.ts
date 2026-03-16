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
  const supabase = createClient()
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Analytics] ${eventName}`, properties)
  }

  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        event_name: eventName,
        user_id: user?.id || null,
        properties: {
          ...properties,
          userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
          screenResolution: typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : 'unknown',
        },
        url: typeof window !== 'undefined' ? window.location.href : null,
      })

    if (error) throw error
  } catch (error) {
    console.error(`[Analytics] Error tracking ${eventName}:`, error)
  }
}
