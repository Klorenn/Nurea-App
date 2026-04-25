"use client"
import { useAuth } from "@/hooks/use-auth"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { useProfile } from "@/hooks/use-profile"
import { DashboardSidebar, type UserRole } from "@/components/dashboard/Sidebar"
import { UserDropdown } from "@/components/ui/user-dropdown"
import { NotificationsDropdown } from "@/components/notifications/notifications-dropdown"
import { ThemeToggle } from "@/components/theme-toggle"
import { useLanguage } from "@/contexts/language-context"
import { Loader2 } from "lucide-react"
import { SupportTicketSheet } from "@/components/support/SupportTicketSheet"
import { loadingFullViewportClassName } from "@/lib/loading-layout"

const sharedRoutes = [
  "/dashboard/forum",
  "/dashboard/chat",
  "/dashboard/appointments",
  "/dashboard/calendar",
  "/dashboard/documents",
  "/dashboard/search",
  "/dashboard/settings",
  "/dashboard/profile",
  "/dashboard/favorites",
  "/dashboard/payments",
  "/dashboard/family",
  "/dashboard/help",
  "/dashboard/support",
]

export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const { language } = useLanguage()
  const { profile, isLoading: profileLoading } = useProfile()
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    if (authLoading || profileLoading || redirecting) return

    if (!user) {
      setRedirecting(true)
      router.push(`/login?redirect=${pathname}`)
      return
    }

    if (!profile) {
      setRedirecting(true)
      router.push("/complete-profile")
      return
    }

    // Check if onboarding is completed
    if (!profile.onboarding_completed) {
      setRedirecting(true)
      router.push("/onboarding")
      return
    }

    const userRole = profile.user_type
    const isProfessionalRoute = pathname.startsWith("/dashboard/professional")
    const isPatientRoute = pathname.startsWith("/dashboard/patient")
    const isSharedRoute = sharedRoutes.some((route) => pathname.startsWith(route))

    if (userRole === "professional" && !isProfessionalRoute && !isSharedRoute) {
      setRedirecting(true)
      router.push("/dashboard/professional")
      return
    }

    if (userRole === "patient" && !isPatientRoute && !isSharedRoute) {
      setRedirecting(true)
      router.push("/dashboard/patient")
      return
    }
  }, [user, authLoading, profile, profileLoading, pathname, router, redirecting])

  if (authLoading || profileLoading || redirecting) {
    return (
      <div className={loadingFullViewportClassName("bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900")}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-center space-y-6"
        >
          <div className="relative inline-block">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-2xl blur-xl opacity-20"
              animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto shadow-lg">
              <Loader2 className="h-10 w-10 text-white animate-spin" strokeWidth={2} />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
              {language === "es" ? "Cargando tu dashboard" : "Loading your dashboard"}
            </p>
            <p className="text-sm text-muted-foreground font-medium">
              {language === "es" ? "Preparando tu espacio..." : "Setting things up..."}
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  if (!user || !profile) {
    return null
  }

  const role = profile.user_type || "patient"
  const isSpanish = language === "es"

  return (
    <div className="app">
      <DashboardSidebar role={role} language={language} />

      <div className="main">
        <header className="topbar">
          <div className="greeting">
            <h1>
              {role === "professional"
                ? isSpanish ? "Panel Profesional" : "Professional Dashboard"
                : isSpanish ? "Mi Dashboard" : "My Dashboard"}
            </h1>
          </div>

          <div className="topbar-actions">
            <ThemeToggle />
            <NotificationsDropdown role={role} />
            <UserDropdown
              role={role}
              user={{
                name: profile.full_name
                  ? profile.full_name
                  : user.email?.split("@")[0] || "Usuario",
                email: user.email || "",
                avatar: undefined,
                initials:
                  profile.full_name?.[0]?.toUpperCase() ||
                  user.email?.[0]?.toUpperCase() ||
                  "U",
                status: "online",
              }}
            />
          </div>
        </header>

        <main>
          {children}
        </main>
        <SupportTicketSheet />
      </div>
    </div>
  )
}
