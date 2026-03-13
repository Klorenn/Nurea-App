"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export default function DashboardRedirect() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const { language } = useLanguage()

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
        router.push(
          role === "professional"
            ? "/dashboard/professional"
            : "/dashboard/patient"
        )
      } catch (error) {
        console.error("Error fetching profile:", error)
        router.push("/dashboard/patient")
      }
    }

    redirectByRole()
  }, [user, loading, router, supabase])

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-4"
      >
        <div className="w-14 h-14 rounded-2xl bg-[#0f766e]/10 flex items-center justify-center mx-auto">
          <Loader2 className="h-7 w-7 text-[#0f766e] animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground">
          {language === "es" ? "Redirigiendo..." : "Redirecting..."}
        </p>
      </motion.div>
    </div>
  )
}
