"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { ChatInterface } from "@/components/chat/chat-interface"

function ProfessionalChatContent() {
  const searchParams = useSearchParams()
  const conversationId = searchParams.get("conversation") ?? undefined

  return (
    <div className="fixed inset-0 z-50 bg-background md:static md:inset-auto md:h-[calc(100vh-5rem)]">
      <div className="h-full w-full p-2 md:p-6 bg-muted/20">
        <ChatInterface role="professional" backHref="/dashboard/professional" initialConversationId={conversationId} />
      </div>
    </div>
  )
}

export default function ProfessionalChatPage() {
  return (
    <Suspense>
      <ProfessionalChatContent />
    </Suspense>
  )
}
