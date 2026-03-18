"use client"

import { useState, useEffect, Suspense, useCallback } from "react"
import { RouteGuard } from "@/components/auth/route-guard"
import { HealthChat } from "@/components/messaging/health-chat"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"
import { usePresence } from "@/hooks/use-presence"

const supabase = createClient()

interface Contact {
  id: string
  name: string
  avatar?: string
  status?: "online" | "offline"
  lastMessage?: string
  lastMessageTime?: string
  unread?: number
  responseTime?: string
  businessHours?: string
}

function ChatContent() {
  const { user, loading: authLoading } = useAuth()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  
  // Get presence status for all contacts
  const { getPresenceStatus } = usePresence(contacts.map((contact) => contact.id))

  const loadContacts = useCallback(async () => {
    if (!user) return

    try {
      // Get all unique conversation partners (patients the professional has messaged with)
      const { data: messages, error } = await supabase
        .from("messages")
        .select("sender_id, receiver_id, content, created_at, read")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false })

      if (error) throw error

      // Get unique patient IDs
      const patientIds = new Set<string>()
      messages?.forEach((msg) => {
        if (msg.sender_id !== user.id) {
          patientIds.add(msg.sender_id)
        }
        if (msg.receiver_id !== user.id) {
          patientIds.add(msg.receiver_id)
        }
      })

      // If no messages, try to get patients from appointments
      if (patientIds.size === 0) {
        const { data: appointments } = await supabase
          .from("appointments")
          .select("patient_id")
          .eq("professional_id", user.id)

        appointments?.forEach((apt) => {
          if (apt.patient_id) {
            patientIds.add(apt.patient_id)
          }
        })
      }

      // Fetch patient profiles
      const contactsData: Contact[] = []
      for (const patientId of Array.from(patientIds)) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, avatar_url")
          .eq("id", patientId)
          .single()

        if (profile) {
          // Get last message and unread count
          const lastMsg = messages?.find(
            (m) =>
              (m.sender_id === patientId && m.receiver_id === user.id) ||
              (m.sender_id === user.id && m.receiver_id === patientId)
          )

          const unreadCount =
            messages?.filter(
              (m) => m.sender_id === patientId && m.receiver_id === user.id && !m.read
            ).length || 0

          // Get real-time presence status
          const presenceStatus = getPresenceStatus(patientId)

          contactsData.push({
            id: profile.id,
            name: `${profile.first_name} ${profile.last_name}`,
            avatar: profile.avatar_url || undefined,
            status: presenceStatus || "offline",
            lastMessage: lastMsg?.content,
            lastMessageTime: lastMsg?.created_at,
            unread: unreadCount,
          })
        }
      }

      setContacts(contactsData)
    } catch (error) {
      console.error("Error loading contacts:", error)
    } finally {
      setLoading(false)
    }
  }, [user, getPresenceStatus])

  useEffect(() => {
    if (!user || authLoading) return
    loadContacts()
  }, [user, authLoading, loadContacts])

  // Presence ya se maneja en `usePresence`; evitar subscripción duplicada (causa handlers repetidos).

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Cargando conversaciones...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Por favor inicia sesión para ver tus mensajes</p>
      </div>
    )
  }

  return (
    <HealthChat
      currentUserId={user.id}
      currentUserName={
        user.user_metadata?.first_name
          ? `Dr. ${user.user_metadata.first_name} ${user.user_metadata.last_name || ""}`
          : "Profesional"
      }
      currentUserAvatar={user.user_metadata?.avatar_url}
      contacts={contacts}
      role="professional"
    />
  )
}

export default function ProfessionalChatPage() {
  return (
    <RouteGuard requiredRole="professional">
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        <Suspense fallback={null}>
          <ChatContent />
        </Suspense>
      </div>
    </RouteGuard>
  )
}

