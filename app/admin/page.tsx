"use client"

import { AdminLayout } from "@/components/admin/admin-layout"
import { RouteGuard } from "@/components/auth/route-guard"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Users, Calendar, CreditCard, MessageSquare } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"

export default function AdminPage() {
  const { language } = useLanguage()
  const isSpanish = language === "es"

  const quickActions = [
    {
      title: isSpanish ? "Usuarios" : "Users",
      description: isSpanish ? "Ver y gestionar usuarios" : "View and manage users",
      icon: Users,
      href: "/admin/users",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/20",
    },
    {
      title: isSpanish ? "Citas" : "Appointments",
      description: isSpanish ? "Ver todas las citas" : "View all appointments",
      icon: Calendar,
      href: "/admin/appointments",
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-950/20",
    },
    {
      title: isSpanish ? "Pagos" : "Payments",
      description: isSpanish ? "Ver historial de pagos" : "View payment history",
      icon: CreditCard,
      href: "/admin/payments",
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-950/20",
    },
    {
      title: isSpanish ? "Soporte" : "Support",
      description: isSpanish ? "Gestionar consultas de soporte" : "Manage support inquiries",
      icon: MessageSquare,
      href: "/admin/support",
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-50 dark:bg-orange-950/20",
    },
  ]

  return (
    <RouteGuard requiredRole="admin">
      <AdminLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              {isSpanish ? "Panel de Administración" : "Admin Panel"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isSpanish 
                ? "Panel de control simple para gestionar NUREA"
                : "Simple control panel to manage NUREA"}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link key={action.href} href={action.href}>
                  <Card className="border-border/40 hover:shadow-lg transition-all cursor-pointer h-full">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl ${action.bg} ${action.color} flex items-center justify-center shrink-0`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-1">{action.title}</h3>
                          <p className="text-sm text-muted-foreground">{action.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </AdminLayout>
    </RouteGuard>
  )
}
