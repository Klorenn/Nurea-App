"use client"

import * as React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserDropdown } from "@/components/ui/user-dropdown"
import { NotificationsDropdown } from "@/components/notifications/notifications-dropdown"
import { useLanguage } from "@/contexts/language-context"
import { DashboardSidebar, type UserRole } from "@/components/dashboard/Sidebar"

export function DashboardLayout({
  children,
  role = "patient",
}: {
  children: React.ReactNode
  role?: "patient" | "professional"
}) {
  const { user } = useAuth()
  const { language } = useLanguage()
  const isSpanish = language === "es"

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen w-full bg-background">
        <DashboardSidebar role={role as UserRole} language={language} />

        <SidebarInset className="flex flex-col">
          <header className="h-14 flex items-center justify-between px-4 md:px-6 bg-background/80 backdrop-blur-xl border-b border-border/40 sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <h1 className="hidden sm:block text-sm font-medium text-muted-foreground">
                {role === "professional"
                  ? isSpanish ? "Panel Profesional" : "Professional Dashboard"
                  : isSpanish ? "Mi Dashboard" : "My Dashboard"}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <NotificationsDropdown role={role} />
              <UserDropdown
                role={role}
                user={
                  user
                    ? {
                        name: user.user_metadata?.first_name
                          ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ""}`.trim()
                          : user.email?.split("@")[0] || (role === "patient" ? "Paciente" : "Profesional"),
                        email: user.email || "",
                        avatar: user.user_metadata?.avatar_url,
                        initials: user.user_metadata?.first_name?.[0]?.toUpperCase() || user.email?.charAt(0).toUpperCase() || (role === "patient" ? "P" : "PR"),
                        status: "online",
                      }
                    : undefined
                }
              />
            </div>
          </header>

          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">{children}</div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
