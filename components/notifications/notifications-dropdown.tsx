"use client"

import { useState, useEffect } from "react"
import { Bell, Check, CheckCheck, Calendar, MessageCircle, CreditCard, FileText, AlertCircle, Clock, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/language-context"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { es, enUS } from "date-fns/locale"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  action_url?: string
  metadata?: any
  created_at: string
}

interface NotificationsDropdownProps {
  role?: "patient" | "professional"
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'appointment_confirmed':
    case 'appointment_reminder':
    case 'appointment_rescheduled':
    case 'appointment_completed':
      return Calendar
    case 'appointment_cancelled':
      return AlertCircle
    case 'message_new':
      return MessageCircle
    case 'payment_confirmed':
    case 'payment_failed':
      return CreditCard
    case 'document_uploaded':
      return FileText
    default:
      return Bell
  }
}

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'appointment_confirmed':
    case 'appointment_completed':
      return "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
    case 'appointment_reminder':
      return "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
    case 'appointment_cancelled':
      return "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
    case 'message_new':
      return "bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400"
    case 'payment_confirmed':
      return "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
    case 'payment_failed':
      return "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
    default:
      return "bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400"
  }
}

export function NotificationsDropdown({ role = "patient" }: NotificationsDropdownProps) {
  const { language } = useLanguage()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const loadNotifications = async () => {
    try {
      const response = await fetch('/api/notifications/list?limit=20')
      const data = await response.json()
      
      if (response.ok) {
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
    
    // Recargar cada 30 segundos
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleNotificationClick = async (notification: Notification) => {
    // Marcar como leída
    if (!notification.read) {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: notification.id })
      })
      
      // Actualizar estado local
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    }

    // Navegar si hay URL de acción
    if (notification.action_url) {
      router.push(notification.action_url)
      setIsOpen(false)
    }
  }

  const handleMarkAllAsRead = async () => {
    await fetch('/api/notifications/mark-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAllAsRead: true })
    })
    
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return formatDistanceToNow(date, {
        addSuffix: true,
        locale: language === "es" ? es : enUS
      })
    } catch {
      return ""
    }
  }

  return (
    <div className="relative">
      {!isOpen ? (
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
        <div
          className={cn(
            "absolute right-0 top-0 w-[400px] max-h-[600px] rounded-2xl shadow-2xl overflow-hidden z-50",
            "bg-white dark:bg-gray-900",
            "shadow-xl shadow-black/10 dark:shadow-black/50",
            "border border-teal-200/20 dark:border-teal-800/30",
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/40">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-900/30">
                <Bell className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 dark:bg-teal-500 text-white text-xs font-bold">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  {language === "es" ? "Notificaciones" : "Notifications"}
                </h3>
                {unreadCount > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {unreadCount} {language === "es" ? "sin leer" : "unread"}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="p-1.5 rounded-lg hover:bg-accent transition-colors"
                  title={language === "es" ? "Marcar todas como leídas" : "Mark all as read"}
                >
                  <CheckCheck className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-accent transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto max-h-[500px]">
            {loading ? (
              <div className="p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  {language === "es" ? "Cargando..." : "Loading..."}
                </p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground font-medium">
                  {language === "es" ? "No hay notificaciones" : "No notifications"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {language === "es" 
                    ? "Te notificaremos cuando haya algo importante"
                    : "We'll notify you when something important happens"}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {notifications.map((notification) => {
                  const Icon = getNotificationIcon(notification.type)
                  const iconColor = getNotificationColor(notification.type)
                  
                  return (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={cn(
                        "flex items-start gap-3 p-4 transition-colors cursor-pointer",
                        !notification.read && "bg-teal-50/50 dark:bg-teal-950/10",
                        "hover:bg-accent/50"
                      )}
                    >
                      <div className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                        iconColor
                      )}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={cn(
                            "text-sm font-semibold",
                            !notification.read && "text-gray-900 dark:text-white",
                            notification.read && "text-muted-foreground"
                          )}>
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="h-2 w-2 rounded-full bg-teal-600 dark:bg-teal-500 shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className={cn(
                          "text-sm mt-1",
                          notification.read ? "text-muted-foreground" : "text-gray-700 dark:text-gray-300"
                        )}>
                          {notification.message}
                        </p>
                        <span className="text-xs text-muted-foreground mt-1.5 block">
                          {formatTime(notification.created_at)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
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

