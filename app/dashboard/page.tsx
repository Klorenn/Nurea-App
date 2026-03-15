"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

/**
 * Root Dashboard Redirector
 * Ensures users are sent to their role-specific dashboard.
 */
export default function DashboardRootPage() {
  const { user, loading } = useAuth()
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
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()

        const role = profile?.role || "patient"
        
        if (role === "admin") {
          router.push("/admin")
        } else if (role === "professional") {
          router.push("/dashboard/professional")
        } else {
          router.push("/dashboard/patient")
        }
      } catch (error) {
        console.error("Redirect error:", error)
        router.push("/dashboard/patient")
      }
    }

    redirectByRole()
  }, [user, loading, router, supabase])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-[#0f766e] mx-auto" />
        <p className="text-sm text-muted-foreground animate-pulse font-medium">
          Cargando tu espacio personalizado...
        </p>
      </div>
    </div>
  )
}
