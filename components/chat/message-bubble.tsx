"use client"

import { cn } from "@/lib/utils"
import { Check, CheckCheck } from "lucide-react"

interface MessageBubbleProps {
  content: string
  timestamp: string
  isOwn: boolean
  status?: "sent" | "delivered" | "read"
}

export function MessageBubble({ content, timestamp, isOwn, status = "read" }: MessageBubbleProps) {
  return (
    <div className={cn("flex w-full", isOwn ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm",
          isOwn
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-card text-card-foreground border border-border/50 rounded-bl-md"
        )}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{content}</p>
        <div
          className={cn(
            "flex items-center justify-end gap-1 mt-1",
            isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
          )}
        >
          <span className="text-xs">{timestamp}</span>
          {isOwn && (
            <span className="ml-0.5">
              {status === "read" ? (
                <CheckCheck className="h-3.5 w-3.5" />
              ) : status === "delivered" ? (
                <CheckCheck className="h-3.5 w-3.5 opacity-60" />
              ) : (
                <Check className="h-3.5 w-3.5 opacity-60" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
