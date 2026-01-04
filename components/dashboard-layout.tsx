"use client"

import type * as React from "react"
import { Calendar, CreditCard, Heart, LayoutDashboard, MessageSquare, Settings, User, LogOut, Bell, Star, MoreVertical } from "lucide-react"
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
import { ActivityDropdown } from "@/components/ui/activity-dropdown"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"
import WavyBackground from "@/components/ui/wavy-background"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function DashboardLayout({
  children,
  role = "patient",
}: {
  children: React.ReactNode
  role?: "patient" | "professional"
}) {
  const { user, signOut } = useAuth()
  const { language } = useLanguage()
  const t = useTranslations(language)
  
  const menuItems =
    role === "patient"
      ? [
          { icon: LayoutDashboard, label: t.dashboard.overview, href: "/dashboard" },
          { icon: Calendar, label: t.dashboard.appointments, href: "/dashboard/appointments" },
          { icon: Heart, label: t.dashboard.favorites, href: "/dashboard/favorites" },
          { icon: MessageSquare, label: t.dashboard.messages, href: "/dashboard/chat" },
          { icon: CreditCard, label: t.dashboard.payments, href: "/dashboard/payments" },
        ]
      : [
          { icon: LayoutDashboard, label: language === "es" ? "Panel" : "Dashboard", href: "/professional/dashboard" },
          { icon: Calendar, label: language === "es" ? "Calendario" : "Calendar", href: "/professional/dashboard" },
          { icon: MessageSquare, label: t.professional.messages, href: "/professional/chat" },
          { icon: Star, label: t.professional.reviews, href: "/professional/reviews" },
          { icon: User, label: language === "es" ? "Perfil Público" : "Public Profile", href: "/professional/profile/edit" },
          { icon: Settings, label: language === "es" ? "Configuración" : "Settings", href: "/professional/profile/edit" },
        ]

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-accent/10">
        <Sidebar collapsible="icon" className="border-r border-border bg-card relative overflow-hidden">
          <WavyBackground className="absolute inset-0">
            <div className="relative z-10 h-full flex flex-col">
              <SidebarHeader className="h-16 flex items-center justify-between px-6 border-b border-border/40 relative z-20">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-lg leading-none">N</span>
                  </div>
                  <span className="font-bold text-xl text-primary dark:text-teal-400 group-data-[collapsible=icon]:hidden transition-all duration-300">
                    NUREA<span className="text-xs text-muted-foreground ml-1">.app</span>
                  </span>
                </div>
                <div className="group-data-[collapsible=icon]:hidden">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1.5 rounded-lg hover:bg-accent/50 transition-colors">
                        <MoreVertical className="h-5 w-5 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem>
                        <span className="font-semibold">NUREA.app</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        {language === "es" ? "Configuración" : "Settings"}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        {language === "es" ? "Ayuda" : "Help"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </SidebarHeader>
              <SidebarContent className="py-4 relative z-20">
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton
                        asChild
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
              <SidebarFooter className="p-4 border-t border-border/40 relative z-20">
              </SidebarFooter>
            </div>
          </WavyBackground>
        </Sidebar>

        <SidebarInset className="flex flex-col relative">
          <WavyBackground className="absolute inset-0">
            <header className="h-16 flex items-center justify-between px-6 bg-background/50 backdrop-blur-md border-b border-border/40 sticky top-0 z-30">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
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
                  <ActivityDropdown role={role} />
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

            <main className="flex-1 p-6 overflow-y-auto relative z-10">
              <div className="max-w-7xl mx-auto space-y-8">{children}</div>
            </main>
          </WavyBackground>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
