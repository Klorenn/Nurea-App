"use client"

import { MessageSquareText } from "lucide-react"

interface EmptyChatProps {
  title?: string
  description?: string
}

export function EmptyChat({
  title = "No hay mensajes aún",
  description = "Usa este espacio para comunicarte de forma clara y respetuosa. Puedes hacer preguntas, compartir información o coordinar tu atención.",
}: EmptyChatProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <MessageSquareText className="h-10 w-10 text-primary" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-3 text-balance">{title}</h3>
      <p className="text-muted-foreground max-w-md leading-relaxed text-pretty">{description}</p>
    </div>
  )
}
