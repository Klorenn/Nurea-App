"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { RouteGuard } from "@/components/auth/route-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Users, UserCheck, MessageSquare, CreditCard, Calendar, TrendingUp, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"
import { motion, type Variants } from "framer-motion"

export default function AdminPage() {
  const { language } = useLanguage()
  const isSpanish = language === "es"
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProfessionals: 0,
    totalPatients: 0,
    pendingVerifications: 0,
    openTickets: 0,
    totalPayments: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setLoading(true)
    try {
      // Cargar estadísticas
      const [usersRes, professionalsRes, ticketsRes, paymentsRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/professionals?verified=false"),
        fetch("/api/admin/tickets?status=open"),
        fetch("/api/admin/payments"),
      ])

      const usersData = await usersRes.json()
      const professionalsData = await professionalsRes.json()
      const ticketsData = await ticketsRes.json()
      const paymentsData = await paymentsRes.json()

      if (usersData.success) {
        const users = usersData.users || []
        setStats({
          totalUsers: users.length,
          totalProfessionals: users.filter((u: any) => u.role === "professional").length,
          totalPatients: users.filter((u: any) => u.role === "patient").length,
          pendingVerifications: professionalsData.success ? professionalsData.count || 0 : 0,
          openTickets: ticketsData.success ? ticketsData.count || 0 : 0,
          totalPayments: paymentsData.success ? (paymentsData.payments || []).length : 0,
        })
      }
    } catch (error) {
      console.error("Error loading stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    {
      title: isSpanish ? "Soporte" : "Support",
      description: isSpanish ? "Gestionar tickets de soporte" : "Manage support tickets",
      icon: MessageSquare,
      href: "/admin/support",
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-50 dark:bg-orange-950/20",
      badge: stats.openTickets > 0 ? stats.openTickets : undefined,
    },
    {
      title: isSpanish ? "Usuarios" : "Users",
      description: isSpanish ? "Ver y gestionar usuarios" : "View and manage users",
      icon: Users,
      href: "/admin/users",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/20",
    },
    {
      title: isSpanish ? "Profesionales" : "Professionals",
      description: isSpanish ? "Verificar profesionales" : "Verify professionals",
      icon: UserCheck,
      href: "/admin/professionals",
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-950/20",
      badge: stats.pendingVerifications > 0 ? stats.pendingVerifications : undefined,
    },
    {
      title: isSpanish ? "Pacientes" : "Patients",
      description: isSpanish ? "Ver lista de pacientes" : "View patient list",
      icon: Users,
      href: "/admin/patients",
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-950/20",
    },
    {
      title: isSpanish ? "Pagos" : "Payments",
      description: isSpanish ? "Ver historial de pagos" : "View payment history",
      icon: CreditCard,
      href: "/admin/payments",
      color: "text-teal-600 dark:text-teal-400",
      bg: "bg-teal-50 dark:bg-teal-950/20",
    },
    {
      title: isSpanish ? "Configuración" : "Settings",
      description: isSpanish ? "Configuración global" : "Global settings",
      icon: Shield,
      href: "/admin/settings",
      color: "text-gray-600 dark:text-gray-400",
      bg: "bg-gray-50 dark:bg-gray-950/20",
    },
  ]

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 } as any,
    },
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      } as any,
    },
  }

  return (
    <RouteGuard requiredRole="admin">
      <AdminLayout>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              {isSpanish ? "Panel de Administración" : "Admin Panel"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isSpanish 
                ? "Panel de control para gestionar NUREA"
                : "Control panel to manage NUREA"}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <motion.div variants={itemVariants}>
              <Card className="border-primary/10 bg-gradient-to-br from-primary/5 via-background to-transparent">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {isSpanish ? "Total Usuarios" : "Total Users"}
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalPatients} {isSpanish ? "pacientes" : "patients"}, {stats.totalProfessionals} {isSpanish ? "profesionales" : "professionals"}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border-primary/10 bg-gradient-to-br from-primary/5 via-background to-transparent">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {isSpanish ? "Verificaciones Pendientes" : "Pending Verifications"}
                  </CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingVerifications}</div>
                  <p className="text-xs text-muted-foreground">
                    {isSpanish ? "Profesionales por verificar" : "Professionals to verify"}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border-primary/10 bg-gradient-to-br from-primary/5 via-background to-transparent">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {isSpanish ? "Tickets Abiertos" : "Open Tickets"}
                  </CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.openTickets}</div>
                  <p className="text-xs text-muted-foreground">
                    {isSpanish ? "Requieren atención" : "Require attention"}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border-primary/10 bg-gradient-to-br from-primary/5 via-background to-transparent">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {isSpanish ? "Total Pagos" : "Total Payments"}
                  </CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalPayments}</div>
                  <p className="text-xs text-muted-foreground">
                    {isSpanish ? "Transacciones registradas" : "Registered transactions"}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-xl font-bold mb-4">
              {isSpanish ? "Acciones Rápidas" : "Quick Actions"}
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {quickActions.map((action, index) => {
                const Icon = action.icon
                return (
                  <motion.div key={action.href} variants={itemVariants}>
                    <Link href={action.href}>
                      <Card className="border-border/40 hover:shadow-lg transition-all cursor-pointer h-full relative">
                        {action.badge && (
                          <div className="absolute top-4 right-4">
                            <Badge variant="destructive" className="rounded-full">
                              {action.badge}
                            </Badge>
                          </div>
                        )}
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
                  </motion.div>
                )
              })}
            </div>
          </div>
        </motion.div>
      </AdminLayout>
    </RouteGuard>
  )
}
