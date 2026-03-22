"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Calendar,
  CreditCard,
  Search,
  FileText,
  MessageCircle,
  Settings,
  Users,
  BarChart3,
  Stethoscope,
  Heart,
  Shield,
  User,
  UserCheck,
  LayoutDashboard,
  HeadphonesIcon,
  CloudUpload,
  Star,
  Megaphone,
  Bot,
  Menu,
  X,
  ChevronRight,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

export type UserRole = "patient" | "professional" | "admin"

interface NavItem {
  icon: LucideIcon
  label: string
  labelEn: string
  href: string
  badge?: number
  isNew?: boolean
}

interface NavGroup {
  title: string
  titleEn: string
  items: NavItem[]
}

// ── Navigation data ────────────────────────────────────────────────────────────

const adminNavigation: NavGroup[] = [
  {
    title: "Gestión",
    titleEn: "Management",
    items: [
      { icon: LayoutDashboard, label: "Resumen Global", labelEn: "Global Overview", href: "/dashboard/admin" },
      { icon: Stethoscope, label: "Médicos", labelEn: "Doctors", href: "/dashboard/admin/professionals" },
      { icon: Users, label: "Pacientes", labelEn: "Patients", href: "/dashboard/admin/users" },
      { icon: Calendar, label: "Citas", labelEn: "Appointments", href: "/dashboard/admin/appointments" },
      { icon: UserCheck, label: "Verificaciones", labelEn: "Verifications", href: "/dashboard/admin/verifications" },
      { icon: Shield, label: "Credenciales", labelEn: "Credentials", href: "/dashboard/admin/credentials" },
    ],
  },
  {
    title: "Finanzas",
    titleEn: "Finances",
    items: [
      { icon: CreditCard, label: "Dashboard Financiero", labelEn: "Financial Dashboard", href: "/dashboard/admin/finances" },
      { icon: BarChart3, label: "Pagos", labelEn: "Payments", href: "/dashboard/admin/payments" },
    ],
  },
  {
    title: "Sistema",
    titleEn: "System",
    items: [
      { icon: Bot, label: "Modo Teams", labelEn: "Teams Mode", href: "/dashboard/admin/teams", isNew: true },
      { icon: HeadphonesIcon, label: "Soporte", labelEn: "Support", href: "/dashboard/admin/support" },
      { icon: Megaphone, label: "Marketing", labelEn: "Marketing", href: "/dashboard/admin/marketing" },
      { icon: Settings, label: "Configuración", labelEn: "Settings", href: "/dashboard/admin/settings" },
    ],
  },
]

const professionalNavigation: NavGroup[] = [
  {
    title: "Principal",
    titleEn: "Main",
    items: [
      { icon: BarChart3, label: "Resumen", labelEn: "Overview", href: "/dashboard/professional" },
      { icon: Calendar, label: "Mi Agenda", labelEn: "My Schedule", href: "/dashboard/professional/appointments" },
      { icon: Users, label: "Mis Pacientes", labelEn: "My Patients", href: "/dashboard/professional/patients" },
      { icon: FileText, label: "Fichas Clínicas", labelEn: "Clinical Records", href: "/dashboard/professional/fichas" },
      { icon: MessageCircle, label: "Mensajes", labelEn: "Messages", href: "/dashboard/professional/chat" },
      { icon: CloudUpload, label: "Imágenes (PACS)", labelEn: "Images (PACS)", href: "/dashboard/professional/pacs", isNew: true },
      { icon: CreditCard, label: "Estadísticas", labelEn: "Statistics", href: "/dashboard/professional/payouts" },
    ],
  },
  {
    title: "Perfil",
    titleEn: "Profile",
    items: [
      { icon: User, label: "Editar Perfil", labelEn: "Edit Profile", href: "/dashboard/professional/profile" },
      { icon: Calendar, label: "Disponibilidad", labelEn: "Availability", href: "/dashboard/professional/availability" },
      { icon: Star, label: "Opiniones", labelEn: "Reviews", href: "/dashboard/professional/reviews" },
      { icon: HeadphonesIcon, label: "Soporte", labelEn: "Support", href: "/dashboard/support" },
    ],
  },
]

const patientNavigation: NavGroup[] = [
  {
    title: "Principal",
    titleEn: "Main",
    items: [
      { icon: LayoutDashboard, label: "Mi Dashboard", labelEn: "My Dashboard", href: "/dashboard/patient" },
      { icon: Search, label: "Buscar Especialista", labelEn: "Find Specialist", href: "/explore" },
      { icon: Calendar, label: "Mis Citas", labelEn: "My Appointments", href: "/dashboard/appointments" },
      { icon: MessageCircle, label: "Mensajes", labelEn: "Messages", href: "/dashboard/chat" },
      { icon: Heart, label: "Mis Favoritos", labelEn: "My Favorites", href: "/dashboard/favorites" },
      { icon: FileText, label: "Documentos", labelEn: "Documents", href: "/dashboard/documents" },
      { icon: CreditCard, label: "Pagos", labelEn: "Payments", href: "/dashboard/payments" },
    ],
  },
  {
    title: "Cuenta",
    titleEn: "Account",
    items: [
      { icon: User, label: "Mi Perfil", labelEn: "My Profile", href: "/dashboard/profile" },
      { icon: Users, label: "Familiares", labelEn: "Family", href: "/dashboard/family" },
      { icon: HeadphonesIcon, label: "Soporte", labelEn: "Support", href: "/dashboard/support" },
    ],
  },
]

function getNavigation(role: UserRole): NavGroup[] {
  if (role === "admin") return adminNavigation
  if (role === "professional") return professionalNavigation
  return patientNavigation
}

// ── Role theming ───────────────────────────────────────────────────────────────

function getRoleTheme(role: UserRole) {
  if (role === "admin") {
    return {
      accent: "#7c3aed",
      activeBg: "bg-violet-500/10 dark:bg-violet-500/15",
      activeText: "text-violet-700 dark:text-violet-300",
      activeIcon: "text-violet-600 dark:text-violet-400",
      badgeBg: "bg-violet-600",
      newBadge: "bg-violet-600",
      logoGradient: "from-violet-600 to-purple-600",
      hoverBg: "hover:bg-violet-500/6",
    }
  }
  return {
    accent: "#0f766e",
    activeBg: "bg-teal-500/10 dark:bg-teal-500/15",
    activeText: "text-teal-700 dark:text-teal-300",
    activeIcon: "text-teal-600 dark:text-teal-400",
    badgeBg: "bg-teal-600",
    newBadge: "bg-teal-600",
    logoGradient: "from-teal-600 to-emerald-600",
    hoverBg: "hover:bg-teal-500/6",
  }
}

// ── Props ──────────────────────────────────────────────────────────────────────

interface DashboardSidebarProps {
  role: UserRole
  language?: "es" | "en"
  className?: string
}

// ── Main component ─────────────────────────────────────────────────────────────

export function DashboardSidebar({ role, language = "es", className }: DashboardSidebarProps) {
  const [open, setOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const isSpanish = language === "es"
  const navigation = getNavigation(role)
  const theme = getRoleTheme(role)

  const isActive = (href: string) => {
    const rootPaths = ["/dashboard/professional", "/dashboard/patient", "/dashboard/admin"]
    if (rootPaths.includes(href)) return pathname === href
    return pathname.startsWith(href)
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-3 py-4 mb-2">
        <div
          className={cn(
            "relative shrink-0 w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center shadow-md",
            `bg-gradient-to-br ${theme.logoGradient}`
          )}
        >
          <Image
            src="/logo.png"
            alt="NUREA"
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = "none"
            }}
          />
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="flex flex-col leading-none">
                <span className="font-bold text-[15px] tracking-tight text-foreground whitespace-nowrap">
                  NUREA
                  <span className="text-[9px] font-normal text-muted-foreground ml-1 align-super">beta</span>
                </span>
                {role === "admin" && (
                  <span className="text-[10px] font-medium text-violet-500 flex items-center gap-0.5">
                    <Shield className="h-2.5 w-2.5" /> Admin
                  </span>
                )}
                {role === "professional" && (
                  <span className="text-[10px] text-teal-600 dark:text-teal-400">Panel Profesional</span>
                )}
                {role === "patient" && (
                  <span className="text-[10px] text-teal-600 dark:text-teal-400">Mi Salud</span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 space-y-1 scrollbar-none">
        {navigation.map((group, gi) => (
          <div key={group.title}>
            {/* Group label */}
            <AnimatePresence>
              {open && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 whitespace-nowrap"
                >
                  {isSpanish ? group.title : group.titleEn}
                </motion.p>
              )}
            </AnimatePresence>
            {!open && gi > 0 && <div className="h-px mx-3 my-2 bg-border/40" />}

            {/* Items */}
            {group.items.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-150 group",
                    "hover:bg-accent/50",
                    active && theme.activeBg,
                    active && theme.activeText,
                    !active && "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {/* Active indicator pill */}
                  {active && (
                    <motion.div
                      layoutId={`active-pill-${role}`}
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                      style={{ backgroundColor: theme.accent }}
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}

                  <item.icon
                    className={cn(
                      "h-[18px] w-[18px] shrink-0 transition-colors duration-150",
                      active ? theme.activeIcon : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />

                  <AnimatePresence>
                    {open && (
                      <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className="flex items-center gap-2 overflow-hidden"
                      >
                        <span className={cn("text-[13px] whitespace-nowrap font-medium", active ? "font-semibold" : "")}>
                          {isSpanish ? item.label : item.labelEn}
                        </span>
                        {item.isNew && (
                          <span
                            className="rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white"
                            style={{ backgroundColor: theme.accent }}
                          >
                            {isSpanish ? "Nuevo" : "New"}
                          </span>
                        )}
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className="rounded-full bg-destructive/15 px-1.5 py-0.5 text-[11px] font-semibold text-destructive">
                            {item.badge}
                          </span>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Tooltip on collapsed */}
                  {!open && (
                    <div
                      className="absolute left-full ml-3 z-50 hidden group-hover:flex items-center whitespace-nowrap"
                    >
                      <div className="bg-popover text-popover-foreground text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-lg border border-border/50">
                        {isSpanish ? item.label : item.labelEn}
                        {item.isNew && (
                          <span
                            className="ml-1.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white"
                            style={{ backgroundColor: theme.accent }}
                          >
                            New
                          </span>
                        )}
                      </div>
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 rotate-45 bg-popover border-l border-b border-border/50" />
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <AnimatePresence>
        {open && role === "admin" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="mx-3 mb-3 mt-2 p-3 rounded-xl bg-accent/30 border border-border/30"
          >
            <p className="text-[11px] text-muted-foreground mb-0.5">{isSpanish ? "¿Necesitas ayuda?" : "Need help?"}</p>
            <Link
              href="/dashboard/admin/support"
              className="text-[12px] font-semibold hover:underline"
              style={{ color: theme.accent }}
            >
              {isSpanish ? "Centro de soporte →" : "Support center →"}
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────────────────────── */}
      <motion.aside
        animate={{ width: open ? 260 : 72 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className={cn(
          "hidden md:flex flex-col h-screen sticky top-0 shrink-0 overflow-hidden z-40",
          "bg-card/60 dark:bg-card/40 backdrop-blur-xl",
          "border-r border-border/40",
          className
        )}
      >
        {sidebarContent}
      </motion.aside>

      {/* ── Mobile: top bar + drawer ────────────────────────────────────────── */}
      <div className="md:hidden">
        {/* Top bar */}
        <div className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 bg-card/80 dark:bg-card/60 backdrop-blur-xl border-b border-border/40">
          <Link href="/" className="flex items-center gap-2">
            <div
              className={cn(
                "w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center shadow-sm",
                `bg-gradient-to-br ${theme.logoGradient}`
              )}
            >
              <Image
                src="/logo.png"
                alt="NUREA"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).style.display = "none"
                }}
              />
            </div>
            <span className="font-bold text-[15px] tracking-tight text-foreground">NUREA</span>
          </Link>
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* Spacer for top bar */}
        <div className="h-14" />

        {/* Drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
                onClick={() => setMobileOpen(false)}
              />

              {/* Drawer panel */}
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                className="fixed top-0 left-0 bottom-0 z-50 w-72 bg-card dark:bg-card shadow-2xl overflow-y-auto"
              >
                {/* Close button */}
                <button
                  onClick={() => setMobileOpen(false)}
                  className="absolute top-4 right-4 p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground z-10"
                >
                  <X className="h-5 w-5" />
                </button>

                {/* Force sidebar open for mobile drawer */}
                <div className="h-full" style={{ "--open": "1" } as React.CSSProperties}>
                  {/* Logo in drawer */}
                  <div className="flex items-center gap-3 px-4 py-5 border-b border-border/30">
                    <div
                      className={cn(
                        "w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center shadow-sm",
                        `bg-gradient-to-br ${theme.logoGradient}`
                      )}
                    >
                      <Image
                        src="/logo.png"
                        alt="NUREA"
                        width={36}
                        height={36}
                        className="h-9 w-9 object-contain"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).style.display = "none"
                        }}
                      />
                    </div>
                    <div className="flex flex-col leading-none">
                      <span className="font-bold text-[15px] tracking-tight text-foreground">
                        NUREA
                        <span className="text-[9px] font-normal text-muted-foreground ml-1 align-super">beta</span>
                      </span>
                      {role === "admin" && (
                        <span className="text-[10px] font-medium text-violet-500 flex items-center gap-0.5">
                          <Shield className="h-2.5 w-2.5" /> Admin
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Mobile nav */}
                  <nav className="px-3 py-4 space-y-1">
                    {navigation.map((group, gi) => (
                      <div key={group.title}>
                        <p className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                          {isSpanish ? group.title : group.titleEn}
                        </p>
                        {group.items.map((item) => {
                          const active = isActive(item.href)
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setMobileOpen(false)}
                              className={cn(
                                "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all",
                                active ? cn(theme.activeBg, theme.activeText) : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                              )}
                            >
                              <item.icon
                                className={cn(
                                  "h-[18px] w-[18px] shrink-0",
                                  active ? theme.activeIcon : "text-muted-foreground"
                                )}
                              />
                              <span className={cn("text-[13px]", active ? "font-semibold" : "font-medium")}>
                                {isSpanish ? item.label : item.labelEn}
                              </span>
                              {item.isNew && (
                                <span
                                  className="ml-auto rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white"
                                  style={{ backgroundColor: theme.accent }}
                                >
                                  {isSpanish ? "Nuevo" : "New"}
                                </span>
                              )}
                            </Link>
                          )
                        })}
                        {gi < navigation.length - 1 && <div className="h-px mx-3 my-2 bg-border/30" />}
                      </div>
                    ))}
                  </nav>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
