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
  List,
  MessageCircle,
  Settings,
  Users,
  Video,
  BarChart3,
  Stethoscope,
  ClipboardList,
  Heart,
  Shield,
  User,
  UserCheck,
  LayoutDashboard,
  HeadphonesIcon,
  CloudUpload,
  HelpCircle,
  ChevronDown,
  ExternalLink,
  Star,
  Megaphone,
  Zap,
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
        icon: Users,
        label: "Gestión de Médicos",
        labelEn: "Manage Doctors",
        href: "/dashboard/admin/professionals",
      },
      {
        icon: Users,
        label: "Gestión de Pacientes",
        labelEn: "Manage Patients",
        href: "/dashboard/admin/users",
      },
      {
        icon: CreditCard,
        label: "Finanzas",
        labelEn: "Finances",
        href: "/dashboard/admin/finances",
      },
      {
        icon: UserCheck,
        label: "Verificaciones",
        labelEn: "Verifications",
        href: "/dashboard/admin/verifications",
      },
    ],
  },
  {
    title: "Sistema",
    titleEn: "System",
    items: [
      {
        icon: Settings,
        label: "Configuración del Sistema",
        labelEn: "System Settings",
        href: "/dashboard/admin/settings",
      },
    ],
  },
]

// ── Professional Navigation (referencia: Editar perfil, Canales de reserva, Opiniones, etc.) ──
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
        icon: List,
        label: "Recursos",
        labelEn: "Resources",
        href: "/dashboard/professional/recursos",
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
        label: "Pagos y Cobros",
        labelEn: "Finances",
        href: "/dashboard/professional/payouts",
      },
    ],
  },
  {
    title: "Perfil y visibilidad",
    titleEn: "Profile & visibility",
    items: [
      {
        icon: User,
        label: "Editar perfil",
        labelEn: "Edit profile",
        href: "/dashboard/professional/profile",
      },
      {
        icon: Calendar,
        label: "Canales de reserva",
        labelEn: "Booking channels",
        href: "/dashboard/professional/availability",
      },
      {
        icon: Star,
        label: "Opiniones",
        labelEn: "Reviews",
        href: "/dashboard/professional/reviews",
      },
      {
        icon: Zap,
        label: "First Class",
        labelEn: "First Class",
        href: "/dashboard/professional/settings",
      },
      {
        icon: HelpCircle,
        label: "Pregunta al Experto",
        labelEn: "Ask the Expert",
        href: "/dashboard/support",
        expandable: true,
      },
      {
        icon: Megaphone,
        label: "Promoción de mi perfil",
        labelEn: "Profile promotion",
        href: "/dashboard/professional/profile#promotion",
        expandable: true,
      },
      {
        icon: ExternalLink,
        label: "Mi perfil",
        labelEn: "My profile",
        href: "/dashboard/professional/profile",
        isButton: true,
      },
    ],
  },
  {
    title: "Configuración",
    titleEn: "Settings",
    items: [
      {
        icon: Settings,
        label: "Mi Consultorio",
        labelEn: "Practice Settings",
        href: "/dashboard/professional/settings",
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
        href: "/dashboard/patient/buscar",
      },
      {
        icon: Calendar,
        label: "Mis Citas",
        labelEn: "My Appointments",
        href: "/dashboard/patient/citas",
      },
      {
        icon: Heart,
        label: "Mis Favoritos",
        labelEn: "My Favorites",
        href: "/dashboard/favorites",
      },
      {
        icon: FileText,
        label: "Documentos y Recetas",
        labelEn: "Documents & Prescriptions",
        href: "/dashboard/documents",
      },
      {
        icon: Users,
        label: "Familiares",
        labelEn: "Family",
        href: "/dashboard/family",
      },
      {
        icon: User,
        label: "Mi Perfil",
        labelEn: "My Profile",
        href: "/dashboard/profile",
      },
      {
        icon: MessageCircle,
        label: "Mensajes",
        labelEn: "Messages",
        href: "/dashboard/chat",
      },
      {
        icon: CreditCard,
        label: "Pagos y Recibos",
        labelEn: "Payments & Receipts",
        href: "/dashboard/patient/payments",
      },
      {
        icon: HeadphonesIcon,
        label: "Soporte",
        labelEn: "Support",
        href: "/dashboard/support",
      },
      {
        icon: HelpCircle,
        label: "Ayuda",
        labelEn: "Help",
        href: "/dashboard/help",
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

  // Compact icon-only navigation for professionals (Doctoralia-style left rail)
  const professionalIconTop = React.useMemo(
    () =>
      role !== "professional"
        ? []
        : [
            professionalNavigation[0].items.find(
              (item) => item.href === "/dashboard/professional/appointments"
            ),
            professionalNavigation[0].items.find(
              (item) => item.href === "/dashboard/professional/patients"
            ),
            professionalNavigation[0].items.find(
              (item) => item.href === "/dashboard/professional/chat"
            ),
            professionalNavigation[0].items.find(
              (item) => item.href === "/dashboard/professional/fichas"
            ),
            professionalNavigation[0].items.find(
              (item) => item.href === "/dashboard/professional/payouts"
            ),
            professionalNavigation[1].items.find(
              (item) => item.href === "/dashboard/professional/profile"
            ),
          ].filter(Boolean) as NavItem[],
    []
  )

  const professionalIconBottom = React.useMemo(
    () =>
      role !== "professional"
        ? []
        : [
            professionalNavigation[0].items.find(
              (item) => item.href === "/dashboard/professional"
            ),
            professionalNavigation[1].items.find(
              (item) => item.href === "/dashboard/professional/reviews"
            ),
            professionalNavigation[2].items.find(
              (item) => item.href === "/dashboard/professional/settings"
            ),
          ].filter(Boolean) as NavItem[],
    []
  )

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

      <SidebarContent className="py-4 px-2">
        {role === "professional" ? (
          <div className="flex flex-col justify-between h-full">
            <SidebarMenu>
              {professionalIconTop.map((item) => {
                const active = isActive(item.href)
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={isSpanish ? item.label : item.labelEn}
                      size="icon"
                      className={cn(
                        "h-11 w-11 mx-auto my-1 rounded-2xl flex items-center justify-center",
                        "hover:bg-accent/60 hover:text-foreground",
                        active && "bg-[#0f766e]/10 text-[#0f766e] shadow-sm"
                      )}
                    >
                      <Link href={item.href} className="flex items-center justify-center">
                        <item.icon
                          className={cn(
                            "h-[20px] w-[20px] shrink-0 transition-colors",
                            active ? "text-[#0f766e]" : "text-muted-foreground"
                          )}
                        />
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>

            <div>
              <SidebarSeparator className="my-3 mx-3 bg-border/30" />
              <SidebarMenu>
                {professionalIconBottom.map((item) => {
                  const active = isActive(item.href)
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={isSpanish ? item.label : item.labelEn}
                        size="icon"
                        className={cn(
                          "h-10 w-10 mx-auto my-1 rounded-2xl flex items-center justify-center",
                          "hover:bg-accent/60 hover:text-foreground",
                          active && "bg-[#0f766e]/10 text-[#0f766e] shadow-sm"
                        )}
                      >
                        <Link href={item.href} className="flex items-center justify-center">
                          <item.icon
                            className={cn(
                              "h-[18px] w-[18px] shrink-0 transition-colors",
                              active ? "text-[#0f766e]" : "text-muted-foreground"
                            )}
                          />
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </div>
          </div>
        ) : (
          navigation.map((group, groupIndex) => (
            <SidebarGroup key={group.title}>
              <SidebarGroupLabel className="px-3 text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider mb-1">
                {isSpanish ? group.title : group.titleEn}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const active = isActive(item.href)
                    const isProfessionalProfileGroup =
                      role === "professional" &&
                      (group.title === "Perfil y visibilidad" ||
                        group.titleEn === "Profile & visibility")
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={active}
                          tooltip={isSpanish ? item.label : item.labelEn}
                          size={item.isButton ? "lg" : "default"}
                          variant={item.isButton ? "outline" : "default"}
                          className={cn(
                            "h-10 px-3 mx-0 rounded-xl transition-all duration-200",
                            "hover:bg-accent/60 hover:text-foreground",
                            active &&
                              role === "admin" &&
                              "bg-violet-500/10 text-violet-600 dark:text-violet-400 font-medium shadow-sm",
                            active &&
                              role !== "admin" &&
                              "bg-[#0f766e]/10 text-[#0f766e] font-medium shadow-sm",
                            isProfessionalProfileGroup &&
                              active &&
                              "border-l-4 border-l-[#0f766e] pl-2.5 bg-slate-100 dark:bg-slate-800/60",
                            item.isButton &&
                              "rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800/50 font-medium hover:bg-slate-200/80 dark:hover:bg-slate-700/50"
                          )}
                        >
                          <Link href={item.href} className="flex items-center gap-3 w-full">
                            <item.icon
                              className={cn(
                                "h-[18px] w-[18px] shrink-0 transition-colors",
                                active && role === "admin"
                                  ? "text-violet-600 dark:text-violet-400"
                                  : active
                                  ? "text-[#0f766e]"
                                  : "text-muted-foreground"
                              )}
                            />
                            <span className="truncate text-[13px] flex-1 text-left">
                              {isSpanish ? item.label : item.labelEn}
                            </span>
                            {item.expandable && (
                              <ChevronDown
                                className="h-4 w-4 shrink-0 text-muted-foreground"
                                aria-hidden
                              />
                            )}
                            {item.isNew && !item.expandable && (
                              <span
                                className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full text-white"
                                style={{ background: roleColor }}
                              >
                                {isSpanish ? "Nuevo" : "New"}
                              </span>
                            )}
                            {item.badge !== undefined && item.badge > 0 && (
                              <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive">
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
                <SidebarSeparator className="my-3 mx-3 bg-border/30" />
              )}
            </SidebarGroup>
          ))
        )}
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-border/30">
        <div className="group-data-[collapsible=icon]:hidden">
          <div className="px-3 py-2 rounded-xl bg-accent/30">
            <p className="text-[11px] text-muted-foreground">
              {isSpanish ? "¿Necesitas ayuda?" : "Need help?"}
            </p>
            <Link
              href={role === "admin" ? "/admin/support" : "/support"}
              className="text-[12px] font-medium hover:underline"
              style={{ color: roleColor }}
            >
              {isSpanish ? "Centro de soporte" : "Support center"} →
            </Link>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
