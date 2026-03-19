"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Clock, MoreVertical, Phone, Shield, Video } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { UserRole } from "@/lib/types/chat"

interface ChatHeaderProps {
  name: string
  avatar?: string
  initials: string
  status: "online" | "offline" | "away"
  responseTime?: string
  role?: UserRole
  onBack?: () => void
}

export function ChatHeader({
  name,
  avatar,
  initials,
  status,
  responseTime = "2-4 horas",
  role = "patient", // default to patient to be safe
  onBack,
}: ChatHeaderProps) {
  const statusColors = {
    online: "bg-emerald-500",
    offline: "bg-gray-400",
    away: "bg-amber-500",
  }

  const statusText = {
    online: "En línea",
    offline: "Desconectado",
    away: "Ausente",
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border shrink-0">
      <div className="flex items-center gap-3">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9 rounded-full shrink-0"
            onClick={onBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div className="relative shrink-0">
          <Avatar className="h-11 w-11 border-2 border-primary/20">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span
            className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-card ${statusColors[status]}`}
          />
        </div>
        <div className="flex flex-col min-w-0">
          <h2 className="font-semibold text-foreground truncate">{name}</h2>
          <div className="flex items-center gap-2 text-xs text-muted-foreground whitespace-nowrap">
            <span className="flex items-center gap-1">
              <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${statusColors[status]}`} />
              {statusText[status]}
            </span>
            <span className="text-border hidden sm:inline">•</span>
            <span className="hidden sm:flex items-center gap-1">
              <Clock className="h-3 w-3 shrink-0" />
              Respuesta típica: {responseTime}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 ml-2 shrink-0">
        <Badge
          variant="outline"
          className="hidden lg:flex items-center gap-1.5 text-primary border-primary/30 bg-primary/5 px-3 py-1"
        >
          <Shield className="h-3.5 w-3.5 shrink-0" />
          <span className="text-xs font-medium">Comunicación segura</span>
        </Badge>

        {/* Muestra botones de llamada sólo si NO es paciente actuando */}
        {role !== "patient" && (
          <>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground hover:text-primary">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground hover:text-primary">
              <Video className="h-4 w-4" />
            </Button>
          </>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground hover:text-primary">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>Ver perfil</DropdownMenuItem>
            <DropdownMenuItem>Buscar en chat</DropdownMenuItem>
            <DropdownMenuItem>Archivos compartidos</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Silenciar notificaciones</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Bloquear contacto</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
