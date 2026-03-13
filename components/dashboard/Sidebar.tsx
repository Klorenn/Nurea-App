"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  Calendar,
  CreditCard,
  Search,
  FileText,
  Settings,
  Users,
  Wallet,
  Video,
  BarChart3,
  Stethoscope,
  ClipboardList,
  FlaskConical,
  PillIcon,
  Heart,
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

export type UserRole = "patient" | "professional"

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

const professionalNavigation: NavGroup[] = [
  {
    title: "Principal",
    titleEn: "Main",
    items: [
      {
        icon: BarChart3,
        label: "Resumen de Citas",
        labelEn: "Appointments Overview",
        href: "/dashboard/professional",
      },
      {
        icon: Users,
        label: "Mis Pacientes",
        labelEn: "My Patients",
        href: "/dashboard/professional/patients",
      },
      {
        icon: Video,
        label: "Teleconsultas",
        labelEn: "Teleconsultations",
        href: "/dashboard/professional/teleconsultations",
        isNew: true,
      },
    ],
  },
  {
    title: "Finanzas",
    titleEn: "Finances",
    items: [
      {
        icon: Wallet,
        label: "Billetera Stellar",
        labelEn: "Stellar Wallet",
        href: "/dashboard/professional/wallet",
      },
      {
        icon: CreditCard,
        label: "Pagos Recibidos",
        labelEn: "Received Payments",
        href: "/dashboard/professional/payments",
      },
    ],
  },
  {
    title: "Configuración",
    titleEn: "Settings",
    items: [
      {
        icon: Settings,
        label: "Configuración de Consultorio",
        labelEn: "Practice Settings",
        href: "/dashboard/professional/settings",
      },
    ],
  },
]

const patientNavigation: NavGroup[] = [
  {
    title: "Principal",
    titleEn: "Main",
    items: [
      {
        icon: Calendar,
        label: "Mis Citas",
        labelEn: "My Appointments",
        href: "/dashboard/patient",
      },
      {
        icon: Search,
        label: "Buscar Especialista",
        labelEn: "Find Specialist",
        href: "/search",
      },
      {
        icon: Heart,
        label: "Favoritos",
        labelEn: "Favorites",
        href: "/dashboard/patient/favorites",
      },
    ],
  },
  {
    title: "Historial Médico",
    titleEn: "Medical History",
    items: [
      {
        icon: ClipboardList,
        label: "Consultas Pasadas",
        labelEn: "Past Consultations",
        href: "/dashboard/patient/history",
      },
      {
        icon: PillIcon,
        label: "Mis Recetas",
        labelEn: "My Prescriptions",
        href: "/dashboard/patient/prescriptions",
      },
      {
        icon: FlaskConical,
        label: "Resultados de Lab",
        labelEn: "Lab Results",
        href: "/dashboard/patient/lab-results",
      },
    ],
  },
  {
    title: "Pagos",
    titleEn: "Payments",
    items: [
      {
        icon: Wallet,
        label: "Métodos de Pago",
        labelEn: "Payment Methods",
        href: "/dashboard/patient/payments",
      },
    ],
  },
]

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
  const navigation = role === "professional" ? professionalNavigation : patientNavigation

  const isActive = (href: string) => {
    if (href === "/dashboard/professional" || href === "/dashboard/patient") {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <Sidebar
      collapsible="icon"
      className={cn(
        "border-r border-border/40 bg-card/50 backdrop-blur-xl",
        className
      )}
    >
      <SidebarHeader className="h-16 flex items-center gap-3 px-4 border-b border-border/30">
        <Link href="/" className="flex items-center gap-2.5 overflow-hidden flex-1">
          <div className="relative w-9 h-9 rounded-xl overflow-hidden shrink-0 bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-sm">
            <Image
              src="/logo.png"
              alt="NUREA"
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
              }}
            />
            <Stethoscope className="absolute h-5 w-5 text-white opacity-0" />
          </div>
          <span className="font-semibold text-lg tracking-tight text-foreground group-data-[collapsible=icon]:hidden transition-all duration-300">
            NUREA
            <span className="text-[10px] text-muted-foreground font-normal ml-1 align-super">
              beta
            </span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="py-4 px-2">
        {navigation.map((group, groupIndex) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="px-3 text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider mb-1">
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
                          "h-10 px-3 mx-0 rounded-xl transition-all duration-200",
                          "hover:bg-accent/60 hover:text-foreground",
                          active && "bg-[#0f766e]/10 text-[#0f766e] font-medium shadow-sm"
                        )}
                      >
                        <Link href={item.href} className="flex items-center gap-3">
                          <item.icon
                            className={cn(
                              "h-[18px] w-[18px] shrink-0 transition-colors",
                              active ? "text-[#0f766e]" : "text-muted-foreground"
                            )}
                          />
                          <span className="truncate text-[13px]">
                            {isSpanish ? item.label : item.labelEn}
                          </span>
                          {item.isNew && (
                            <span className="ml-auto text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[#0f766e] text-white">
                              {isSpanish ? "Nuevo" : "New"}
                            </span>
                          )}
                          {item.badge !== undefined && item.badge > 0 && (
                            <span className="ml-auto text-[11px] font-medium px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive">
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
        ))}
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-border/30">
        <div className="group-data-[collapsible=icon]:hidden">
          <div className="px-3 py-2 rounded-xl bg-accent/30">
            <p className="text-[11px] text-muted-foreground">
              {isSpanish ? "¿Necesitas ayuda?" : "Need help?"}
            </p>
            <Link
              href="/support"
              className="text-[12px] font-medium text-[#0f766e] hover:underline"
            >
              {isSpanish ? "Centro de soporte" : "Support center"} →
            </Link>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
