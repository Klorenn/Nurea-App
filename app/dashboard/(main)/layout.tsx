"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useUser } from "@/lib/clerk-shim"
import { useProfile } from "@/hooks/use-profile"
import { useLanguage } from "@/contexts/language-context"
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

/**
 * Layout for dashboard sub-pages (patient/professional/admin).
 * Responsibilities:
 *  - Wait until auth + profile are loaded.
 *  - Redirect users to /complete-profile if they have no role yet.
 *  - Route patients to /patient and professionals to /professional.
 *  - **Stop the spinner** instead of hanging forever (previous version
 *    inverted the meaning of `isLoaded`, causing the infinite loading bug).
 */
export default function DashboardMainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const { profile, isLoading: profileLoading } = useProfile()
  const { language } = useLanguage()
  const [redirecting, setRedirecting] = useState(false)
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), 6000)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!isLoaded || redirecting) return

    if (!user) {
      setRedirecting(true)
      router.replace(`/login?callbackUrl=${encodeURIComponent(pathname)}`)
      return
    }

    if (profileLoading) return

    if (!profile || !profile?.role) {
      setRedirecting(true)
      router.replace("/complete-profile?from=oauth")
      return
    }

    const userRole = profile?.role
    const isProfessionalRoute = pathname.startsWith("/dashboard/professional")
    const isPatientRoute = pathname.startsWith("/dashboard/patient")
    const isAdminRoute = pathname.startsWith("/dashboard/admin")
    const isSharedRoute = sharedRoutes.some((r) => pathname.startsWith(r))

    if (userRole === "admin") return // admins can roam

    if (userRole === "professional" && !isProfessionalRoute && !isSharedRoute) {
      setRedirecting(true)
      router.replace("/dashboard/professional")
      return
    }

    if (
      userRole === "patient" &&
      !isPatientRoute &&
      !isSharedRoute &&
      !isAdminRoute /* admin route handled separately */
    ) {
      setRedirecting(true)
      router.replace("/dashboard/patient")
      return
    }

    if (userRole === "patient" && isAdminRoute) {
      setRedirecting(true)
      router.replace("/dashboard/patient")
      return
    }
  }, [user, isLoaded, profile, profileLoading, pathname, router, redirecting])

  const stillLoading =
    !timedOut && (!isLoaded || (!!user && profileLoading) || redirecting)

  if (stillLoading) {
    return <DashboardLoading language={language === "en" ? "en" : "es"} />
  }

  return (
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
  )
}
