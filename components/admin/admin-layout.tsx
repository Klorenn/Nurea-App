"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  Shield, 
  Users, 
  Calendar, 
  CreditCard, 
  MessageSquare,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  UserCheck,
  Settings
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useLanguage } from "@/contexts/language-context"
import { useTranslations } from "@/lib/i18n"

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()
  const { signOut } = useAuth()
  const { language } = useLanguage()
  const t = useTranslations(language)
  const isSpanish = language === "es"
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const menuItems = [
    {
      label: isSpanish ? "Resumen" : "Overview",
      icon: LayoutDashboard,
      href: "/admin",
    },
    {
      label: isSpanish ? "Soporte" : "Support",
      icon: MessageSquare,
      href: "/admin/support",
    },
    {
      label: isSpanish ? "Usuarios" : "Users",
      icon: Users,
      href: "/admin/users",
    },
    {
      label: isSpanish ? "Profesionales" : "Professionals",
      icon: UserCheck,
      href: "/admin/professionals",
    },
    {
      label: isSpanish ? "Pacientes" : "Patients",
      icon: Users,
      href: "/admin/patients",
    },
    {
      label: isSpanish ? "Pagos" : "Payments",
      icon: CreditCard,
      href: "/admin/payments",
    },
    {
      label: isSpanish ? "Configuración Global" : "Global Settings",
      icon: Settings,
      href: "/admin/settings",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-card sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <Link href="/admin" className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">NUREA Admin</span>
            </Link>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut()}
            className="rounded-xl"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {isSpanish ? "Salir" : "Sign Out"}
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed lg:static inset-y-0 left-0 z-40 w-64 border-r border-border/40 bg-card transform transition-transform duration-200 ease-in-out lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <nav className="p-4 space-y-2 mt-4">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                    isActive
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Overlay para móvil */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

