"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2 } from "lucide-react"
import { getJitsiRoomName, JITSI_EXTERNAL_API_SCRIPT } from "@/lib/utils/jitsi"
import { cn } from "@/lib/utils"

const JITSI_DOMAIN = "meet.jit.si"

export type JitsiMeetingProps = {
  /** ID de la cita (genera sala Nurea-Cita-[id]-2026) */
  appointmentId: string
  /** Nombre para mostrar en la videollamada (paciente o profesional) */
  displayName?: string
  /** Clase del contenedor */
  className?: string
  /** Callback cuando la reunión termina o se cierra */
  onDispose?: () => void
}

/**
 * Componente de videollamada Jitsi Meet usando la External API.
 * - Carga https://meet.jit.si/external_api.js de forma dinámica
 * - Sala dinámica y segura: Nurea-Cita-[appointmentId]-2026
 * - Interfaz minimalista: español, audio muteado al inicio, sin marcas de agua cuando el servidor lo permita
 * - Mobile First: ocupa el 100% del contenedor
 */
export function JitsiMeeting({
  appointmentId,
  displayName = "Usuario Nurea",
  className,
  onDispose,
}: JitsiMeetingProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const apiRef = useRef<InstanceType<NonNullable<typeof window.JitsiMeetExternalAPI>> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container || !appointmentId) return

    let cancelled = false

    function loadScript(src: string): Promise<void> {
      return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`)
        if (existing) {
          resolve()
          return
        }
        const script = document.createElement("script")
        script.src = src
        script.async = true
        script.onload = () => resolve()
        script.onerror = () => reject(new Error(`Failed to load ${src}`))
        document.head.appendChild(script)
      })
    }

    loadScript(JITSI_EXTERNAL_API_SCRIPT)
      .then(() => {
        if (cancelled || !containerRef.current) return
        const JitsiAPI = window.JitsiMeetExternalAPI
        if (!JitsiAPI) {
          setError("Jitsi Meet no está disponible")
          setLoading(false)
          return
        }

        const roomName = getJitsiRoomName(appointmentId)
        const options: JitsiMeetExternalAPIOptions = {
          roomName,
          parentNode: container,
          width: "100%",
          height: "100%",
          configOverwrite: {
            startWithAudioMuted: true,
            defaultLanguage: "es",
            prejoinPageEnabled: false,
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            TOOLBAR_BUTTONS: [
              "microphone",
              "camera",
              "closedcaptions",
              "desktop",
              "fullscreen",
              "hangup",
              "profile",
              "chat",
              "settings",
              "raisehand",
              "tileview",
              "videobackgroundblur",
            ],
          },
          userInfo: {
            displayName: displayName || "Usuario Nurea",
          },
          onload: () => {
            if (!cancelled) {
              setLoading(false)
              setError(null)
            }
          },
        }

        try {
          apiRef.current = new JitsiAPI(JITSI_DOMAIN, options)
        } catch (e) {
          console.error("JitsiMeetExternalAPI init error:", e)
          setError("No se pudo iniciar la videollamada")
          setLoading(false)
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Error al cargar Jitsi Meet")
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
      if (apiRef.current) {
        try {
          apiRef.current.dispose()
        } catch (_) {}
        apiRef.current = null
      }
      onDispose?.()
    }
  }, [appointmentId, displayName, onDispose])

  return (
    <div className={cn("relative w-full h-full min-h-[400px] rounded-2xl overflow-hidden bg-muted", className)}>
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/95 z-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Conectando a la videollamada...</p>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/95 z-10 p-4">
          <p className="text-sm font-medium text-destructive">{error}</p>
          <p className="text-xs text-muted-foreground text-center">
            Puedes intentar abrir el enlace en una nueva pestaña si el navegador lo bloquea.
          </p>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full min-h-[400px]" />
    </div>
  )
}
