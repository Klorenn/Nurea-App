"use client"

import { useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ChatInterface } from "@/components/chat/chat-interface"
import { useCreateConversation } from "@/hooks/use-chat"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

function ChatContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const withProfessionalId = searchParams.get("with")
  const { createConversation } = useCreateConversation()

  useEffect(() => {
    if (withProfessionalId) {
      // Usamos el hook para crear (o recuperar) la conversacion y luego limpiamos la url
      createConversation(withProfessionalId).then(() => {
        router.replace("/dashboard/chat")
      })
    }
  }, [withProfessionalId, router, createConversation])

  return (
    <div className="h-full p-2 md:p-6">
      <ChatInterface role="patient" backHref="/dashboard" />
    </div>
  )
}

export default function ChatPage() {
  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Back bar (Mobile optimization) */}
      <div className="shrink-0 h-14 flex items-center gap-3 px-4 border-b border-border/40 bg-background/95 backdrop-blur-sm md:hidden">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors px-2 py-1.5 rounded-lg hover:bg-accent/30"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>
      </div>
      
      <div className="flex-1 overflow-hidden bg-muted/20">
        <Suspense fallback={
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground animate-pulse">Cargando chat...</p>
          </div>
        }>
          <ChatContent />
        </Suspense>
      </div>
    </div>
  )
}
