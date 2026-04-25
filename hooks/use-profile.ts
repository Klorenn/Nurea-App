"use client"

import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/lib/clerk-shim"

const supabase = createClient()

export interface Profile {
  id: string
  user_id: string
  user_type: "patient" | "professional"
  full_name: string
  rut: string
  date_of_birth: string
  gender: string
  onboarding_completed: boolean
}

export function useProfile() {
  const { user } = useUser()

  const { data: profile, error, isLoading, mutate } = useSWR(
    user?.id ? ["profile", user.id] : null,
    async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, user_id, user_type, full_name, rut, date_of_birth, gender, onboarding_completed")
        .eq("user_id", user!.id)
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
