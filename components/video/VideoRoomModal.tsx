"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import { getJitsiMeetingUrl } from "@/lib/utils/jitsi"

type VideoRoomModalProps = {
  appointmentId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
}

/**
 * Modal que incrusta la videollamada Jitsi en un iframe sobre el dashboard.
 * Alternativa a abrir en nueva pestaña; mismo enlace único por cita.
 */
export function VideoRoomModal({
  appointmentId,
  open,
  onOpenChange,
  title,
}: VideoRoomModalProps) {
  const jitsiUrl = getJitsiMeetingUrl(appointmentId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] h-[85vh] p-0 gap-0 overflow-hidden flex flex-col bg-background">
        <DialogHeader className="shrink-0 px-4 py-3 border-b border-border/40 flex flex-row items-center justify-between space-y-0">
          <DialogTitle className="text-lg font-semibold">
            {title ?? "Videollamada"}
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0"
            onClick={() => window.open(jitsiUrl, "_blank", "noopener,noreferrer")}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Abrir en nueva pestaña
          </Button>
        </DialogHeader>
        <div className="flex-1 min-h-0 relative rounded-b-lg overflow-hidden">
          <iframe
            src={jitsiUrl}
            title="Jitsi Meet - Videollamada Nurea"
            className="absolute inset-0 w-full h-full border-0"
            allow="camera; microphone; fullscreen; display-capture"
            allowFullScreen
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
