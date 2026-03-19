"use client"

import { ChatInterface } from "@/components/chat/chat-interface"

export default function ProfessionalChatPage() {
  return (
    <div className="fixed inset-0 z-50 bg-background md:static md:inset-auto md:h-[calc(100vh-5rem)]">
      <div className="h-full w-full p-2 md:p-6 bg-muted/20">
        <ChatInterface role="professional" backHref="/dashboard/professional" />
      </div>
    </div>
  )
}
