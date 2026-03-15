"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"
import { DashboardSidebar, type UserRole } from "@/components/dashboard/Sidebar"
import { UserDropdown } from "@/components/ui/user-dropdown"
import { NotificationsDropdown } from "@/components/notifications/notifications-dropdown"
import { ThemeToggle } from "@/components/theme-toggle"
import { useLanguage } from "@/contexts/language-context"
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Loader2 } from "lucide-react"

interface Profile {
  id: string
  role: UserRole
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  email_verified: boolean
}

export default function DashboardMainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const { language } = useLanguage()
  const supabase = createClient()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push("/login")
      return
    }

    const loadProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, role, first_name, last_name, avatar_url, email_verified")
          .eq("id", user.id)
          .maybeSingle()

        if (error) {
          const errMsg = error?.message ?? error?.code ?? String(error)
          if (process.env.NODE_ENV === "development") {
            console.error("Error loading profile:", errMsg, error)
          }
          setProfileLoading(false)
          router.push("/login")
          return
        }

        if (!data) {
          setProfileLoading(false)
          router.push("/complete-profile")
          return
        }

        setProfile(data as Profile)

        const userRole = data?.role || "patient"
        const isProfessionalRoute = pathname.startsWith("/dashboard/professional")
        const isPatientRoute = pathname.startsWith("/dashboard/patient")

        if (userRole === "admin" && (isProfessionalRoute || isPatientRoute)) {
          // Allow admin to see these for verification purposes, or redirect to /admin if on /dashboard root
        } else if (userRole === "professional" && isPatientRoute) {
          router.push("/dashboard/professional")
          return
        } else if (userRole === "patient" && isProfessionalRoute) {
          router.push("/dashboard/patient")
          return
        }

        if (pathname === "/dashboard") {
          if (userRole === "admin") {
            router.push("/admin")
          } else {
            router.push(
              userRole === "professional"
                ? "/dashboard/professional"
                : "/dashboard/patient"
            )
          }
        }
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err)
        if (process.env.NODE_ENV === "development") {
          console.error("Error loading profile:", errMsg, err)
        }
        setProfileLoading(false)
        router.push("/login")
      } finally {
        setProfileLoading(false)
      }
    }

    loadProfile()
  }, [user, authLoading, router, supabase, pathname])

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
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
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-background">
        <DashboardSidebar role={role} language={language} />

        <SidebarInset className="flex flex-col">
          <header className="h-14 flex items-center justify-between px-4 md:px-6 bg-background/80 backdrop-blur-xl border-b border-border/40 sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="h-8 w-8" />
              <div className="hidden sm:block h-4 w-px bg-border/40" />
              <h1 className="hidden sm:block text-sm font-medium text-muted-foreground">
                {role === "admin"
                  ? isSpanish
                    ? "Panel de Administración"
                    : "Admin Panel"
                  : role === "professional"
                  ? isSpanish
                    ? "Panel Profesional"
                    : "Professional Dashboard"
                  : isSpanish
                  ? "Mi Dashboard"
                  : "My Dashboard"}
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
              <AnimatePresence mode="wait">
                <motion.div
                  key={pathname}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
