"use client"

import { useState, useRef, useEffect } from "react"
import {
  useConversations,
  useMessages,
  useSendMessage,
  useUpdateUserStatus,
  useCurrentChatUser,
  useUpdateConversationStatus
} from "@/hooks/use-chat"
import { ChatHeader } from "./chat-header"
import { ChatInput } from "./chat-input"
import { MessageBubble } from "./message-bubble"
import { EmptyChat } from "./empty-chat"
import { ConversationList } from "./conversation-list"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, ShieldCheck, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { ConversationListItem } from "@/lib/types/chat"

interface ChatInterfaceProps {
  backHref?: string
  role?: "patient" | "professional"
}

export function ChatInterface({ backHref = "/dashboard", role = "patient" }: ChatInterfaceProps) {
  const { user } = useCurrentChatUser()
  const { conversations, isLoading: conversationsLoading } = useConversations()
  const [selectedConversation, setSelectedConversation] = useState<ConversationListItem | null>(null)
  
  // Mantenemos sincronizada la selectedConversation si se actualiza la data de conversations
  useEffect(() => {
    if (selectedConversation) {
      const updated = conversations.find(c => c.id === selectedConversation.id)
      if (updated && updated.requestStatus !== selectedConversation.requestStatus) {
        setSelectedConversation(updated)
      }
    }
  }, [conversations, selectedConversation])

  const { messages, isLoading: messagesLoading } = useMessages(selectedConversation?.id || null)
  const { sendMessage } = useSendMessage()
  const { updateStatus: updateConvStatus } = useUpdateConversationStatus()
  
  const [showSidebar, setShowSidebar] = useState(true)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useUpdateUserStatus()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation) return
    const result = await sendMessage({ conversationId: selectedConversation.id, content })
    if (!result) throw new Error("No se pudo enviar el mensaje")
  }

  const handleSelectConversation = (conversation: ConversationListItem) => {
    setSelectedConversation(conversation)
    setShowSidebar(false)
  }

  const handleAcceptRequest = async () => {
    if (!selectedConversation) return
    setIsUpdatingStatus(true)
    const success = await updateConvStatus(selectedConversation.id, "accepted")
    if (success) {
      setSelectedConversation(prev => prev ? { ...prev, requestStatus: "accepted" } : null)
    }
    setIsUpdatingStatus(false)
  }

  const handleRejectRequest = async () => {
    if (!selectedConversation) return
    setIsUpdatingStatus(true)
    const success = await updateConvStatus(selectedConversation.id, "rejected")
    if (success) {
      setSelectedConversation(null)
      setShowSidebar(true)
    }
    setIsUpdatingStatus(false)
  }

  if (!user) {
    return (
      <div className="flex h-[calc(100vh-6rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-background rounded-xl border border-border overflow-hidden shadow-sm">
      {/* Sidebar */}
      <div
        className={cn(
          "w-full md:w-80 lg:w-96 border-r border-border shrink-0 transition-all duration-300 flex flex-col",
          showSidebar ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          !showSidebar && "absolute md:relative z-10 md:z-auto hidden md:flex"
        )}
      >
        <ConversationList
          conversations={conversations}
          selectedId={selectedConversation?.id}
          onSelect={handleSelectConversation}
          isLoading={conversationsLoading}
          backHref={backHref}
          role={role}
        />
        {/* User info */}
        <div className="p-4 border-t border-border bg-sidebar mt-auto">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-10 w-10 border border-border shrink-0">
              <AvatarImage src={user.avatar_url || undefined} alt={user.first_name || ""} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                {user.first_name?.[0]?.toUpperCase() || "U"}
                {user.last_name?.[0]?.toUpperCase() || ""}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">
                {user.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : "Usuario"}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {role === "patient" ? "Paciente" : "Profesional"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {selectedConversation ? (
          <>
            <ChatHeader
              name={selectedConversation.name}
              initials={selectedConversation.initials}
              avatar={selectedConversation.avatar || undefined}
              status={selectedConversation.status}
              responseTime={selectedConversation.otherParticipant?.response_time}
              role={role}
              onBack={() => setShowSidebar(true)}
            />

            {/* Banner para Professional de solicitud pendiente */}
            {selectedConversation.requestStatus === "pending" && role === "professional" && (
              <div className="bg-amber-50 border-b border-amber-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 z-10">
                <div>
                  <h4 className="font-medium text-amber-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    Nueva solicitud de chat
                  </h4>
                  <p className="text-sm text-amber-800 mt-1">
                    El paciente quiere iniciar una conversación. Acepta para empezar a chatear.
                  </p>
                </div>
                <div className="flex gap-2 shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                  <Button 
                    variant="outline" 
                    className="flex-1 sm:flex-none bg-white hover:bg-red-50 hover:text-red-600 border-red-200"
                    onClick={handleRejectRequest}
                    disabled={isUpdatingStatus}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Rechazar
                  </Button>
                  <Button 
                    className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={handleAcceptRequest}
                    disabled={isUpdatingStatus}
                  >
                    {isUpdatingStatus ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                    Aceptar Chat
                  </Button>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
              {messagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 text-primary animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <EmptyChat />
              ) : (
                <>
                  {messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      content={message.content}
                      timestamp={message.timestamp}
                      isOwn={message.isOwn}
                      status={message.status}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input state logic */}
            {selectedConversation.requestStatus === "pending" && role === "patient" ? (
              <div className="p-4 bg-card border-t border-border flex flex-col items-center justify-center text-center py-6">
                <ShieldCheck className="w-8 h-8 text-amber-500 mb-3 opacity-80" />
                <p className="text-sm font-medium text-amber-600">
                  Esperando confirmación del especialista
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm text-balance">
                  El especialista ha sido notificado y pronto aceptará tu solicitud de chat para responder a tu consulta.
                </p>
              </div>
            ) : selectedConversation.requestStatus === "pending" && role === "professional" ? (
              <div className="p-4 bg-muted border-t border-border text-center">
                <p className="text-sm text-muted-foreground">
                  Debes aceptar la solicitud para poder responder.
                </p>
              </div>
            ) : (
              <ChatInput onSendMessage={handleSendMessage} />
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-slate-50/50">
            <EmptyChat
              title="Selecciona una conversación"
              description="Elige una conversación de la lista para comenzar a chatear de forma segura y privada."
            />
          </div>
        )}
      </div>
    </div>
  )
}
