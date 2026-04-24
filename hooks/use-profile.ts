"use client"

import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@clerk/nextjs"

const supabase = createClient()

export interface Profile {
  id: string
  role: "patient" | "professional" | "admin"
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  email_verified: boolean
  onboarding_completed?: boolean
  status?: string
  last_seen?: string
  response_time?: string
}

export function useProfile() {
  const { user } = useUser()

  const { data: profile, error, isLoading, mutate } = useSWR(
    user?.id ? ["profile", user.id] : null,
    async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, role, first_name, last_name, avatar_url, email_verified, onboarding_completed, status, last_seen, response_time")
        .eq("id", user!.id)
        .single()

      if (error) throw error
      return data as Profile
    },
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  )

  return {
    profile,
    isLoading: isLoading || (!user && !error),
    error,
    mutate,
  }
}
