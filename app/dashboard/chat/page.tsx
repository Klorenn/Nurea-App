"use client"

import { useState, useEffect, Suspense } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { HealthChat } from "@/components/messaging/health-chat"
import { useAuth } from "@/hooks/use-auth"
import { usePresence } from "@/hooks/use-presence"
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
  
  // Obtener IDs de profesionales para presencia
  const professionalIds = contacts.map((c) => c.id)
  const { isOnline } = usePresence(professionalIds)
  
  // Actualizar estado online/offline de contactos
  useEffect(() => {
    if (professionalIds.length > 0) {
      setContacts((prev) =>
        prev.map((contact) => ({
          ...contact,
          status: isOnline(contact.id) ? 'online' : 'offline',
        }))
      )
    }
  }, [isOnline, professionalIds.length])

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
        const profIdsArray = Array.from(professionalIds)
        
        // Calcular tiempos de respuesta para todos los profesionales
        const responseTimePromises = profIdsArray.map(async (profId) => {
          try {
            const response = await fetch(`/api/professionals/${profId}/response-time?patientId=${user.id}`)
            const data = await response.json()
            return { profId, responseTime: data.formatted || '2-4 horas' }
          } catch {
            return { profId, responseTime: '2-4 horas' }
          }
        })
        
        const responseTimes = await Promise.all(responseTimePromises)
        const responseTimeMap = new Map(responseTimes.map((rt) => [rt.profId, rt.responseTime]))

        for (const profId of profIdsArray) {
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

            // Get professional info for business hours
            const { data: professional } = await supabase
              .from("professionals")
              .select("availability")
              .eq("id", profId)
              .single()

            // Calculate business hours from availability
            let businessHours = "Lunes a Viernes, 9:00 - 18:00" // Default
            if (professional?.availability) {
              const monFri = professional.availability.monday || professional.availability.weekdays
              if (monFri?.hours) {
                businessHours = `Lunes a Viernes, ${monFri.hours}`
              }
            }

            contactsData.push({
              id: profile.id,
              name: `Dr. ${profile.first_name} ${profile.last_name}`,
              avatar: profile.avatar_url || undefined,
              status: "offline", // Se actualizará con usePresence
              lastMessage: lastMsg?.content,
              lastMessageTime: lastMsg?.created_at,
              unread: unreadCount,
              responseTime: responseTimeMap.get(profId) || '2-4 horas',
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
