"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Video, VideoOff, ExternalLink, PhoneCall } from "lucide-react"
import { getJitsiMeetingUrl } from "@/lib/utils/jitsi"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface VideoCallButtonProps {
  appointmentId: string
  isOnline: boolean
  isSpanish?: boolean
}

export function VideoCallButton({
  appointmentId,
  isOnline,
  isSpanish = true,
}: VideoCallButtonProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isCallActive, setIsCallActive] = useState(false)

  const openVideoCall = () => {
    const meetingUrl = getJitsiMeetingUrl(appointmentId)
    
    // Open in a popup window for better multitasking
    const width = 800
    const height = 600
    const left = window.screenX + (window.outerWidth - width) / 2
    const top = window.screenY + (window.outerHeight - height) / 2
    
    const popup = window.open(
      meetingUrl,
      "NureaVideoCall",
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no,status=no`
    )

    if (popup) {
      setIsCallActive(true)
      
      // Check if popup is closed
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          setIsCallActive(false)
          clearInterval(checkClosed)
        }
      }, 1000)
    } else {
      // Fallback to new tab if popup blocked
      window.open(meetingUrl, "_blank")
    }
  }

  if (!isOnline) {
    return null
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            className="fixed bottom-6 right-6 z-50"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 15 }}
          >
            <Button
              onClick={openVideoCall}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className={cn(
                "relative h-14 shadow-lg transition-all duration-300",
                isCallActive 
                  ? "bg-red-500 hover:bg-red-600 w-14 rounded-full" 
                  : "bg-teal-600 hover:bg-teal-700",
                isHovered && !isCallActive && "w-auto px-6 rounded-full",
                !isHovered && !isCallActive && "w-14 rounded-full"
              )}
            >
              <AnimatePresence mode="wait">
                {isCallActive ? (
                  <motion.div
                    key="active"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex items-center gap-2"
                  >
                    <PhoneCall className="h-5 w-5 animate-pulse" />
                  </motion.div>
                ) : isHovered ? (
                  <motion.div
                    key="hovered"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="flex items-center gap-2 overflow-hidden whitespace-nowrap"
                  >
                    <Video className="h-5 w-5 shrink-0" />
                    <span className="text-sm font-medium">
                      {isSpanish ? "Abrir Videollamada" : "Open Video Call"}
                    </span>
                    <ExternalLink className="h-4 w-4 shrink-0" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <Video className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Pulsing ring when call is active */}
              {isCallActive && (
                <span className="absolute inset-0 rounded-full animate-ping bg-red-400 opacity-50" />
              )}
            </Button>

            {/* Status badge */}
            {isCallActive && (
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="absolute -top-2 -right-2"
              >
                <Badge className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 shadow-sm">
                  {isSpanish ? "EN VIVO" : "LIVE"}
                </Badge>
              </motion.div>
            )}
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="left" className="font-medium">
          {isCallActive 
            ? (isSpanish ? "Videollamada activa - Click para volver" : "Video call active - Click to return")
            : (isSpanish ? "Iniciar videollamada con el paciente" : "Start video call with patient")}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
