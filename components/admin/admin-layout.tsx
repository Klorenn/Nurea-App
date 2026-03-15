"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Shield, 
  Users, 
  CreditCard, 
  MessageSquare,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  UserCheck,
  Settings,
  AlertTriangle,
  Bell,
  ChevronRight,
  Stethoscope
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useLanguage } from "@/contexts/language-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const { language } = useLanguage()
  const isSpanish = language === "es"
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const menuItems = [
    {
      label: isSpanish ? "Resumen Global" : "Global Overview",
      icon: LayoutDashboard,
      href: "/admin",
      description: isSpanish ? "Vista general del sistema" : "System overview"
    },
    {
      label: isSpanish ? "Gestión de Médicos" : "Manage Doctors",
      icon: Users,
      href: "/admin/professionals",
      description: isSpanish ? "Gestión y verificación" : "Management & verification",
    },
    {
      label: isSpanish ? "Gestión de Pacientes" : "Manage Patients",
      icon: Users,
      href: "/admin/users",
      description: isSpanish ? "Gestión de cuentas" : "Account management",
    },
    {
      label: isSpanish ? "Finanzas" : "Finances",
      icon: CreditCard,
      href: "/admin/finances",
      description: isSpanish ? "Dashboard de ingresos y KPIs" : "Revenue dashboard & KPIs"
    },
    {
      label: isSpanish ? "Verificaciones" : "Verifications",
      icon: UserCheck,
      href: "/admin/verifications",
      description: isSpanish ? "Cola de verificación KYP" : "KYP verification queue"
    },
  ] as { label: string, icon: any, href: string, description: string, badge?: number }[]

  const secondaryMenuItems = [
    {
      label: isSpanish ? "Configuración del Sistema" : "System Settings",
      icon: Settings,
      href: "/admin/settings",
    },
  ]

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="h-16 px-6 flex items-center border-b border-slate-800">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight">NUREA</span>
              <span className="text-teal-400 font-bold ml-1">Admin</span>
            </div>
          </Link>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative",
                    isActive
                      ? "bg-teal-500/20 text-teal-400"
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-teal-400 rounded-r-full" />
                  )}
                  <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-teal-400" : "text-slate-500 group-hover:text-white")} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{item.label}</span>
                      {item.badge && (
                        <Badge className="bg-red-500 hover:bg-red-500 text-white text-[10px] px-1.5 py-0 h-5">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-xs text-slate-500 truncate">{item.description}</p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Secondary Navigation */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              {isSpanish ? "Sistema" : "System"}
            </p>
            <div className="space-y-1">
              {secondaryMenuItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all",
                      isActive
                        ? "bg-slate-800 text-white"
                        : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-900/50">
            <Avatar className="h-9 w-9 border border-slate-700">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-teal-600 text-white text-sm">
                {user?.user_metadata?.first_name?.[0] || "A"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.user_metadata?.first_name || "Admin"}
              </p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => signOut()}
              className="shrink-0 text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay para móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between h-full px-4 sm:px-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              
              {/* Breadcrumb */}
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <Link href="/admin" className="text-muted-foreground hover:text-foreground">
                  Admin
                </Link>
                {pathname !== "/admin" && (
                  <>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {pathname.split("/").pop()?.charAt(0).toUpperCase()}
                      {pathname.split("/").pop()?.slice(1)}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      3
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>
                    {isSpanish ? "Notificaciones" : "Notifications"}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="py-3">
                    <div className="flex gap-3">
                      <div className="w-2 h-2 mt-2 rounded-full bg-teal-500" />
                      <div>
                        <p className="text-sm font-medium">
                          {isSpanish ? "Nuevo profesional pendiente" : "New professional pending"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {isSpanish ? "Hace 5 minutos" : "5 minutes ago"}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="py-3">
                    <div className="flex gap-3">
                      <div className="w-2 h-2 mt-2 rounded-full bg-amber-500" />
                      <div>
                        <p className="text-sm font-medium">
                          {isSpanish ? "Ticket de soporte abierto" : "Support ticket opened"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {isSpanish ? "Hace 15 minutos" : "15 minutes ago"}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Quick Actions */}
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="hidden sm:flex rounded-xl">
                  {isSpanish ? "Ir a NUREA" : "Go to NUREA"}
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
