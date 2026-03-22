"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

export default function OnboardingRootPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const supabase = useRef(createClient()).current

  useEffect(() => {
    if (loading || !user) return

    supabase
      .from("profiles")
      .select("role, onboarding_completed")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (!data) { router.replace("/login"); return }
        if (data.onboarding_completed) {
          router.replace(`/dashboard/${data.role ?? "patient"}`)
          return
        }
        router.replace(
          data.role === "professional" ? "/onboarding/professional" : "/onboarding/patient"
        )
      })
  }, [user, loading, router, supabase])

  return (
    <div className="flex-1 flex items-center justify-center">
      <Loader2 className="h-8 w-8 text-teal-600 animate-spin" />
    </div>
  )
}
