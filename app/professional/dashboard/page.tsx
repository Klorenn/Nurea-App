"use client"

import { useState } from "react"
import ProfessionalDashboard, { Appointment, PatientMessage } from "@/components/ui/professional-dashboard"
import { useAuth } from "@/hooks/use-auth"

export default function ProfessionalDashboardPage() {
  const { user } = useAuth()

  // Mock appointments data
  const [appointments] = useState<Appointment[]>([
    {
      id: "1",
      patientName: "Andrés Bello",
      patientAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&q=80&auto=format&fit=crop",
      date: "2025-01-15",
      time: "14:30",
      duration: 60,
      type: "online",
      status: "confirmed",
      specialty: "Consulta General",
      price: 45000,
    },
    {
      id: "2",
      patientName: "Camila Jara",
      patientAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&q=80&auto=format&fit=crop",
      date: "2025-01-15",
      time: "15:45",
      duration: 45,
      type: "in-person",
      status: "confirmed",
      specialty: "Seguimiento",
      price: 50000,
    },
    {
      id: "3",
      patientName: "Roberto Silva",
      patientAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&q=80&auto=format&fit=crop",
      date: "2025-01-15",
      time: "17:00",
      duration: 60,
      type: "online",
      status: "pending",
      specialty: "Primera Consulta",
      price: 55000,
    },
    {
      id: "4",
      patientName: "María González",
      patientAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&q=80&auto=format&fit=crop",
      date: "2025-01-16",
      time: "10:00",
      duration: 30,
      type: "online",
      status: "confirmed",
      specialty: "Control",
      price: 40000,
    },
    {
      id: "5",
      patientName: "Juan Pérez",
      patientAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&q=80&auto=format&fit=crop",
      date: "2025-01-16",
      time: "11:30",
      duration: 60,
      type: "in-person",
      status: "completed",
      specialty: "Consulta General",
      price: 50000,
      notes: "Paciente muy colaborador",
    },
    {
      id: "6",
      patientName: "Sofia Martínez",
      patientAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64&q=80&auto=format&fit=crop",
      date: "2025-01-14",
      time: "16:00",
      duration: 45,
      type: "online",
      status: "completed",
      specialty: "Seguimiento",
      price: 45000,
    },
  ])

  // Mock messages data
  const [messages] = useState<PatientMessage[]>([
    {
      id: "m1",
      name: "Andrés Bello",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&q=80&auto=format&fit=crop",
      text: "Hola doctora, ¿puedo cambiar mi cita de mañana a las 3pm?",
      date: "Hace 2 horas",
      starred: true,
      appointmentId: "1",
    },
    {
      id: "m2",
      name: "Camila Jara",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&q=80&auto=format&fit=crop",
      text: "Muchas gracias por la consulta de hoy, me ayudó mucho.",
      date: "Hace 5 horas",
      appointmentId: "2",
    },
    {
      id: "m3",
      name: "Roberto Silva",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&q=80&auto=format&fit=crop",
      text: "Tengo una pregunta sobre mi tratamiento, ¿podemos hablar?",
      date: "Ayer",
      appointmentId: "3",
    },
  ])

  const handleAppointmentClick = (appointmentId: string) => {
    console.log("Appointment clicked:", appointmentId)
    // Navigate to appointment details
  }

  const handleAppointmentAction = (appointmentId: string, action: "confirm" | "cancel" | "complete") => {
    console.log("Appointment action:", appointmentId, action)
    // Handle appointment actions
  }

  return (
    <ProfessionalDashboard
        title="Panel de Profesional"
        user={{
          name: user?.user_metadata?.first_name
            ? `Dr. ${user.user_metadata.first_name} ${user.user_metadata.last_name || ""}`
            : "Dr. Elena Vargas",
          avatarUrl: user?.user_metadata?.avatar_url || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=96&q=80&auto=format&fit=crop",
        }}
        appointments={appointments}
        messages={messages}
        onAppointmentClick={handleAppointmentClick}
        onAppointmentAction={handleAppointmentAction}
        defaultView="list"
        defaultMessagesOpen={false}
        searchPlaceholder="Buscar citas o pacientes..."
      />
  )
}
