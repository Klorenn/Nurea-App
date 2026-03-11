"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { Calendar, CreditCard, Heart, LayoutDashboard, MessageSquare, Settings, User, LogOut, Bell, Star, HelpCircle, Users, FileText, DollarSign, Headphones, BarChart3, Globe } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/hooks/use-auth"
import { UserDropdown } from "@/components/ui/user-dropdown"
import { NotificationsDropdown } from "@/components/notifications/notifications-dropdown"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"

export function DashboardLayout({
  children,
  role = "patient",
}: {
  children: React.ReactNode
  role?: "patient" | "professional"
}) {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const { language } = useLanguage()
  const t = useTranslations(language)
  
  const menuItems =
    role === "patient"
      ? [
          { icon: LayoutDashboard, label: t.dashboard.overview, href: "/dashboard" },
          { icon: Calendar, label: language === "es" ? "Mis Citas" : "My Appointments", href: "/dashboard/appointments" },
          { icon: Heart, label: language === "es" ? "Mis Favoritos" : "My Favorites", href: "/dashboard/favorites" },
          { icon: FileText, label: language === "es" ? "Documentos y Recetas" : "Documents & Prescriptions", href: "/dashboard/documents" },
          { icon: Users, label: language === "es" ? "Familiares" : "Family", href: "/dashboard/family" },
          { icon: User, label: language === "es" ? "Mi Perfil" : "My Profile", href: "/dashboard/profile" },
          { icon: MessageSquare, label: t.dashboard.messages, href: "/dashboard/chat" },
          { icon: CreditCard, label: t.dashboard.payments, href: "/dashboard/payments" },
          { icon: Headphones, label: language === "es" ? "Soporte" : "Support", href: "/dashboard/support" },
          { icon: HelpCircle, label: language === "es" ? "Ayuda" : "Help", href: "/dashboard/help" },
        ]
      : [
          { icon: BarChart3, label: language === "es" ? "Estadísticas" : "Statistics", href: "/professional/dashboard" },
          { icon: Calendar, label: language === "es" ? "Agenda" : "Agenda", href: "/professional/schedule" },
          { icon: Users, label: language === "es" ? "Mis Pacientes" : "My Patients", href: "/professional/patients" },
          { icon: MessageSquare, label: language === "es" ? "Mensajes" : "Messages", href: "/professional/messages" },
          { icon: Star, label: language === "es" ? "Reseñas" : "Reviews", href: "/professional/reviews" },
          { icon: Globe, label: language === "es" ? "Mi Perfil Público" : "My Public Profile", href: "/professional/profile/edit" },
          { icon: CreditCard, label: language === "es" ? "Configuración de Pagos" : "Payment Settings", href: "/professional/settings" },
        ]

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar collapsible="icon" className="border-r border-border bg-card">
          <SidebarHeader className="h-16 flex items-center gap-3 px-6 border-b border-border/40">
            <div className="flex items-center gap-2 overflow-hidden flex-1">
              <Image
                src="/logo.png"
                alt="NUREA"
                width={32}
                height={32}
                className="h-8 w-8 rounded-lg object-contain shrink-0"
              />
              <span className="font-bold text-xl text-primary dark:text-teal-400 group-data-[collapsible=icon]:hidden transition-all duration-300">
                NUREA<span className="text-xs text-muted-foreground ml-1">.app</span>
              </span>
            </div>
          </SidebarHeader>
          <SidebarContent className="py-4">
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.label}
                    className="h-11 px-4 hover:bg-primary/10 hover:text-primary dark:hover:text-teal-300 data-[active=true]:bg-primary/15 data-[active=true]:text-primary dark:data-[active=true]:text-teal-300 rounded-xl mx-2 text-primary dark:text-teal-400"
                  >
                    <a href={item.href}>
                      <item.icon className="h-5 w-5 text-primary dark:text-teal-400" />
                      <span className="font-medium text-primary dark:text-teal-400">{item.label}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-border/40">
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-col">
          <div className="flex flex-col min-h-screen">
            <header className="h-16 flex items-center justify-between px-6 bg-background border-b border-border/40 sticky top-0 z-30">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div className="h-4 w-px bg-border/20" />
                <span className="font-bold text-lg text-primary dark:text-teal-400">NUREA<span className="text-xs text-muted-foreground ml-1">.app</span></span>
                <div className="h-4 w-px bg-border/20" />
                <h1 className="text-lg font-semibold">
                  {role === "patient" 
                    ? (language === "es" ? "Panel de Paciente" : "Patient Dashboard")
                    : (language === "es" ? "Panel de Profesional" : "Professional Dashboard")
                  }
                </h1>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative">
                  <NotificationsDropdown role={role} />
                </div>
                <UserDropdown
                  role={role}
                  user={
                    user
                      ? {
                          name: user.user_metadata?.first_name
                            ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ""}`
                            : user.email?.split("@")[0] || (role === "patient" ? "Patient" : "Professional"),
                          email: user.email || "",
                          avatar: user.user_metadata?.avatar_url,
                          initials: user.user_metadata?.first_name?.[0] || user.email?.charAt(0).toUpperCase() || (role === "patient" ? "P" : "PR"),
                          status: "online",
                        }
                      : undefined
                  }
                />
              </div>
            </header>

            <main className="flex-1 p-6 overflow-y-auto overflow-x-hidden h-[calc(100vh-4rem)]">
              <div className="max-w-7xl mx-auto space-y-8">{children}</div>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
