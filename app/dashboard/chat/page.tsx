"use client"


import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { ChatInterface } from "@/components/chat/chat-interface"

function PatientChatContent() {
  const searchParams = useSearchParams()
  const conversationId = searchParams.get("conversation") ?? undefined

  return (
    <div className="fixed inset-0 z-50 bg-background md:static md:inset-auto md:h-[calc(100vh-5rem)]">
      <div className="h-full w-full p-2 md:p-6 bg-muted/20">
        <ChatInterface role="patient" backHref="/dashboard/patient" initialConversationId={conversationId} />
      </div>
    </div>
  )
}

export default function PatientChatPage() {
  return (
    <Suspense>
      <PatientChatContent />
    </Suspense>
  )
}
