"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { useAuth } from "@/hooks/use-auth"
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

    const { role: userRole } = profile
    const isAdminRoute = pathname.startsWith("/dashboard/admin")
    const isProfessionalRoute = pathname.startsWith("/dashboard/professional")
    const isPatientRoute = pathname.startsWith("/dashboard/patient")
    const isSharedRoute = sharedRoutes.some((route) => pathname.startsWith(route))

    if (userRole === "admin" && !isAdminRoute) {
      setRedirecting(true)
      router.push("/dashboard/admin")
      return
    }

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
      <div className={loadingFullViewportClassName("bg-background")}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500/20 to-teal-600/20 flex items-center justify-center mx-auto">
              <Loader2 className="h-8 w-8 text-[#0f766e] animate-spin" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              {language === "es" ? "Cargando tu dashboard" : "Loading your dashboard"}
            </p>
            <p className="text-xs text-muted-foreground">
              {language === "es" ? "Un momento por favor..." : "Just a moment..."}
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  if (!user || !profile) {
    return null
  }

  const role = profile.role || "patient"
  const isSpanish = language === "es"

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <DashboardSidebar role={role} language={language} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <header className="h-14 flex items-center justify-between px-4 md:px-6 bg-background/80 backdrop-blur-xl border-b border-border/40 sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="hidden sm:block text-sm font-medium text-muted-foreground">
              {role === "admin"
                ? isSpanish ? "Panel de Administración" : "Admin Panel"
                : role === "professional"
                ? isSpanish ? "Panel Profesional" : "Professional Dashboard"
                : isSpanish ? "Mi Dashboard" : "My Dashboard"}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <NotificationsDropdown role={role} />
            <UserDropdown
              role={role}
              user={{
                name: profile.first_name
                  ? `${profile.first_name} ${profile.last_name || ""}`.trim()
                  : user.email?.split("@")[0] || "Usuario",
                email: user.email || "",
                avatar: profile.avatar_url || undefined,
                initials:
                  profile.first_name?.[0]?.toUpperCase() ||
                  user.email?.[0]?.toUpperCase() ||
                  "U",
                status: "online",
              }}
            />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
        <SupportTicketSheet />
      </div>
    </div>
  )
}
