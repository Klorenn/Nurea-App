"use client"

import React, { useEffect, useId, useMemo, useRef, useState, useCallback } from "react"
import { Calendar, MessageCircle, Star, Clock, DollarSign, Users, TrendingUp, Filter, Search, Bell, Settings, Home, ChartBar, Video, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export type AppointmentStatus = "confirmed" | "pending" | "completed" | "cancelled"

export type Appointment = {
  id: string
  patientName: string
  patientAvatar?: string
  date: string
  time: string
  duration: number
  type: "online" | "in-person"
  status: AppointmentStatus
  specialty?: string
  notes?: string
  price?: number
}

export type Stat = {
  id: string
  label: string
  value: number | string
  icon?: React.ReactNode
  trend?: "up" | "down" | "neutral"
}

export type PatientMessage = {
  id: string
  name: string
  avatarUrl: string
  text: string
  date: string
  starred?: boolean
  appointmentId?: string
}

export type ProfessionalDashboardProps = {
  title?: string
  user?: { name?: string; avatarUrl?: string }
  stats?: Stat[]
  appointments: Appointment[]
  messages?: PatientMessage[]
  view?: "grid" | "list"
  defaultView?: "grid" | "list"
  onViewChange?: (view: "grid" | "list") => void
  searchQuery?: string
  defaultSearchQuery?: string
  onSearchQueryChange?: (q: string) => void
  showSearch?: boolean
  searchPlaceholder?: string
  messagesOpen?: boolean
  defaultMessagesOpen?: boolean
  onMessagesOpenChange?: (open: boolean) => void
  statusFilter?: AppointmentStatus | "all"
  defaultStatusFilter?: AppointmentStatus | "all"
  onStatusFilterChange?: (status: AppointmentStatus | "all") => void
  onAppointmentClick?: (appointmentId: string) => void
  onAppointmentAction?: (appointmentId: string, action: "confirm" | "cancel" | "complete") => void
  onMessageStarChange?: (messageId: string, starred: boolean) => void
  className?: string
  loading?: boolean
}

const spacing = {
  page: {
    header: "px-4 sm:px-6 lg:px-8 py-4",
    sidebar: "px-2 sm:px-3 py-4",
    main: "px-4 sm:px-6 lg:px-8 py-4",
    messages: "px-4 sm:px-6 py-4",
  },
  card: {
    base: "p-4 sm:p-5 lg:p-6",
    compact: "p-3 sm:p-4",
  },
  button: {
    sm: "px-2.5 py-1.5",
    md: "px-3 py-2",
    lg: "px-4 py-2.5",
  },
  gap: {
    xs: "gap-2",
    sm: "gap-3",
    md: "gap-4",
    lg: "gap-6",
  },
}

const cx = (...classes: Array<string | false | null | undefined>) => {
  return classes.filter(Boolean).join(" ")
}

export function ProfessionalDashboard({
  title = "Panel de Profesional",
  user = {
    name: "Dr. Elena Vargas",
    avatarUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=96&q=80&auto=format&fit=crop",
  },
  stats,
  appointments,
  messages = [],
  view,
  defaultView = "list",
  onViewChange,
  searchQuery,
  defaultSearchQuery = "",
  onSearchQueryChange,
  showSearch = true,
  searchPlaceholder = "Buscar citas o pacientes...",
  messagesOpen,
  defaultMessagesOpen = false,
  onMessagesOpenChange,
  statusFilter,
  defaultStatusFilter = "all",
  onStatusFilterChange,
  onAppointmentClick,
  onAppointmentAction,
  onMessageStarChange,
  className = "",
  loading = false,
}: ProfessionalDashboardProps) {
  const { language } = useLanguage()
  const t = useTranslations(language)

  const [internalView, setInternalView] = useState<"grid" | "list">(defaultView)
  const viewMode = view ?? internalView

  const [internalQuery, setInternalQuery] = useState<string>(defaultSearchQuery)
  const query = searchQuery ?? internalQuery

  const [internalMessagesOpen, setInternalMessagesOpen] = useState<boolean>(defaultMessagesOpen)
  const isMessagesOpen = messagesOpen ?? internalMessagesOpen

  const [internalStatusFilter, setInternalStatusFilter] = useState<AppointmentStatus | "all">(defaultStatusFilter)
  const activeStatusFilter = statusFilter ?? internalStatusFilter

  const searchInputId = useId()
  const statusSelectId = useId()

  const computedStats: Stat[] = useMemo(() => {
    if (stats) return stats
    const today = appointments.filter((a) => {
      const apptDate = new Date(a.date)
      const today = new Date()
      return apptDate.toDateString() === today.toDateString()
    })
    const confirmed = appointments.filter((a) => a.status === "confirmed").length
    const completed = appointments.filter((a) => a.status === "completed").length
    const totalRevenue = appointments
      .filter((a) => a.status === "completed" && a.price)
      .reduce((sum, a) => sum + (a.price || 0), 0)

    return [
      { id: "today", label: language === "es" ? "Citas Hoy" : "Today's Appointments", value: today.length, icon: <Calendar className="size-4" /> },
      { id: "confirmed", label: language === "es" ? "Confirmadas" : "Confirmed", value: confirmed, icon: <Clock className="size-4" /> },
      { id: "completed", label: language === "es" ? "Completadas" : "Completed", value: completed, icon: <Star className="size-4" /> },
      { id: "revenue", label: language === "es" ? "Ingresos" : "Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: <DollarSign className="size-4" /> },
    ]
  }, [stats, appointments, language])

  const filteredAppointments = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = appointments.slice()

    if (activeStatusFilter !== "all") {
      list = list.filter((a) => a.status === activeStatusFilter)
    }
    if (q) {
      list = list.filter(
        (a) =>
          a.patientName.toLowerCase().includes(q) ||
          (a.specialty?.toLowerCase().includes(q) ?? false) ||
          (a.notes?.toLowerCase().includes(q) ?? false)
      )
    }

    return list.sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`).getTime()
      const dateB = new Date(`${b.date} ${b.time}`).getTime()
      return dateB - dateA
    })
  }, [appointments, query, activeStatusFilter])

  const setView = (next: "grid" | "list") => {
    if (view === undefined) setInternalView(next)
    onViewChange?.(next)
  }

  const setSearch = (q: string) => {
    if (searchQuery === undefined) setInternalQuery(q)
    onSearchQueryChange?.(q)
  }

  const setMessagesOpen = (open: boolean) => {
    if (messagesOpen === undefined) setInternalMessagesOpen(open)
    onMessagesOpenChange?.(open)
  }

  const setStatusFilter = (status: AppointmentStatus | "all") => {
    if (statusFilter === undefined) setInternalStatusFilter(status)
    onStatusFilterChange?.(status)
  }

  const getStatusColor = (status: AppointmentStatus) => {
    const colors = {
      confirmed: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300 border-teal-200 dark:border-teal-800",
      pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800",
      completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800",
    }
    return colors[status]
  }

  const getStatusLabel = (status: AppointmentStatus) => {
    const labels = {
      confirmed: language === "es" ? "Confirmada" : "Confirmed",
      pending: language === "es" ? "Pendiente" : "Pending",
      completed: language === "es" ? "Completada" : "Completed",
      cancelled: language === "es" ? "Cancelada" : "Cancelled",
    }
    return labels[status]
  }

  const [localStarred, setLocalStarred] = useState<Record<string, boolean>>({})
  useEffect(() => {
    const seed: Record<string, boolean> = {}
    messages.forEach((m) => (seed[m.id] = !!m.starred))
    setLocalStarred(seed)
  }, [messages])

  const isStarred = (m: PatientMessage) => m.starred ?? localStarred[m.id] ?? false
  const toggleStar = (m: PatientMessage) => {
    const next = !isStarred(m)
    if (onMessageStarChange) {
      onMessageStarChange(m.id, next)
    } else {
      setLocalStarred((s) => ({ ...s, [m.id]: next }))
    }
  }

  const sidebarLinks = [
    { id: "home", label: language === "es" ? "Inicio" : "Home", icon: <Home className="size-5" />, active: true },
    { id: "calendar", label: language === "es" ? "Calendario" : "Calendar", icon: <Calendar className="size-5" /> },
    { id: "analytics", label: language === "es" ? "Analíticas" : "Analytics", icon: <ChartBar className="size-5" /> },
    { id: "settings", label: language === "es" ? "Configuración" : "Settings", icon: <Settings className="size-5" /> },
  ]

  return (
    <div className={cx("flex flex-col h-screen bg-background", className)}>
      {/* Header */}
      <header className={cx("flex items-center justify-between border-b border-teal-200/20 dark:border-teal-800/30", spacing.page.header, spacing.gap.sm)}>
        <div className={cx("flex items-center min-w-0", spacing.gap.sm)}>
          <div className="inline-flex size-10 items-center justify-center rounded-lg bg-teal-600 text-white dark:bg-teal-500 shrink-0">
            <Calendar className="size-5" />
          </div>
          <h1 className="text-lg font-semibold text-foreground truncate">{title}</h1>

          {showSearch && (
            <label
              htmlFor={searchInputId}
              className={cx(
                "hidden md:flex items-center rounded-lg bg-accent/50 dark:bg-accent/20",
                "ring-1 ring-teal-200/30 dark:ring-teal-800/30 px-3 py-2 ml-4",
                spacing.gap.xs
              )}
            >
              <Search className="size-4 text-teal-600 dark:text-teal-400" />
              <input
                id={searchInputId}
                aria-label="Buscar citas"
                className="bg-transparent placeholder:text-muted-foreground focus:outline-none text-sm w-56"
                placeholder={searchPlaceholder}
                value={query}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
          )}
        </div>

        <div className={cx("flex items-center", spacing.gap.xs)}>
          <Button
            variant="ghost"
            size="icon"
            className="relative text-muted-foreground hover:text-teal-600 dark:hover:text-teal-400"
            onClick={() => setMessagesOpen(true)}
          >
            <Bell className="h-5 w-5" />
            {messages.length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-teal-600 rounded-full border-2 border-background" />
            )}
          </Button>

          <div className="flex items-center gap-3 pl-2">
            <Avatar className="h-9 w-9 border-2 border-teal-200 dark:border-teal-800">
              <AvatarImage src={user?.avatarUrl} />
              <AvatarFallback className="bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300">
                {user?.name?.charAt(0) || "P"}
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:inline text-sm font-medium text-foreground">{user?.name}</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={cx("hidden sm:flex flex-col items-center border-r border-teal-200/20 dark:border-teal-800/30", spacing.page.sidebar, spacing.gap.sm)}>
          {sidebarLinks.map((l) => (
            <button
              key={l.id}
              className={cx(
                "size-11 inline-flex items-center justify-center rounded-lg transition-all",
                "ring-1 ring-teal-200/30 dark:ring-teal-800/30",
                l.active
                  ? "bg-teal-600 text-white dark:bg-teal-500"
                  : "bg-accent/50 dark:bg-accent/20 text-muted-foreground hover:bg-teal-50 dark:hover:bg-teal-950/20 hover:text-teal-600 dark:hover:text-teal-400"
              )}
              title={l.label}
            >
              {l.icon}
              <span className="sr-only">{l.label}</span>
            </button>
          ))}
        </aside>

        {/* Main content */}
        <main className={cx("flex-1 min-w-0 overflow-hidden flex flex-col", spacing.page.main)}>
          {/* Stats */}
          <div className={cx("flex flex-wrap items-center", spacing.gap.md, "mb-4")}>
            {computedStats.map((s, i) => (
              <div key={s.id} className={cx("flex items-center gap-2 bg-card rounded-xl p-4 ring-1 ring-teal-200/20 dark:ring-teal-800/20", spacing.gap.xs)}>
                <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400">
                  {s.icon}
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className={cx("flex items-center", spacing.gap.xs)}>
              <label className="sr-only" htmlFor={statusSelectId}>
                Filtrar por estado
              </label>
              <select
                id={statusSelectId}
                value={activeStatusFilter}
                onChange={(e) => setStatusFilter(e.target.value as AppointmentStatus | "all")}
                className={cx(
                  "rounded-lg ring-1 ring-teal-200/30 dark:ring-teal-800/30",
                  "bg-accent/50 dark:bg-accent/20 text-foreground",
                  spacing.button.sm
                )}
              >
                <option value="all">{language === "es" ? "Todas" : "All"}</option>
                <option value="confirmed">{language === "es" ? "Confirmadas" : "Confirmed"}</option>
                <option value="pending">{language === "es" ? "Pendientes" : "Pending"}</option>
                <option value="completed">{language === "es" ? "Completadas" : "Completed"}</option>
                <option value="cancelled">{language === "es" ? "Canceladas" : "Cancelled"}</option>
              </select>

              <div className="inline-flex rounded-lg ring-1 ring-teal-200/30 dark:ring-teal-800/30">
                <button
                  onClick={() => setView("list")}
                  className={cx(
                    "p-2 rounded-l-lg transition-colors",
                    viewMode === "list"
                      ? "bg-teal-600 text-white dark:bg-teal-500"
                      : "bg-accent/50 dark:bg-accent/20 text-muted-foreground hover:bg-teal-50 dark:hover:bg-teal-950/20"
                  )}
                  title="Vista de lista"
                >
                  <Filter className="size-5" />
                </button>
                <button
                  onClick={() => setView("grid")}
                  className={cx(
                    "p-2 rounded-r-lg transition-colors",
                    viewMode === "grid"
                      ? "bg-teal-600 text-white dark:bg-teal-500"
                      : "bg-accent/50 dark:bg-accent/20 text-muted-foreground hover:bg-teal-50 dark:hover:bg-teal-950/20"
                  )}
                  title="Vista de cuadrícula"
                >
                  <Calendar className="size-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Appointments */}
          <section
            aria-label="Citas"
            className={cx(
              "flex-1 overflow-y-auto",
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
                : cx("flex flex-col", spacing.gap.sm)
            )}
          >
            {loading && (
              <div className="col-span-full">
                <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-44 rounded-xl bg-muted" />
                  ))}
                </div>
              </div>
            )}

            {!loading && filteredAppointments.map((appt) => (
              <article
                key={appt.id}
                className={cx(
                  "group rounded-xl transition-all",
                  "ring-1 ring-teal-200/20 dark:ring-teal-800/20",
                  "bg-card hover:shadow-lg hover:ring-teal-300/30 dark:hover:ring-teal-700/30",
                  viewMode === "list"
                    ? cx("flex items-center", spacing.card.compact, spacing.gap.md)
                    : cx("flex flex-col", spacing.card.base)
                )}
                onClick={() => onAppointmentClick?.(appt.id)}
              >
                <div className={cx("flex items-start justify-between", viewMode === "list" ? "w-full" : "")}>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-12 border-2 border-teal-200 dark:border-teal-800">
                      <AvatarImage src={appt.patientAvatar} />
                      <AvatarFallback className="bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300">
                        {appt.patientName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground">{appt.patientName}</p>
                      <p className="text-sm text-muted-foreground">{appt.specialty || t.professional.specialty}</p>
                    </div>
                  </div>
                  <Badge className={cn("border", getStatusColor(appt.status))}>
                    {getStatusLabel(appt.status)}
                  </Badge>
                </div>

                <div className={cx("mt-3", viewMode === "list" ? "flex-1" : "")}>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="size-4 text-teal-600 dark:text-teal-400" />
                      {appt.date}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="size-4 text-teal-600 dark:text-teal-400" />
                      {appt.time} ({appt.duration} {language === "es" ? "min" : "min"})
                    </div>
                    <div className="flex items-center gap-1.5">
                      {appt.type === "online" ? (
                        <Video className="size-4 text-teal-600 dark:text-teal-400" />
                      ) : (
                        <MapPin className="size-4 text-teal-600 dark:text-teal-400" />
                      )}
                      {appt.type === "online" ? (language === "es" ? "Online" : "Online") : (language === "es" ? "Presencial" : "In-person")}
                    </div>
                  </div>
                  {appt.price && (
                    <div className="mt-2 text-sm">
                      <span className="text-muted-foreground">{language === "es" ? "Precio: " : "Price: "}</span>
                      <span className="font-semibold text-teal-600 dark:text-teal-400">${appt.price.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {appt.status === "pending" && (
                  <div className={cx("mt-4 flex gap-2", viewMode === "list" ? "w-full" : "")}>
                    <Button
                      size="sm"
                      className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
                      onClick={(e) => {
                        e.stopPropagation()
                        onAppointmentAction?.(appt.id, "confirm")
                      }}
                    >
                      {language === "es" ? "Confirmar" : "Confirm"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation()
                        onAppointmentAction?.(appt.id, "cancel")
                      }}
                    >
                      {language === "es" ? "Cancelar" : "Cancel"}
                    </Button>
                  </div>
                )}
              </article>
            ))}

            {!loading && filteredAppointments.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                {language === "es" ? "No hay citas que coincidan con tu búsqueda." : "No appointments match your search."}
              </div>
            )}
          </section>
        </main>

        {/* Messages Panel */}
        <aside
          className={cx(
            "fixed md:relative inset-y-0 right-0 z-40 w-80 md:w-96",
            "bg-card border-l border-teal-200/20 dark:border-teal-800/30",
            "transform transition-transform duration-300 md:transform-none",
            isMessagesOpen ? "translate-x-0" : "translate-x-full md:translate-x-0",
            "md:block"
          )}
          aria-label="Mensajes de pacientes"
        >
          <div className={cx("flex items-center justify-between border-b border-teal-200/20 dark:border-teal-800/30", spacing.page.messages)}>
            <p className="text-base font-semibold text-foreground">
              {language === "es" ? "Mensajes de Pacientes" : "Patient Messages"}
            </p>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMessagesOpen(false)}
            >
              <span className="sr-only">Cerrar mensajes</span>
              ×
            </Button>
          </div>

          <div className={cx("overflow-y-auto h-[calc(100%-64px)]", spacing.page.messages, "space-y-3")}>
            {messages.map((m) => (
              <div
                key={m.id}
                className={cx(
                  "flex items-start rounded-lg",
                  "ring-1 ring-teal-200/20 dark:ring-teal-800/20",
                  "bg-card",
                  spacing.card.compact,
                  spacing.gap.sm
                )}
              >
                <Avatar className="size-10 shrink-0">
                  <AvatarImage src={m.avatarUrl} />
                  <AvatarFallback className="bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300">
                    {m.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between">
                    <div className="font-medium text-foreground">{m.name}</div>
                    <button
                      onClick={() => toggleStar(m)}
                      className="text-muted-foreground hover:text-teal-600 dark:hover:text-teal-400"
                    >
                      <Star className={cn("size-4", isStarred(m) && "fill-amber-400 text-amber-400")} />
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{m.text}</p>
                  <p className="text-xs text-muted-foreground mt-2">{m.date}</p>
                </div>
              </div>
            ))}
            {messages.length === 0 && (
              <div className="text-center py-8 text-sm text-muted-foreground">
                {language === "es" ? "No hay mensajes aún." : "No messages yet."}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

export default ProfessionalDashboard

