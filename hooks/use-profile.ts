"use client"

import useSWR from "swr"
import { useUser } from "@/hooks/use-user"

type SsModule = ReturnType<typeof import("@supabase/ssr")>

let supabaseClient: SsModule | null = null

async function getSupabase() {
  if (!supabaseClient) {
    supabaseClient = await import("@supabase/ssr")
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key"
  return supabaseClient.createBrowserClient(url, key)
}

/**
 * Profile shape used across the dashboard.
 */
export interface Profile {
  id: string
  userRole: "patient" | "professional" | "admin"
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
      const supabase = await getSupabase()
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, userRole, first_name, last_name, email, date_of_birth, gender, avatar_url, is_onboarded"
        )
        .eq("id", user!.id)
        .maybeSingle()

      if (error) throw error
      if (!data) return null

      const userRole = (data.userRole || "patient") as "patient" | "professional" | "admin"
      const fullName =
        [data.first_name, data.last_name].filter(Boolean).join(" ").trim() || ""

      return {
        ...data,
        userRole,
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