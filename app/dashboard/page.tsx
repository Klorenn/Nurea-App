"use client"


import { useUser } from "@clerk/nextjs"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"
import { loadingFullViewportClassName } from "@/lib/loading-layout"

/**
 * Root Dashboard Redirector
 * Ensures users are sent to their role-specific dashboard.
 */
export default function DashboardRootPage() {
  const { user, isLoaded: loading } = useUser()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push("/login")
      return
    }

    const redirectByRole = async () => {
      try {
        // Fetch profile with direct query to ensure freshest data
        const { data: profile, error: dbError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle()

        if (dbError) {
          console.error("DB Fetch error in redirector:", dbError)
        }

        const jwtRole = user.user_metadata?.role
        const role = profile?.role || jwtRole

        console.log("Redirector - Detected Role:", { 
          fromDB: profile?.role, 
          fromJWT: jwtRole, 
          final: role 
        })

        if (role === "admin") {
          router.push("/dashboard/admin")
          return
        } 
        
        if (role === "professional") {
          router.push("/dashboard/professional")
          return
        }

        // Default or explicit patient
        router.push("/dashboard/patient")
      } catch (error) {
        console.error("Redirect error catch:", error)
        // Final fallback to JWT only
        const backupRole = user.app_metadata?.role || user.user_metadata?.role
        if (backupRole === "admin") {
          router.push("/dashboard/admin")
        } else if (backupRole === "professional") {
          router.push("/dashboard/professional")
        } else {
          router.push("/dashboard/patient")
        }
      }
    }

    redirectByRole()
  }, [user, loading, router, supabase])

  return (
    <div className={loadingFullViewportClassName("bg-background")}>
      <div className="text-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-[#0f766e] mx-auto" />
        <p className="text-sm text-muted-foreground animate-pulse font-medium">
          Cargando tu espacio personalizado...
        </p>
      </div>
    </div>
  )
}
