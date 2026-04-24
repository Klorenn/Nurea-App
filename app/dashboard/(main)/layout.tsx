"use client"


import { useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useProfile } from "@/hooks/use-profile"
import { loadingFullViewportClassName } from "@/lib/loading-layout"

export default function DashboardMainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoaded: authLoading } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const { profile, isLoading: profileLoading } = useProfile()
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    if (authLoading || profileLoading || redirecting) return
    if (!user || !profile) return

    const userRole = profile.user_type
    const isProfessionalRoute = pathname.startsWith("/dashboard/professional")
    const isPatientRoute = pathname.startsWith("/dashboard/patient")

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
      <div className={loadingFullViewportClassName("bg-background")}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500/20 to-teal-600/20 flex items-center justify-center mx-auto">
              <div className="h-8 w-8 text-[#0f766e] animate-spin" />
            </div>
          </div>
        </motion.div>
      </div>
    )
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
