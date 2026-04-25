"use client"

import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/lib/clerk-shim"

const supabase = createClient()

/**
 * Profile shape used across the dashboard. The underlying `profiles`
 * Supabase table uses `id`, `role`, `is_onboarded` (etc), so we keep
 * those as the canonical fields and add **legacy aliases**
 * (`user_id`, `user_type`, `full_name`, `onboarding_completed`)
 * so existing consumers don't break.
 */
export interface Profile {
  id: string
  role: "patient" | "professional" | "admin"
  first_name: string | null
  last_name: string | null
  email: string | null
  date_of_birth: string | null
  gender: string | null
  avatar_url: string | null
  is_onboarded: boolean
  // Legacy aliases — kept so older code keeps working
  user_id: string
  user_type: "patient" | "professional" | "admin"
  full_name: string
  onboarding_completed: boolean
}

export function useProfile() {
  const { user, isLoaded } = useUser()

  const { data: profile, error, isLoading, mutate } = useSWR(
    user?.id ? ["profile", user.id] : null,
    async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, role, first_name, last_name, email, date_of_birth, gender, avatar_url, is_onboarded"
        )
        .eq("id", user!.id)
        .maybeSingle()

      if (error) throw error
      if (!data) return null

      const role = (data.role || "patient") as Profile["role"]
      const fullName =
        [data.first_name, data.last_name].filter(Boolean).join(" ").trim() || ""

      // Return both canonical + legacy field names so any consumer works
      return {
        ...data,
        role,
        is_onboarded: !!data.is_onboarded,
        // legacy aliases
        user_id: data.id,
        user_type: role,
        full_name: fullName,
        onboarding_completed: !!data.is_onboarded,
      } as Profile
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  )

  return {
    profile: profile ?? null,
    // Don't block forever: if auth is loaded but there's no user we are
    // simply "not loading" anymore, so consumers can fall back.
    isLoading: !isLoaded || (isLoaded && !!user && isLoading),
    error,
    mutate,
  }
}
