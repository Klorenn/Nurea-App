"use client"

import useSWR from "swr"
import { createBrowserClient } from "@supabase/ssr"
import { useUser } from "@/hooks/use-user"

let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null

function getSupabase() {
  if (!supabaseInstance) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key"
    supabaseInstance = createBrowserClient(url, key)
  }
  return supabaseInstance
}

/**
 * Profile shape used across the dashboard.
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
      const supabase = getSupabase()
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, role, first_name, last_name, email, date_of_birth, gender, avatar_url, is_onboarded"
        )
        .eq("id", user!.id)
        .maybeSingle()

      if (error) throw error
      if (!data) return null

      const userRole = (data.role || "patient") as "patient" | "professional" | "admin"
      const fullName =
        [data.first_name, data.last_name].filter(Boolean).join(" ").trim() || ""

      return {
        ...data,
        role: userRole,
        is_onboarded: !!data.is_onboarded,
        user_id: data.id,
        user_type: userRole,
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
    isLoading: !isLoaded || (isLoaded && !!user && isLoading),
    error,
    mutate,
  }
}
