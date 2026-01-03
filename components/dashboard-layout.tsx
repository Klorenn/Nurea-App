"use client"

import type * as React from "react"
import { Calendar, CreditCard, Heart, LayoutDashboard, MessageSquare, Settings, User, LogOut, Bell, Star } from "lucide-react"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export function DashboardLayout({
  children,
  role = "patient",
}: {
  children: React.ReactNode
  role?: "patient" | "professional"
}) {
  const menuItems =
    role === "patient"
      ? [
          { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
          { icon: Calendar, label: "Appointments", href: "/dashboard/appointments" },
          { icon: Heart, label: "Favorites", href: "/dashboard/favorites" },
          { icon: MessageSquare, label: "Messages", href: "/dashboard/messages" },
          { icon: CreditCard, label: "Payments", href: "/dashboard/payments" },
        ]
      : [
          { icon: LayoutDashboard, label: "Dashboard", href: "/professional/dashboard" },
          { icon: Calendar, label: "Calendar", href: "/professional/calendar" },
          { icon: MessageSquare, label: "Mensajes", href: "/professional/messages" },
          { icon: Star, label: "Reseñas", href: "/professional/reviews" },
          { icon: User, label: "Public Profile", href: "/professional/profile" },
          { icon: Settings, label: "Settings", href: "/professional/settings" },
        ]

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-accent/10">
        <Sidebar collapsible="icon" className="border-r border-border bg-card">
          <SidebarHeader className="h-16 flex items-center px-4 border-b border-border/40">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-lg leading-none">N</span>
              </div>
              <span className="font-bold text-xl text-primary group-data-[collapsible=icon]:hidden transition-all duration-300">
                NUREA
              </span>
            </div>
          </SidebarHeader>
          <SidebarContent className="py-4">
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.label}
                    className="h-11 px-4 hover:bg-primary/5 hover:text-primary data-[active=true]:bg-primary/10 data-[active=true]:text-primary rounded-xl mx-2"
                  >
                    <a href={item.href}>
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-border/40">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className="h-11 px-4 text-destructive hover:bg-destructive/5 rounded-xl">
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Sign Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-col">
          <header className="h-16 flex items-center justify-between px-6 bg-background/50 backdrop-blur-md border-b border-border/40 sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div className="h-4 w-px bg-border/40" />
              <h1 className="text-lg font-semibold capitalize">{role} Dashboard</h1>
            </div>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-primary">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background" />
              </Button>
              <div className="flex items-center gap-3 pl-2">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold leading-none">
                    {role === "patient" ? "Andrés Bello" : "Dr. Elena Vargas"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{role === "patient" ? "Patient" : "Specialist"}</p>
                </div>
                <Avatar className="h-9 w-9 border border-border/40">
                  <AvatarImage src={`/avatar-${role}.jpg?height=36&width=36&query=${role}-avatar`} />
                  <AvatarFallback>{role === "patient" ? "AB" : "EV"}</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-7xl mx-auto space-y-8">{children}</div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
