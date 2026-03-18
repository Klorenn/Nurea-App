"use client"

import { Suspense, useEffect, useState } from "react"
import { ExploreContent } from "./explore-content"
import { Navbar } from "@/components/navbar"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useLanguage } from "@/contexts/language-context"
import { createClient } from "@/lib/supabase/client"
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar"
import { DashboardSidebar, type UserRole } from "@/components/dashboard/Sidebar"

function LoadingFallback() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Navbar sticky={false} />
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    </main>
  )
}

interface Profile {
  id: string
  role: UserRole
}

function ExplorePageInner() {
  const { user, loading: authLoading } = useAuth()
  const { language } = useLanguage()
  const supabase = createClient()

  const [profileRole, setProfileRole] = useState<UserRole | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      setProfileRole(null)
      return
    }

    const loadProfile = async () => {
      setProfileLoading(true)
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, role")
          .eq("id", user.id)
          .maybeSingle()

        if (error) {
          if (process.env.NODE_ENV === "development") {
            console.error("Error loading profile for explore:", error)
          }
          setProfileRole("patient")
          return
        }

        if (!data) {
          setProfileRole("patient")
          return
        }

        setProfileRole((data as Profile).role || "patient")
      } finally {
        setProfileLoading(false)
      }
    }

    loadProfile()
  }, [user, supabase])

  if (authLoading || profileLoading) {
    return <LoadingFallback />
  }

  // Sin sesión: experiencia pública sin sidebar
  if (!user || !profileRole) {
    return <ExploreContent />
  }

  const role = profileRole as UserRole

  // Con sesión: mostrar menú lateral según rol
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen w-full bg-background">
        <DashboardSidebar role={role} language={language} />
        <SidebarInset className="flex-1">
          <ExploreContent />
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ExplorePageInner />
    </Suspense>
  )
}
