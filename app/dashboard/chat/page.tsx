"use client"

import { useState, useEffect, Suspense } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { HealthChat } from "@/components/messaging/health-chat"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"

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
  const supabase = createClient()

  useEffect(() => {
    if (!user || authLoading) return

    const loadContacts = async () => {
      try {
        // Get all unique conversation partners (professionals the patient has messaged with)
        const { data: messages, error } = await supabase
          .from("messages")
          .select("sender_id, receiver_id, content, created_at, read")
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order("created_at", { ascending: false })

        if (error) throw error

        // Get unique professional IDs
        const professionalIds = new Set<string>()
        messages?.forEach((msg) => {
          if (msg.sender_id !== user.id) {
            professionalIds.add(msg.sender_id)
          }
          if (msg.receiver_id !== user.id) {
            professionalIds.add(msg.receiver_id)
          }
        })

        // If no messages, try to get professionals from appointments
        if (professionalIds.size === 0) {
          const { data: appointments } = await supabase
            .from("appointments")
            .select("professional_id")
            .eq("patient_id", user.id)

          appointments?.forEach((apt) => {
            if (apt.professional_id) {
              professionalIds.add(apt.professional_id)
            }
          })
        }

        // Fetch professional profiles
        const contactsData: Contact[] = []
        for (const profId of Array.from(professionalIds)) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, first_name, last_name, avatar_url")
            .eq("id", profId)
            .single()

          if (profile) {
            // Get last message and unread count
            const lastMsg = messages?.find(
              (m) => (m.sender_id === profId && m.receiver_id === user.id) || (m.sender_id === user.id && m.receiver_id === profId)
            )

            const unreadCount = messages?.filter(
              (m) => m.sender_id === profId && m.receiver_id === user.id && !m.read
            ).length || 0

            // Get professional info for response time
            const { data: professional } = await supabase
              .from("professionals")
              .select("availability")
              .eq("id", profId)
              .single()

            // Calculate typical response time based on business hours
            const responseTime = "2-4 horas" // Default, can be calculated from availability
            const businessHours = "Lunes a Viernes, 9:00 - 18:00" // Default

            contactsData.push({
              id: profile.id,
              name: `Dr. ${profile.first_name} ${profile.last_name}`,
              avatar: profile.avatar_url || undefined,
              status: "offline", // TODO: Implement real-time status
              lastMessage: lastMsg?.content,
              lastMessageTime: lastMsg?.created_at,
              unread: unreadCount,
              responseTime,
              businessHours,
            })
          }
        }

        setContacts(contactsData)
      } catch (error) {
        console.error("Error loading contacts:", error)
      } finally {
        setLoading(false)
      }
    }

    loadContacts()
  }, [user, authLoading, supabase])

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
      currentUserName={user.user_metadata?.first_name || "Usuario"}
      currentUserAvatar={user.user_metadata?.avatar_url}
      contacts={contacts}
      role="patient"
    />
  )
}

export default function ChatPage() {
  return (
    <div className="fixed inset-0 z-50 bg-background">
      <Suspense fallback={null}>
        <ChatContent />
      </Suspense>
    </div>
  )
}
