"use client"

import { useEffect, useCallback, useRef, useState } from "react"
import useSWR from "swr"
import { createClient } from "@/lib/supabase/client"
import { useProfile } from "@/hooks/use-profile"
import { toast } from "sonner"
import type {
  ChatMessageDB,
  ChatProfile,
  ConversationListItem,
  ChatMessage,
  SendMessageInput,
  RequestStatus,
} from "@/lib/types/chat"

const supabase = createClient()

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function formatTimestamp(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return formatTime(dateString)
  if (diffDays === 1) return "Ayer"
  if (diffDays < 7) return date.toLocaleDateString("es-CL", { weekday: "short" })
  return date.toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit" })
}

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function buildFullName(profile: { first_name: string | null; last_name: string | null }): string {
  return `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

// =============================================================================
// FETCHER FUNCTIONS
// =============================================================================

async function fetchConversations(userId: string): Promise<ConversationListItem[]> {
  const { data, error } = await supabase
    .from("conversation_participants")
    .select(`
      conversation_id,
      conversations!inner (
        id,
        updated_at,
        request_status,
        initiated_by
      )
    `)
    .eq("user_id", userId)

  if (error) throw error

  const result: ConversationListItem[] = []

  // Filter out rejected chats and sort by updated_at descending
  const activeChats = (data || [])
    .filter((item: any) => item.conversations?.request_status !== "rejected")
    .sort((a: any, b: any) => {
      const aDate = new Date(a.conversations?.updated_at || 0).getTime()
      const bDate = new Date(b.conversations?.updated_at || 0).getTime()
      return bDate - aDate
    })

  for (const item of activeChats) {
    // Obtener el otro participante
    const { data: otherPart } = await supabase
      .from("conversation_participants")
      .select(`
        profiles!inner (
          id,
          first_name,
          last_name,
          avatar_url,
          role,
          status,
          last_seen,
          response_time
        )
      `)
      .eq("conversation_id", item.conversation_id)
      .neq("user_id", userId)
      .single()

    if (!otherPart?.profiles) continue

    const rawProfile = otherPart.profiles as unknown as {
      id: string
      first_name: string | null
      last_name: string | null
      avatar_url: string | null
      role: string
      status: string
      last_seen: string
      response_time: string | null
    }

    const otherProfile: ChatProfile = {
      id: rawProfile.id,
      first_name: rawProfile.first_name || "",
      last_name: rawProfile.last_name || "",
      full_name: buildFullName(rawProfile),
      avatar_url: rawProfile.avatar_url,
      role: rawProfile.role as ChatProfile["role"],
      status: (rawProfile.status as ChatProfile["status"]) || "offline",
      last_seen: rawProfile.last_seen,
      response_time: rawProfile.response_time || "2-4 horas",
    }

    // Último mensaje
    const { data: lastMsg } = await supabase
      .from("chat_messages")
      .select("content, created_at")
      .eq("conversation_id", item.conversation_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    // Conteo de no leídos
    const { data: participant } = await supabase
      .from("conversation_participants")
      .select("last_read_at")
      .eq("conversation_id", item.conversation_id)
      .eq("user_id", userId)
      .single()

    const { count: unreadCount } = await supabase
      .from("chat_messages")
      .select("*", { count: "exact", head: true })
      .eq("conversation_id", item.conversation_id)
      .neq("sender_id", userId)
      .gt("created_at", participant?.last_read_at || "1970-01-01")

    const convData = item.conversations as any

    result.push({
      id: item.conversation_id,
      name: otherProfile.full_name,
      avatar: otherProfile.avatar_url,
      initials: getInitials(otherProfile.full_name),
      lastMessage: lastMsg?.content || "",
      timestamp: formatTimestamp(lastMsg?.created_at || convData.updated_at),
      unread: unreadCount || 0,
      status: otherProfile.status,
      otherParticipant: otherProfile,
      requestStatus: convData.request_status as RequestStatus,
      initiatedBy: convData.initiated_by,
    })
  }

  return result
}

async function fetchMessages(conversationId: string, userId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })

  if (error) throw error

  return (data || []).map((msg: ChatMessageDB) => ({
    id: msg.id,
    content: msg.content,
    timestamp: formatTime(msg.created_at),
    isOwn: msg.sender_id === userId,
    status: msg.status,
    messageType: msg.message_type,
    fileUrl: msg.file_url || undefined,
    fileName: msg.file_name || undefined,
  }))
}

// =============================================================================
// HOOKS
// =============================================================================

export function useCurrentChatUser() {
  const { profile, isLoading, error, mutate } = useProfile()
  return { user: profile ?? null, isLoading, error, mutate }
}

export function useConversations() {
  const { user } = useCurrentChatUser()
  const [isConnected, setIsConnected] = useState(false)

  const { data, error, isLoading, mutate } = useSWR(
    user ? ["chat-conversations", user.id] : null,
    () => fetchConversations(user!.id),
    { refreshInterval: 30000 }
  )

  // Suscripción en tiempo real a nuevos mensajes y cambios de estado de conversaciones
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel("nurea-chat-conversations")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        () => { mutate() }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "conversations" },
        () => { mutate() }
      )
      .subscribe((status) => {
        console.log(`[Chat] Conversations channel status: ${status}`)
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
        }
        if (status === 'CHANNEL_ERROR') {
          console.warn('[Chat] Conversations channel error - using polling fallback')
          setIsConnected(false)
        }
        if (status === 'TIMED_OUT') {
          console.warn('[Chat] Conversations channel timed out - using polling fallback')
          setIsConnected(false)
        }
      })

    return () => { supabase.removeChannel(channel) }
  }, [user, mutate])

  return { conversations: data || [], isLoading, error, mutate, isConnected }
}

export function useMessages(conversationId: string | null) {
  const { user } = useCurrentChatUser()
  const [isConnected, setIsConnected] = useState(false)

  const { data, error, isLoading, mutate } = useSWR(
    conversationId && user ? ["chat-messages", conversationId, user.id] : null,
    () => fetchMessages(conversationId!, user!.id)
  )

  // Suscripción en tiempo real a mensajes de esta conversación
  useEffect(() => {
    if (!conversationId || !user) return

    const channel = supabase
      .channel(`nurea-chat-msgs-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          console.log("[CHAT:REALTIME]", payload)
          const newMessage = payload.new as ChatMessageDB
          const chatMessage: ChatMessage = {
            id: newMessage.id,
            content: newMessage.content,
            timestamp: formatTime(newMessage.created_at),
            isOwn: newMessage.sender_id === user.id,
            status: newMessage.status,
            messageType: newMessage.message_type,
            fileUrl: newMessage.file_url || undefined,
            fileName: newMessage.file_name || undefined,
          }
          mutate((prev) => {
            const existing = prev || []
            if (existing.some((m) => m.id === chatMessage.id)) return existing
            return [...existing, chatMessage]
          }, false)
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chat_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const updated = payload.new as ChatMessageDB
          mutate(
            (prev) =>
              prev?.map((msg) =>
                msg.id === updated.id ? { ...msg, status: updated.status } : msg
              ),
            false
          )
        }
      )
      .subscribe((status) => {
        console.log(`[Chat] Messages channel status: ${status}`)
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
        }
        if (status === 'CHANNEL_ERROR') {
          console.warn('[Chat] Messages channel error - using polling fallback')
          setIsConnected(false)
        }
        if (status === 'TIMED_OUT') {
          console.warn('[Chat] Messages channel timed out - using polling fallback')
          setIsConnected(false)
        }
      })

    return () => { supabase.removeChannel(channel) }
  }, [conversationId, user, mutate])

  // Marcar mensajes como leídos al abrir la conversación
  useEffect(() => {
    if (!conversationId || !user) return

    const markAsRead = async () => {
      try {
        const { error: readError } = await supabase
          .from("conversation_participants")
          .update({ last_read_at: new Date().toISOString() })
          .eq("conversation_id", conversationId)
          .eq("user_id", user.id)
        
        if (readError) {
          console.error('[Chat] Error marking as read:', readError)
        }
      } catch (err) {
        console.error('[Chat] Error in markAsRead:', err)
      }
    }

    markAsRead()
  }, [conversationId, user, supabase])

  return { messages: data || [], isLoading, error, mutate, isConnected }
}

export function useSendMessage() {
  const { user } = useCurrentChatUser()
  const { profile } = useProfile()
  const sendingRef = useRef(false)

  const sendMessage = useCallback(
    async (input: SendMessageInput): Promise<ChatMessageDB | null> => {
      if (!user || sendingRef.current) return null
      sendingRef.current = true

      try {
        // Primero asegurar que el usuario es participante de la conversación
        const { error: participantError } = await supabase.rpc('ensure_chat_participant', {
          p_conversation_id: input.conversationId,
          p_user_id: user.id,
        })

        if (participantError) {
          console.error('[Chat] Error ensuring participation:', participantError)
          // Continuar de todas formas - la policy puede manejarlo
        }

        console.log("[CHAT:SEND]", {
          conversationId: input.conversationId,
          content: input.content,
          userId: user.id,
        })

        const { data, error } = await supabase
          .from("chat_messages")
          .insert({
            conversation_id: input.conversationId,
            sender_id: user.id,
            content: input.content,
            message_type: input.messageType || "text",
            file_url: input.fileUrl || null,
            file_name: input.fileName || null,
            file_size: input.fileSize || null,
            status: "sent",
          })
          .select()
          .single()

        if (error) {
          console.error("[CHAT:ERROR]", error)
          
          // Manejar errores específicos con mensajes amigables
          if (error.code === '42501' || error.message?.includes('policy')) {
            toast.error('No tienes permiso para enviar mensajes en esta conversación.')
          } else if (error.code === '23503') {
            toast.error('Error de referencia. La conversación no existe.')
          } else {
            toast.error('No se pudo enviar el mensaje. Intenta nuevamente.')
          }
          
          sendingRef.current = false
          return null
        }

        // Simular entrega (en producción viene del receptor)
        setTimeout(async () => {
          await supabase
            .from("chat_messages")
            .update({ status: "delivered" })
            .eq("id", data.id)
        }, 800)

        // Enviar notificación al receptor
        try {
          // Obtener el receiver_id de la conversación
          const { data: convData } = await supabase
            .from("conversation_participants")
            .select("user_id")
            .eq("conversation_id", input.conversationId)
            .neq("user_id", user.id)
            .single()

          if (convData?.user_id) {
            const senderName = profile?.first_name || profile?.last_name || 'Usuario'
            
            // Crear notificación
            await supabase.from("notifications").insert({
              user_id: convData.user_id,
              type: "new_message",
              title: "Nuevo mensaje",
              message: `${senderName} te ha enviado un mensaje.`,
              action_url: `/dashboard/chat?conversation=${input.conversationId}`,
            })
          }
        } catch (notifErr) {
          console.error("Error sending notification:", notifErr)
        }

        sendingRef.current = false
        return data as ChatMessageDB
      } catch (err: any) {
        console.error("[CHAT:ERROR]", err)
        sendingRef.current = false
        toast.error('Error inesperado. Intenta nuevamente.')
        return null
      }
    },
    [user, supabase]
  )

  return { sendMessage }
}

export function useUpdateUserStatus() {
  const { user, mutate } = useCurrentChatUser()

  const updateStatus = useCallback(
    async (status: "online" | "offline" | "away") => {
      if (!user) return
      await supabase
        .from("profiles")
        .update({ status, last_seen: new Date().toISOString() })
        .eq("id", user.id)
      mutate()
    },
    [user, mutate]
  )

  useEffect(() => {
    if (!user) return

    updateStatus("online")

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") updateStatus("online")
      else updateStatus("away")
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      updateStatus("offline")
    }
  }, [user, updateStatus])

  return { updateStatus }
}

export function useCreateConversation() {
  const { user } = useCurrentChatUser()
  const { mutate: mutateConversations } = useConversations()

  const createConversation = useCallback(
    async (participantId: string, professionalId?: string) => {
      if (!user) return null

      try {
        // Usar la función RPC del servidor
        const { data, error } = await supabase.rpc("get_or_create_conversation", {
          p_user_a: user.id,
          p_user_b: participantId,
          p_professional_id: professionalId || null,
        })

        if (error) throw error

        mutateConversations()
        return data as string
      } catch (err) {
        console.error("Error creating conversation:", err)
        return null
      }
    },
    [user, mutateConversations]
  )

  return { createConversation }
}

export function useUpdateConversationStatus() {
  const { mutate: mutateConversations } = useConversations()

  const updateStatus = useCallback(
    async (conversationId: string, status: "accepted" | "rejected") => {
      try {
        const { error } = await supabase.rpc("update_conversation_request_status", {
          p_conversation_id: conversationId,
          p_status: status,
        })

        if (error) throw error
        
        mutateConversations()
        return true
      } catch (err) {
        console.error("Error updating conversation status:", err)
        return false
      }
    },
    [mutateConversations]
  )

  return { updateStatus }
}
