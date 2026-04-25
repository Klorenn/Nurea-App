"use client"
import { useUser } from "@/lib/clerk-shim"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { JitsiMeeting } from "@/components/video/JitsiMeeting"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Video } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { DashboardLayout } from "@/components/dashboard-layout"
import { loadingFullViewportClassName } from "@/lib/loading-layout"

/**
 * Página de videollamada para una cita (paciente o profesional).
 * Ruta: /consulta/[appointmentId]
 * Carga Jitsi Meet vía External API con sala Nurea-Cita-[id]-2026.
 * Mobile First; zona horaria Chile (America/Santiago).
 */
export default function ConsultaPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoaded: authLoading } = useUser()
  const [displayName, setDisplayName] = useState<string>("")
  const [allowed, setAllowed] = useState<boolean | null>(null)
  const appointmentId = typeof params.appointmentId === "string" ? params.appointmentId : null

  useEffect(() => {
    if (authLoading || !user) {
      if (!authLoading && !user) router.replace("/login")
      return
    }
    if (!appointmentId) {
      setAllowed(false)
      return
    }

    const supabase = createClient()
    let cancelled = false

    Promise.all([
      supabase.from("profiles").select("first_name, last_name").eq("id", user.id).single(),
      supabase
        .from("appointments")
        .select("id, patient_id, professional_id")
        .eq("id", appointmentId)
        .single(),
    ]).then(([profileRes, aptRes]) => {
      if (cancelled) return
      const profile = profileRes.data
      const apt = aptRes.data
      if (!apt || aptRes.error) {
        setAllowed(false)
        return
      }
      const isParticipant = apt.patient_id === user.id || apt.professional_id === user.id
      setAllowed(isParticipant)
      if (profile && isParticipant) {
        const name = [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim()
        setDisplayName(name || "Usuario Nurea")
      }
    })

    return () => {
      cancelled = true
    }
  }, [user, authLoading, appointmentId, router])

  if (authLoading || allowed === null) {
    return (
      <div className={loadingFullViewportClassName("bg-background")}>
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (!appointmentId || !allowed) {
    return (
      <DashboardLayout role="patient">
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <p className="text-muted-foreground text-center mb-6">
            No tienes acceso a esta consulta o la cita no existe.
          </p>
          <Button asChild className="rounded-xl">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Dashboard
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="shrink-0 flex items-center justify-between gap-4 px-4 py-3 border-b border-border/40 bg-card">
        <Button variant="ghost" size="sm" className="rounded-xl gap-2" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            Salir de la consulta
          </Link>
        </Button>
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Video className="h-4 w-4 text-primary" />
          Videollamada Nurea
        </div>
        <div className="w-24" />
      </header>
      <main className="flex-1 min-h-0 p-4">
        <JitsiMeeting
          appointmentId={appointmentId}
          displayName={displayName}
          className="h-full min-h-[60vh]"
        />
      </main>
    </div>
  )
}
