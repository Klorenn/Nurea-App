"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, ArrowLeft, Loader2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { ConversationListItem } from "@/lib/types/chat"

interface ConversationListProps {
  conversations: ConversationListItem[]
  selectedId?: string
  onSelect: (conversation: ConversationListItem) => void
  isLoading?: boolean
  backHref?: string
  role?: "patient" | "professional"
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  isLoading,
  backHref = "/dashboard",
  role = "patient"
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filtered = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const statusColors = {
    online: "bg-emerald-500",
    offline: "bg-gray-400",
    away: "bg-amber-500",
  }

  return (
    <div className="flex flex-col h-full bg-sidebar">
      <div className="p-4 border-b border-sidebar-border" suppressHydrationWarning>
        <div className="flex items-center gap-2 mb-4">
          <Link href={backHref}>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-foreground -ml-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Volver al Dashboard</span>
            </Button>
          </Link>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-muted/50 border-border/50 focus-visible:ring-primary/30"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full p-4">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground mt-2">Cargando...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <p className="text-sm text-muted-foreground">No se encontraron conversaciones</p>
          </div>
        ) : (
          <div className="py-2">
            {filtered.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onSelect(conversation)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 transition-colors text-left",
                  selectedId === conversation.id
                    ? "bg-sidebar-accent"
                    : "hover:bg-sidebar-accent/50"
                )}
              >
                <div className="relative shrink-0">
                  <Avatar className="h-12 w-12 border-2 border-primary/10">
                    <AvatarImage src={conversation.avatar || undefined} alt={conversation.name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                      {conversation.initials}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-sidebar ${
                      statusColors[conversation.status]
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-sidebar-foreground truncate">
                      {conversation.name}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {conversation.timestamp}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <p className="text-sm text-muted-foreground truncate flex-1">
                      {conversation.requestStatus === "pending" && role === "professional" ? (
                        <span className="text-amber-500 font-medium flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Nueva solicitud
                        </span>
                      ) : conversation.requestStatus === "pending" && role === "patient" ? (
                        <span className="text-amber-500/80 italic text-xs flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Esperando aceptación
                        </span>
                      ) : (
                        conversation.lastMessage || "Chat iniciado"
                      )}
                    </p>
                    {conversation.unread > 0 && conversation.requestStatus === "accepted" && (
                      <Badge className="h-5 min-w-5 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-xs px-1.5 border-none shadow-sm">
                        {conversation.unread > 99 ? "99+" : conversation.unread}
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
