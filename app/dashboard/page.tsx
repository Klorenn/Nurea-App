"use client"

import { useUser } from "@/lib/clerk-shim"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useLanguage } from "@/contexts/language-context"
import { DashboardLoading } from "@/components/dashboard/DashboardLoading"

/**
 * Root Dashboard Redirector
 * Decides where to send the user based on their stored role.
 *
 * Critical bug fix from previous version: the auth state was checked with
 * `if (loading) return` after renaming `isLoaded` -> `loading`, which meant
 * the effect bailed out the moment auth finished loading and the page hung
 * forever on the spinner. Now we wait for `isLoaded === true` and add a
 * hard 6s safety timeout that falls back to /dashboard/patient.
 */
export default function DashboardRootPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [statusMsg, setStatusMsg] = useState("")

  useEffect(() => {
    // Wait for the auth state to load
    if (!isLoaded) return

    // No user → send to login
    if (!user) {
      router.replace("/login")
      return
    }

    let cancelled = false
    const supabase = createClient()

    // Hard safety net: never hang for more than 6s
    const safety = setTimeout(() => {
      if (cancelled) return
      console.warn("[dashboard] redirect timeout — falling back to /dashboard/patient")
      router.replace("/dashboard/patient")
    }, 6000)

    const run = async () => {
      try {
        setStatusMsg("Detectando tu perfil…")

        const { data: profile, error: dbError } = await supabase
          .from("profiles")
          .select("role, is_onboarded")
          .eq("id", user.id)
          .maybeSingle()

        if (cancelled) return
        if (dbError) console.error("[dashboard] profile fetch error:", dbError)

        const jwtRole = (user.user_metadata as any)?.role
        const role = profile?.role || jwtRole

        // No profile yet → first time after Google sign-in.
        // Send the user to the role-selection screen.
        if (!profile && !jwtRole) {
          clearTimeout(safety)
          router.replace("/complete-profile?from=oauth")
          return
        }

        clearTimeout(safety)
        if (role === "admin") {
          router.replace("/dashboard/admin")
        } else if (role === "professional") {
          router.replace("/dashboard/professional")
        } else {
          router.replace("/dashboard/patient")
        }
      } catch (err) {
        console.error("[dashboard] redirect error:", err)
        clearTimeout(safety)
        const backup = (user.app_metadata as any)?.role || (user.user_metadata as any)?.role
        if (backup === "admin") router.replace("/dashboard/admin")
        else if (backup === "professional") router.replace("/dashboard/professional")
        else router.replace("/dashboard/patient")
      }
    }

    run()

    return () => {
      cancelled = true
      clearTimeout(safety)
    }
  }, [user, isLoaded, router])

  return (
    <div className={loadingFullViewportClassName("bg-background")}>
      <div className="text-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-[#0f766e] mx-auto" />
        <p className="text-sm text-muted-foreground animate-pulse font-medium">
          {statusMsg || "Cargando tu espacio personalizado…"}
        </p>
      </div>
    </div>
  )
}
