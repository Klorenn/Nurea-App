"use client"
import { useAuth } from "@/hooks/use-auth"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useProfile } from "@/hooks/use-profile"
import { DashboardSidebar, type UserRole } from "@/components/dashboard/Sidebar"
import { UserDropdown } from "@/components/ui/user-dropdown"
import { NotificationsDropdown } from "@/components/notifications/notifications-dropdown"
import { ThemeToggle } from "@/components/theme-toggle"
import { useLanguage } from "@/contexts/language-context"
import { SupportTicketSheet } from "@/components/support/SupportTicketSheet"
import { DashboardLoading } from "@/components/dashboard/DashboardLoading"

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

  // Hard timeout — never hang in loading state for more than 6s
  const [timedOut, setTimedOut] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => {
      console.log("[dash] TIMEOUT FIRED!")
      setTimedOut(true)
    }, 6000)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    console.log("[dash] render:", { authLoading, profileLoading, redirecting, timedOut, hasUser: !!user, hasProfile: !!profile, profileRole: profile?.role })
    if (authLoading || profileLoading || redirecting) return

    if (!user) {
      setRedirecting(true)
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`)
      return
    }

    // Missing profile or no role yet → go choose role
    if (!profile || !profile?.role) {
      console.log("[dash] no profile/role, redirecting:", { profile })
      setRedirecting(true)
      router.push("/complete-profile?from=oauth")
      return
    }

    const userRole = profile.role
    const isProfessionalRoute = pathname.startsWith("/dashboard/professional")
    const isPatientRoute = pathname.startsWith("/dashboard/patient")
    const isAdminRoute = pathname.startsWith("/dashboard/admin")
    const isSharedRoute = sharedRoutes.some((route) => pathname.startsWith(route))

    if (userRole === "admin") return

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

    if (userRole === "patient" && isAdminRoute) {
      setRedirecting(true)
      router.push("/dashboard/patient")
      return
    }
  }, [user, authLoading, profile, profileLoading, pathname, router, redirecting])

  const stillLoading =
    !timedOut && (authLoading || (!!user && profileLoading) || redirecting)

  if (stillLoading) {
    return <DashboardLoading language={language === "en" ? "en" : "es"} />
  }

  // If we timed out or something is missing, force render the dashboard anyway
  // rather than showing blank - the sidebar will show login prompt if needed
  if (!user || !profile) {
    console.log("[dash] showing fallback UI:", { user: !!user, profile: !!profile, timedOut })
    // Still render, don't return null - let the layout handle it
  }

  const role = (profile?.role || profile?.user_type || "patient") as UserRole
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
                name: profile?.full_name
                  ? profile.full_name
                  : user?.email?.split("@")[0] || "Usuario",
                email: user?.email || "",
                avatar: undefined,
                initials:
                  profile?.full_name?.[0]?.toUpperCase() ||
                  user?.email?.[0]?.toUpperCase() ||
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
