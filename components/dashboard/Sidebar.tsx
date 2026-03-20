"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
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
  type LucideIcon,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export type UserRole = "patient" | "professional" | "admin"

interface NavItem {
  icon: LucideIcon
  label: string
  labelEn: string
  href: string
  badge?: number
  isNew?: boolean
  /** Muestra chevron (expandible). Por ahora solo visual. */
  expandable?: boolean
  /** Estilo botón destacado (ej. "Mi perfil") */
  isButton?: boolean
}

interface NavGroup {
  title: string
  titleEn: string
  items: NavItem[]
}

// ── Admin Navigation ──────────────────────────────────────────────────────────
const adminNavigation: NavGroup[] = [
  {
    title: "Gestión",
    titleEn: "Management",
    items: [
      {
        icon: LayoutDashboard,
        label: "Resumen Global",
        labelEn: "Global Overview",
        href: "/dashboard/admin",
      },
      {
        icon: Stethoscope,
        label: "Médicos",
        labelEn: "Doctors",
        href: "/dashboard/admin/professionals",
      },
      {
        icon: Users,
        label: "Pacientes",
        labelEn: "Patients",
        href: "/dashboard/admin/users",
      },
      {
        icon: Calendar,
        label: "Citas",
        labelEn: "Appointments",
        href: "/dashboard/admin/appointments",
      },
      {
        icon: UserCheck,
        label: "Verificaciones",
        labelEn: "Verifications",
        href: "/dashboard/admin/verifications",
      },
      {
        icon: Shield,
        label: "Credenciales",
        labelEn: "Credentials",
        href: "/dashboard/admin/credentials",
      },
    ],
  },
  {
    title: "Finanzas",
    titleEn: "Finances",
    items: [
      {
        icon: CreditCard,
        label: "Dashboard Financiero",
        labelEn: "Financial Dashboard",
        href: "/dashboard/admin/finances",
      },
      {
        icon: BarChart3,
        label: "Pagos",
        labelEn: "Payments",
        href: "/dashboard/admin/payments",
      },
    ],
  },
  {
    title: "Sistema",
    titleEn: "System",
    items: [
      {
        icon: Bot,
        label: "Modo Teams",
        labelEn: "Teams Mode",
        href: "/dashboard/admin/teams",
        isNew: true,
      },
      {
        icon: HeadphonesIcon,
        label: "Soporte",
        labelEn: "Support",
        href: "/dashboard/admin/support",
      },
      {
        icon: Megaphone,
        label: "Marketing",
        labelEn: "Marketing",
        href: "/dashboard/admin/marketing",
      },
      {
        icon: Settings,
        label: "Configuración",
        labelEn: "Settings",
        href: "/dashboard/admin/settings",
      },
    ],
  },
]

// ── Professional Navigation ────────────────────────────────────────────────────
const professionalNavigation: NavGroup[] = [
  {
    title: "Principal",
    titleEn: "Main",
    items: [
      {
        icon: BarChart3,
        label: "Resumen",
        labelEn: "Overview",
        href: "/dashboard/professional",
      },
      {
        icon: Calendar,
        label: "Mi Agenda",
        labelEn: "My Schedule",
        href: "/dashboard/professional/appointments",
      },
      {
        icon: Users,
        label: "Mis Pacientes",
        labelEn: "My Patients",
        href: "/dashboard/professional/patients",
      },
      {
        icon: FileText,
        label: "Fichas Clínicas",
        labelEn: "Clinical Records",
        href: "/dashboard/professional/fichas",
      },
      {
        icon: MessageCircle,
        label: "Mensajes",
        labelEn: "Messages",
        href: "/dashboard/professional/chat",
      },
      {
        icon: CloudUpload,
        label: "Imágenes (PACS)",
        labelEn: "Images (PACS)",
        href: "/dashboard/professional/pacs",
        isNew: true,
      },
      {
        icon: CreditCard,
        label: "Estadísticas",
        labelEn: "Statistics",
        href: "/dashboard/professional/payouts",
      },
    ],
  },
  {
    title: "Perfil",
    titleEn: "Profile",
    items: [
      {
        icon: User,
        label: "Editar Perfil",
        labelEn: "Edit Profile",
        href: "/dashboard/professional/profile",
      },
      {
        icon: Calendar,
        label: "Disponibilidad",
        labelEn: "Availability",
        href: "/dashboard/professional/availability",
      },
      {
        icon: Star,
        label: "Opiniones",
        labelEn: "Reviews",
        href: "/dashboard/professional/reviews",
      },
      {
        icon: HeadphonesIcon,
        label: "Soporte",
        labelEn: "Support",
        href: "/dashboard/support",
      },
    ],
  },
]

// ── Patient Navigation ────────────────────────────────────────────────────────
const patientNavigation: NavGroup[] = [
  {
    title: "Principal",
    titleEn: "Main",
    items: [
      {
        icon: LayoutDashboard,
        label: "Mi Dashboard",
        labelEn: "My Dashboard",
        href: "/dashboard/patient",
      },
      {
        icon: Search,
        label: "Buscar Especialista",
        labelEn: "Find Specialist",
        href: "/explore",
      },
      {
        icon: Calendar,
        label: "Mis Citas",
        labelEn: "My Appointments",
        href: "/dashboard/appointments",
      },
      {
        icon: MessageCircle,
        label: "Mensajes",
        labelEn: "Messages",
        href: "/dashboard/chat",
      },
      {
        icon: Heart,
        label: "Mis Favoritos",
        labelEn: "My Favorites",
        href: "/dashboard/favorites",
      },
      {
        icon: FileText,
        label: "Documentos",
        labelEn: "Documents",
        href: "/dashboard/documents",
      },
      {
        icon: CreditCard,
        label: "Pagos",
        labelEn: "Payments",
        href: "/dashboard/payments",
      },
    ],
  },
  {
    title: "Cuenta",
    titleEn: "Account",
    items: [
      {
        icon: User,
        label: "Mi Perfil",
        labelEn: "My Profile",
        href: "/dashboard/profile",
      },
      {
        icon: Users,
        label: "Familiares",
        labelEn: "Family",
        href: "/dashboard/family",
      },
      {
        icon: HeadphonesIcon,
        label: "Soporte",
        labelEn: "Support",
        href: "/dashboard/support",
      },
    ],
  },
]

function getNavigation(role: UserRole): NavGroup[] {
  if (role === "admin") return adminNavigation
  if (role === "professional") return professionalNavigation
  return patientNavigation
}

interface DashboardSidebarProps {
  role: UserRole
  language?: "es" | "en"
  className?: string
}

export function DashboardSidebar({
  role,
  language = "es",
  className,
}: DashboardSidebarProps) {
  const pathname = usePathname()
  const isSpanish = language === "es"
  const navigation = getNavigation(role)

  const isActive = (href: string) => {
    // Exact match for root-level dashboard pages
    if (
      href === "/dashboard/professional" ||
      href === "/dashboard/patient" ||
      href === "/dashboard/admin"
    ) {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  const roleColor = role === "admin" ? "#7c3aed" : "#0f766e"
  const activeColor = role === "admin" ? "bg-violet-500/10 text-violet-600 dark:text-violet-400" : "bg-[#0f766e]/10 text-[#0f766e]"
  const activeIconColor = role === "admin" ? "text-violet-600 dark:text-violet-400" : "text-[#0f766e]"

  return (
    <Sidebar
      collapsible="icon"
      className={cn(
        "border-r border-border/40 bg-card/50 backdrop-blur-xl",
        className
      )}
    >
      <SidebarHeader className="h-16 flex items-center gap-3 px-4 border-b border-border/30">
        <Link href={role === "admin" ? "/admin" : "/"} className="flex items-center gap-2.5 overflow-hidden flex-1">
          <div
            className="relative w-9 h-9 rounded-xl overflow-hidden shrink-0 flex items-center justify-center shadow-sm"
            style={{ background: `linear-gradient(135deg, ${roleColor}cc, ${roleColor})` }}
          >
            <Image
              src="/logo.png"
              alt="NUREA"
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = "none"
              }}
            />
            <Stethoscope className="absolute h-5 w-5 text-white opacity-0" />
          </div>
          <div className="group-data-[collapsible=icon]:hidden transition-all duration-300">
            <span className="font-semibold text-lg tracking-tight text-foreground">
              NUREA
              <span className="text-[10px] text-muted-foreground font-normal ml-1 align-super">
                beta
              </span>
            </span>
            {role === "admin" && (
              <div className="flex items-center gap-1 mt-0.5">
                <Shield className="h-2.5 w-2.5 text-violet-500" />
                <span className="text-[10px] text-violet-500 font-medium">Admin</span>
              </div>
            )}
          </div>
        </Link>
      </SidebarHeader>

      {/*
        Un solo SidebarGroup evita que flex-1 del SidebarContent reparta altura entre
        varios grupos (hueco enorme en modo icono entre "Principal" y "Perfil").
      */}
      <SidebarContent className="flex flex-col items-stretch justify-start gap-0 py-3 px-2">
        <SidebarGroup className="flex-none p-0">
          {navigation.map((group, groupIndex) => (
            <React.Fragment key={group.title}>
              <SidebarGroupLabel className="mb-1 px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70 group-data-[collapsible=icon]:hidden">
                {isSpanish ? group.title : group.titleEn}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const active = isActive(item.href)
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={active}
                          tooltip={isSpanish ? item.label : item.labelEn}
                          className={cn(
                            "h-10 rounded-xl px-3 transition-all duration-200",
                            "hover:bg-accent/60 hover:text-foreground",
                            active && activeColor,
                            active && "font-medium shadow-sm",
                          )}
                        >
                          <Link href={item.href} className="flex w-full items-center gap-3">
                            <item.icon
                              className={cn(
                                "h-[18px] w-[18px] shrink-0 transition-colors",
                                active ? activeIconColor : "text-muted-foreground",
                              )}
                            />
                            <span className="flex-1 truncate text-left text-[13px] group-data-[collapsible=icon]:hidden">
                              {isSpanish ? item.label : item.labelEn}
                            </span>
                            {item.isNew && (
                              <span
                                className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white group-data-[collapsible=icon]:hidden"
                                style={{ background: roleColor }}
                              >
                                {isSpanish ? "Nuevo" : "New"}
                              </span>
                            )}
                            {item.badge !== undefined && item.badge > 0 && (
                              <span className="rounded-full bg-destructive/10 px-1.5 py-0.5 text-[11px] font-medium text-destructive group-data-[collapsible=icon]:hidden">
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
              {groupIndex < navigation.length - 1 && (
                <SidebarSeparator className="mx-2 my-2 bg-border/30" />
              )}
            </React.Fragment>
          ))}
        </SidebarGroup>
      </SidebarContent>

      {role === "admin" && (
        <SidebarFooter className="p-3 border-t border-border/30">
          <div className="group-data-[collapsible=icon]:hidden">
            <div className="px-3 py-2 rounded-xl bg-accent/30">
              <p className="text-[11px] text-muted-foreground">
                {isSpanish ? "¿Necesitas ayuda?" : "Need help?"}
              </p>
              <Link
                href="/admin/support"
                className="text-[12px] font-medium hover:underline"
                style={{ color: roleColor }}
              >
                {isSpanish ? "Centro de soporte" : "Support center"} →
              </Link>
            </div>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  )
}
