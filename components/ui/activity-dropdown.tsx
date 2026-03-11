"use client"

import type React from "react"
import { useState } from "react"
import { Bell, MessageCircle, Calendar, Star, CreditCard, Heart, CheckCircle2, AlertCircle, Clock, UserPlus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/language-context"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Activity {
  id: number
  icon: React.ReactNode
  iconBg: string
  title: string
  description: string
  time: string
  href?: string
  type: "message" | "appointment" | "review" | "payment" | "system" | "favorite"
  titleEn?: string
  descriptionEn?: string
  timeEn?: string
}

interface ActivityDropdownProps {
  role?: "patient" | "professional"
  activities?: Activity[]
}

// Default activities for Patient
const defaultPatientActivities: Activity[] = [
  {
    id: 1,
    icon: <MessageCircle className="h-4 w-4" />,
    iconBg: "bg-teal-100 dark:bg-teal-900/30",
    title: "Nuevo Mensaje",
    titleEn: "New Message",
    description: "Dr. Elena Vargas te envió un mensaje",
    descriptionEn: "Dr. Elena Vargas sent you a message",
    time: "Hace 2 min",
    timeEn: "2 min ago",
    href: "/dashboard/chat",
    type: "message",
  },
  {
    id: 2,
    icon: <Calendar className="h-4 w-4" />,
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    title: "Recordatorio: Cita Hoy",
    titleEn: "Reminder: Appointment Today",
    description: "Tu cita con Dr. Carlos Méndez es en 30 minutos",
    descriptionEn: "Your appointment with Dr. Carlos Méndez is in 30 minutes",
    time: "Hace 1 hora",
    timeEn: "1 hour ago",
    href: "/dashboard/appointments",
    type: "appointment",
  },
  {
    id: 3,
    icon: <Star className="h-4 w-4" />,
    iconBg: "bg-amber-100 dark:bg-amber-900/30",
    title: "Califica tu Experiencia",
    titleEn: "Rate Your Experience",
    description: "Tu cita con Dr. María González ha finalizado",
    descriptionEn: "Your appointment with Dr. María González has ended",
    time: "Hace 3 horas",
    timeEn: "3 hours ago",
    href: "/dashboard/appointments",
    type: "review",
  },
  {
    id: 4,
    icon: <CheckCircle2 className="h-4 w-4" />,
    iconBg: "bg-green-100 dark:bg-green-900/30",
    title: "Pago Confirmado",
    titleEn: "Payment Confirmed",
    description: "Tu pago de $50.000 ha sido procesado exitosamente",
    descriptionEn: "Your payment of $50,000 has been processed successfully",
    time: "Ayer",
    timeEn: "Yesterday",
    href: "/dashboard/payments",
    type: "payment",
  },
  {
    id: 5,
    icon: <Heart className="h-4 w-4" />,
    iconBg: "bg-pink-100 dark:bg-pink-900/30",
    title: "Nuevo Profesional Disponible",
    titleEn: "New Professional Available",
    description: "Dr. Ana Silva ahora está disponible en tu área",
    descriptionEn: "Dr. Ana Silva is now available in your area",
    time: "Hace 2 días",
    timeEn: "2 days ago",
    href: "/search",
    type: "favorite",
  },
]

// Default activities for Professional
const defaultProfessionalActivities: Activity[] = [
  {
    id: 1,
    icon: <MessageCircle className="h-4 w-4" />,
    iconBg: "bg-teal-100 dark:bg-teal-900/30",
    title: "Nuevo Mensaje",
    titleEn: "New Message",
    description: "Andrés Bello te envió un mensaje",
    descriptionEn: "Andrés Bello sent you a message",
    time: "Hace 5 min",
    timeEn: "5 min ago",
    href: "/professional/messages",
    type: "message",
  },
  {
    id: 2,
    icon: <Calendar className="h-4 w-4" />,
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    title: "Nueva Cita Programada",
    titleEn: "New Appointment Scheduled",
    description: "María López reservó una cita para mañana a las 10:00 AM",
    descriptionEn: "María López booked an appointment for tomorrow at 10:00 AM",
    time: "Hace 1 hora",
    timeEn: "1 hour ago",
    href: "/professional/dashboard",
    type: "appointment",
  },
  {
    id: 3,
    icon: <Star className="h-4 w-4" />,
    iconBg: "bg-amber-100 dark:bg-amber-900/30",
    title: "Nueva Reseña",
    titleEn: "New Review",
    description: "Recibiste una reseña de 5 estrellas de Juan Pérez",
    descriptionEn: "You received a 5-star review from Juan Pérez",
    time: "Hace 2 horas",
    timeEn: "2 hours ago",
    href: "/professional/reviews",
    type: "review",
  },
  {
    id: 4,
    icon: <CreditCard className="h-4 w-4" />,
    iconBg: "bg-green-100 dark:bg-green-900/30",
    title: "Pago Recibido",
    titleEn: "Payment Received",
    description: "Se procesó el pago de $80.000 de tu última consulta",
    descriptionEn: "Payment of $80,000 from your last consultation was processed",
    time: "Ayer",
    timeEn: "Yesterday",
    href: "/professional/dashboard",
    type: "payment",
  },
  {
    id: 5,
    icon: <AlertCircle className="h-4 w-4" />,
    iconBg: "bg-orange-100 dark:bg-orange-900/30",
    title: "Recordatorio: Actualizar Disponibilidad",
    titleEn: "Reminder: Update Availability",
    description: "Tienes horarios disponibles para la próxima semana",
    descriptionEn: "You have available slots for next week",
    time: "Hace 2 días",
    timeEn: "2 days ago",
    href: "/professional/profile/edit",
    type: "system",
  },
]

export function ActivityDropdown({ role = "patient", activities }: ActivityDropdownProps) {
  const { language } = useLanguage()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const defaultActivities = role === "patient" ? defaultPatientActivities : defaultProfessionalActivities
  const currentActivities = activities || defaultActivities

  const unreadCount = currentActivities.length

  const handleActivityClick = (activity: Activity) => {
    if (activity.href) {
      router.push(activity.href)
      setIsOpen(false)
    }
  }

  return (
    <div className="relative">
      {!isOpen ? (
        // Compact button when closed
        <button
          onClick={() => setIsOpen(true)}
          className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-background hover:bg-accent transition-colors border border-border/40"
        >
          <Bell className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 dark:bg-teal-500 text-white text-xs font-bold">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      ) : (
        // Expanded card when open
        <div
          className={cn(
            "absolute right-0 top-0 w-[380px] rounded-2xl shadow-2xl overflow-hidden cursor-pointer select-none z-50",
            "bg-white dark:bg-gray-900",
            "shadow-xl shadow-black/10 dark:shadow-black/50",
            "border border-teal-200/20 dark:border-teal-800/30",
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center gap-4 p-4">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-900/30 transition-colors duration-300">
              <Bell className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 dark:bg-teal-500 text-white text-xs font-bold">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {unreadCount} {language === "es" ? "Nuevas Actividades" : "New Activities"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === "es" ? "¿Qué está pasando?" : "What's happening around you"}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent transition-colors"
            >
              <svg
                className="h-5 w-5 text-teal-600 dark:text-teal-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Activity List */}
          <div className="px-2 pb-4">
            <div className="space-y-1">
              {currentActivities.map((activity, index) => (
                <div
                  key={activity.id}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleActivityClick(activity)
                  }}
                  className={cn(
                    "flex items-start gap-3 rounded-xl p-3",
                    "transition-all duration-300 ease-out",
                    "hover:bg-teal-50 dark:hover:bg-teal-950/20 cursor-pointer",
                    "animate-in fade-in slide-in-from-top-2",
                  )}
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-300",
                      activity.iconBg,
                    )}
                  >
                    <span className="text-teal-600 dark:text-teal-400">{activity.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {language === "es" ? activity.title : (activity as any).titleEn || activity.title}
                    </h4>
                    <p className="text-sm text-muted-foreground truncate">
                      {language === "es" ? activity.description : (activity as any).descriptionEn || activity.description}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0 pt-0.5">
                    {language === "es" ? activity.time : (activity as any).timeEn || activity.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Overlay to close when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

